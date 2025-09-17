import FileInfo from "~/src/shared/types/FileInfo";
import path from "path";
import * as fs from "fs";
import { friendlyFsError } from "../../../shared/functions/handleFsErrorMessage";

export async function getFilesInfo(directoryPath: string): Promise<FileInfo[] | undefined> {
  try {
    const files = await fs.promises.readdir(directoryPath);

    if (files && files.length > 0) {
      const statsPromises = files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        try {
          const stats = await fs.promises.stat(filePath);
          if (!stats.isDirectory()) {
            return {
              name: path.parse(filePath).name,
              nameWithExtension: file,
              size: stats.size,
              ctime: stats.ctime,
              mtime: stats.mtime,
              fullPath: filePath,
              parentDirectory: directoryPath,
              extension: path.extname(filePath),
            };
          }
        } catch (err: any) {
          if (err && (err.code === "EPERM" || err.code === "EACCES")) {
            // Ignora arquivos/pastas protegidos
            return null;
          }
          return null;
        }
        return null;
      });

      const allResults = await Promise.allSettled(statsPromises);

      const successfulFiles: FileInfo[] = [];

      allResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value) {
            successfulFiles.push(result.value);
          }
        }
      });
      return successfulFiles;
    }

    return [];
  } catch (error) {
    // Ignora erro de permissão na pasta raiz
    if ((error && (error as any).code === "EPERM") || (error as any).code === "EACCES") {
      return [];
    }
    console.error(`[DEBUG] Erro crítico em getFilesInfo para ${directoryPath}:`, error);
    return [];
  }
}

export async function moveFile(filePath: string, newPath: string) {
  const destinationFolder = path.dirname(newPath);
  try {
    await fs.promises.mkdir(destinationFolder, { recursive: true });
  } catch (error) {
    throw `Não foi possível criar o diretório: ${destinationFolder}. Erro: ${error}`;
  }

  if (fs.existsSync(newPath)) {
    throw `O arquivo já existe no diretório: ${destinationFolder}`;
  }

  try {
    await fs.promises.rename(filePath, newPath);
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code) {
      const fsErr = error as NodeJS.ErrnoException;
      if (fsErr.code === "EXDEV") {
        // fallback: origem e destino em discos diferentes
        try {
          await fs.promises.copyFile(filePath, newPath);
          await fs.promises.unlink(filePath);
          console.log(`Arquivo copiado e removido: ${filePath} -> ${newPath}`);
        } catch (copyErr) {
          throw friendlyFsError(copyErr);
        }
      } else {
        throw friendlyFsError(error);
      }
    }
  }
}

export async function copyFile(srcPath: string, destPath: string) {
  const destinationFolder = path.dirname(destPath);
  try {
    await fs.promises.mkdir(destinationFolder, { recursive: true });
  } catch (error) {
    throw new Error(`Não foi possível criar o diretório: ${destinationFolder}. Erro: ${error}`);
  }
  if (!fs.existsSync(destPath)) {
    try {
      await fs.promises.copyFile(srcPath, destPath);
    } catch (error) {
      return friendlyFsError(error);
    }
  } else throw `Arquivo já existe no diretório ${destinationFolder}`;
}

export async function deleteFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.rm(filePath).catch((err) => {
        if (err && (err.code === "EPERM" || err.code === "EACCES")) {
          // Ignora arquivos protegidos
          return;
        }
      });
    }
  } catch (err: any) {
    if (err && (err.code === "EPERM" || err.code === "EACCES")) {
      // Ignora arquivos protegidos
      return;
    }
  }
}
export async function isDirectory(path: string) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e: any) {
    if (e && (e.code === "EPERM" || e.code === "EACCES")) {
      // Ignora arquivos protegidos
      return false;
    }
    return false;
  }
}

export async function getStats(paths: string[]) {
  const results: { path: string; isDirectory: boolean; name: string }[] = [];
  for (const p of paths) {
    try {
      const stat = fs.statSync(p);
      results.push({
        path: p,
        isDirectory: stat.isDirectory(),
        name: path.basename(p),
      });
    } catch (e: any) {
      if (e && (e.code === "EPERM" || e.code === "EACCES")) {
        console.debug(`[getStats] Ignorado por permissão: ${p}`);
        continue;
      }
    }
  }
  return results;
}
