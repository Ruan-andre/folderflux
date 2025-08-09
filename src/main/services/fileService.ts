import FileInfo from "~/src/shared/types/FileInfo";
import path from "path";
import * as fs from "fs";

export async function getFilesInfo(directoryPath: string): Promise<FileInfo[]> {
  const files = await fs.promises.readdir(directoryPath);

  const statsPromises = files.map(async (file) => {
    const filePath = path.join(directoryPath, file);
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
  });

  const allResults = await Promise.all(statsPromises);

  return allResults.filter((result) => result !== undefined);
}

export async function moveFile(filePath: string, newPath: string) {
  const destinationFolder = path.dirname(newPath);
  try {
    await fs.promises.mkdir(destinationFolder, { recursive: true });
  } catch (error) {
    throw new Error(`Não foi possível criar o diretório: ${destinationFolder}. Erro: ${error}`);
  }
  if (!fs.existsSync(newPath)) {
    fs.promises.rename(filePath, newPath);
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
    fs.promises.copyFile(srcPath, destPath);
  }
}

export async function deleteFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.promises.rm(filePath);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function isDirectory(path: string) {
  try {
    return fs.statSync(path).isDirectory();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}

export async function getStats(paths: string[]) {
  try {
    return paths.map((p) => ({
      path: p,
      isDirectory: fs.statSync(p).isDirectory(),
      name: path.basename(p),
    }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return []; // Retorna vazio se houver erro
  }
}
