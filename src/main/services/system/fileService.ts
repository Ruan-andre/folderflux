import FileInfo from "~/src/shared/types/FileInfo";
import path from "path";
import * as fs from "fs";
import { friendlyFsError } from "../../../shared/functions/handleFsErrorMessage";
import { PathStats } from "~/src/shared/types/pathStatsType";
import { fsErrorCode, isExpectedFsError, isPermissionError } from "./fsErrors";

function toFileInfo(filePath: string, stats: fs.Stats): FileInfo {
  return {
    name: path.parse(filePath).name,
    nameWithExtension: path.basename(filePath),
    size: stats.size,
    ctime: stats.ctime,
    mtime: stats.mtime,
    fullPath: filePath,
    parentDirectory: path.dirname(filePath),
    extension: path.extname(filePath),
  };
}

export async function getFileInfo(filePath: string): Promise<FileInfo | null> {
  try {
    const stats = await fs.promises.stat(filePath);
    if (!stats.isDirectory()) {
      return toFileInfo(filePath, stats);
    }
  } catch (error) {
    if (!isExpectedFsError(error)) {
      console.error(`[fileService] Erro em getFileInfo para ${filePath}:`, error);
    }
  }
  return null;
}

export async function getFilesInfo(directoryPath: string): Promise<FileInfo[]> {
  try {
    const entries = await fs.promises.readdir(directoryPath);
    if (entries.length === 0) return [];

    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        const filePath = path.join(directoryPath, entry);
        try {
          const stats = await fs.promises.stat(filePath);
          return stats.isDirectory() ? null : toFileInfo(filePath, stats);
        } catch (error) {
          // Arquivo protegido, link quebrado ou removido no meio da varredura.
          if (!isExpectedFsError(error)) {
            console.debug(`[fileService] Ignorado em getFilesInfo: ${filePath}`, error);
          }
          return null;
        }
      })
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<FileInfo | null> => r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value as FileInfo);
  } catch (error) {
    if (!isExpectedFsError(error)) {
      console.error(`[fileService] Erro crítico em getFilesInfo para ${directoryPath}:`, error);
    }
    return [];
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
 * Cria a pasta de destino e devolve a pasta mais alta que precisou ser criada —
 * ou `undefined` se nada foi criado. O retorno permite desfazer a criação
 * quando a operação seguinte falha, sem apagar pasta preexistente.
 */
async function ensureDestinationFolder(destPath: string): Promise<string | undefined> {
  const destinationFolder = path.dirname(destPath);
  try {
    return await fs.promises.mkdir(destinationFolder, { recursive: true });
  } catch (error) {
    throw `Não foi possível criar o diretório: ${destinationFolder}. Erro: ${error}`;
  }
}

async function discardCreatedDirectory(created: string | undefined): Promise<void> {
  if (!created) return;
  await fs.promises.rm(created, { recursive: true, force: true }).catch(() => undefined);
}

export async function moveFile(filePath: string, newPath: string): Promise<void> {
  if (await pathExists(newPath)) {
    throw `O arquivo já existe no diretório: ${path.dirname(newPath)}`;
  }

  const createdFolder = await ensureDestinationFolder(newPath);

  try {
    await fs.promises.rename(filePath, newPath);
  } catch (error) {
    if (fsErrorCode(error) === "EXDEV") {
      // Origem e destino em discos diferentes: copiar e remover.
      try {
        await fs.promises.copyFile(filePath, newPath);
        await fs.promises.unlink(filePath);
        return;
      } catch (copyErr) {
        await discardCreatedDirectory(createdFolder);
        throw friendlyFsError(copyErr);
      }
    }
    // Qualquer outra falha precisa propagar: se for engolida, o RuleEngine
    // registra a operação como sucesso no log de organização.
    await discardCreatedDirectory(createdFolder);
    throw friendlyFsError(error);
  }
}

export async function copyFile(srcPath: string, destPath: string): Promise<void> {
  if (await pathExists(destPath)) {
    throw `Arquivo já existe no diretório ${path.dirname(destPath)}`;
  }

  const createdFolder = await ensureDestinationFolder(destPath);

  try {
    await fs.promises.copyFile(srcPath, destPath);
  } catch (error) {
    await discardCreatedDirectory(createdFolder);
    throw friendlyFsError(error);
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (!(await pathExists(filePath))) return;
    await fs.promises.rm(filePath);
  } catch (error) {
    // Arquivos protegidos pelo SO são ignorados; o resto precisa propagar,
    // senão uma exclusão que falhou vira "espaço liberado" no log de limpeza.
    if (isPermissionError(error)) return;
    throw friendlyFsError(error);
  }
}

export async function isDirectory(targetPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(targetPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function getStats(paths: string[]): Promise<PathStats[]> {
  const results = await Promise.all(
    paths.map(async (p) => {
      try {
        const stat = await fs.promises.stat(p);
        return { path: p, isDirectory: stat.isDirectory(), name: path.basename(p) };
      } catch (error) {
        if (isPermissionError(error)) {
          console.debug(`[fileService] getStats ignorado por permissão: ${p}`);
        }
        return null;
      }
    })
  );

  return results.filter((r): r is PathStats => r !== null);
}
