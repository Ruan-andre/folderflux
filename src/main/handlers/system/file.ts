import { ipcMain } from "electron";
import { getFilesInfo, getStats, isDirectory, moveFile } from "../../services/system/fileService";

export function registerFileHandlers() {
  ipcMain.handle("fs:get-files-info", async (_e, path: string) => {
    return await getFilesInfo(path);
  });

  ipcMain.handle("fs:move-file", async (_e, path: string, newPath: string) => {
    return await moveFile(path, newPath);
  });

  ipcMain.handle("fs:is-directory", async (event, path) => {
    return await isDirectory(path);
  });

  ipcMain.handle("fs:get-stats", async (event, paths: string[]) => {
    return await getStats(paths);
  });
}
