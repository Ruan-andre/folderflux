import { ipcMain, dialog } from "electron";

export function registerDialogHandlers() {
  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("select-multiple-directories", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "multiSelections"],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths;
  });
}
