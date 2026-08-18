import DirInfo from "~/src/shared/types/DirInfo";
import path from "path";
import * as fs from "fs";
import { friendlyFsError } from "../../../shared/functions/handleFsErrorMessage";
import { fsErrorCode, isExpectedFsError, isPermissionError } from "./fsErrors";

const DIR_SIZE_CONCURRENCY = 8;
const DIR_SIZE_BATCH = 4;

export async function getSingleDirInfo(dirPath: string): Promise<DirInfo | null> {
  try {
    const stats = await fs.promises.stat(dirPath);
    if (stats.isDirectory()) {
      const children = await fs.promises.readdir(dirPath);
      return {
        name: path.basename(dirPath),
        fullPath: dirPath,
        parentDirectory: path.dirname(dirPath),
        size: 0,
        itemCount: children.length,
        isEmpty: children.length === 0,
        ctime: stats.ctime,
        mtime: stats.mtime,
      } as DirInfo;
    }
  } catch (error) {
    if (!isExpectedFsError(error)) {
      console.error(`[dirService] Erro em getSingleDirInfo para ${dirPath}:`, error);
    }
  }
  return null;
}

/**
 * Retorna informações dos subdiretórios diretos. `size` vem como 0: o cálculo
 * é caro e só acontece sob demanda, via `populateDirSizes`.
 */
export async function getDirsInfo(directoryPath: string): Promise<DirInfo[]> {
  try {
    const entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    const dirEntries = entries.filter((e) => e.isDirectory());

    const results = await Promise.all(
      dirEntries.map(async (entry) => {
        const fullPath = path.join(directoryPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          const children = await fs.promises.readdir(fullPath);
          return {
            name: entry.name,
            fullPath,
            parentDirectory: directoryPath,
            size: 0,
            itemCount: children.length,
            isEmpty: children.length === 0,
            ctime: stats.ctime,
            mtime: stats.mtime,
          } as DirInfo;
        } catch (error) {
          if (!isExpectedFsError(error)) {
            console.debug(`[dirService] Ignorado em getDirsInfo: ${fullPath}`, error);
          }
          return null;
        }
      })
    );

    return results.filter((dir): dir is DirInfo => dir !== null);
  } catch (error) {
    if (!isExpectedFsError(error)) {
      console.error(`[dirService] Erro em getDirsInfo para ${directoryPath}:`, error);
    }
    return [];
  }
}

type DirScanResult = { size: number; subdirectories: string[] };

async function scanDirectoryLevel(dirPath: string, visited: Set<string>): Promise<DirScanResult> {
  const subdirectories: string[] = [];
  let size = 0;

  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (!isExpectedFsError(error)) {
      console.debug(`[dirService] Ignorado em getDirSize: ${dirPath}`, error);
    }
    return { size, subdirectories };
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    try {
      // lstat não segue links: um symlink conta como link, não como o alvo.
      const stats = await fs.promises.lstat(fullPath, { bigint: true });
      if (stats.isSymbolicLink()) continue;

      // Junctions do Windows e hardlinks fazem a mesma subárvore ou o mesmo
      // arquivo aparecerem em dois caminhos. `dev:ino` identifica o item real,
      // evitando ciclo infinito e contagem em dobro.
      const identity = `${stats.dev}:${stats.ino}`;
      if (stats.ino !== 0n) {
        if (visited.has(identity)) continue;
        visited.add(identity);
      }

      if (stats.isDirectory()) subdirectories.push(fullPath);
      else if (stats.isFile()) size += Number(stats.size);
    } catch (error) {
      if (!isExpectedFsError(error)) {
        console.debug(`[dirService] Ignorado em getDirSize: ${fullPath}`, error);
      }
    }
  }

  return { size, subdirectories };
}

/**
 * Tamanho total de um diretório, percorrendo a árvore inteira.
 *
 * Não há limite de profundidade: um limite devolve um número errado em silêncio.
 * A proteção contra árvore infinita vem da identidade `dev:ino`, não da altura.
 */
export async function getDirSize(dirPath: string): Promise<number> {
  const visited = new Set<string>();
  let pending = [dirPath];
  let totalSize = 0;

  while (pending.length > 0) {
    const batch = pending.splice(0, DIR_SIZE_CONCURRENCY);
    const results = await Promise.all(batch.map((dir) => scanDirectoryLevel(dir, visited)));
    for (const result of results) {
      totalSize += result.size;
      pending = pending.concat(result.subdirectories);
    }
  }

  return totalSize;
}

export async function populateDirSizes(dirs: DirInfo[]): Promise<void> {
  // Em lotes: cada getDirSize já abre vários descritores, e disparar todos de
  // uma vez em uma pasta com muitas subpastas estoura o limite do processo.
  for (let i = 0; i < dirs.length; i += DIR_SIZE_BATCH) {
    const batch = dirs.slice(i, i + DIR_SIZE_BATCH);
    await Promise.all(batch.map(async (dir) => (dir.size = await getDirSize(dir.fullPath))));
  }
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.promises.access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cria a pasta pai do destino e devolve a pasta mais alta que precisou ser
 * criada — ou `undefined` se nada foi criado. O retorno permite desfazer a
 * criação quando a operação seguinte falha, sem apagar pasta preexistente.
 */
async function ensureParentDirectory(destPath: string): Promise<string | undefined> {
  const destParent = path.dirname(destPath);
  try {
    return await fs.promises.mkdir(destParent, { recursive: true });
  } catch (error) {
    throw `Não foi possível criar o diretório: ${destParent}. Erro: ${error}`;
  }
}

async function discardCreatedDirectory(created: string | undefined): Promise<void> {
  if (!created) return;
  await fs.promises.rm(created, { recursive: true, force: true }).catch(() => undefined);
}

export async function deleteDir(dirPath: string): Promise<void> {
  try {
    if (!(await pathExists(dirPath))) return;
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    if (isPermissionError(error)) return;
    throw friendlyFsError(error);
  }
}

export async function moveDir(srcPath: string, destPath: string): Promise<void> {
  if (await pathExists(destPath)) {
    throw `Já existe um diretório no destino: ${destPath}`;
  }

  const createdParent = await ensureParentDirectory(destPath);

  try {
    await fs.promises.rename(srcPath, destPath);
  } catch (error) {
    if (fsErrorCode(error) === "EXDEV") {
      // Origem e destino em discos diferentes: copiar e deletar.
      try {
        await fs.promises.cp(srcPath, destPath, { recursive: true });
        await fs.promises.rm(srcPath, { recursive: true, force: true });
        return;
      } catch (copyErr) {
        await discardCreatedDirectory(createdParent);
        throw friendlyFsError(copyErr);
      }
    }
    await discardCreatedDirectory(createdParent);
    throw friendlyFsError(error);
  }
}

export async function copyDir(srcPath: string, destPath: string): Promise<void> {
  if (await pathExists(destPath)) {
    throw `Já existe um diretório no destino: ${destPath}`;
  }

  const createdParent = await ensureParentDirectory(destPath);

  try {
    await fs.promises.cp(srcPath, destPath, { recursive: true });
  } catch (error) {
    await discardCreatedDirectory(createdParent);
    throw friendlyFsError(error);
  }
}
