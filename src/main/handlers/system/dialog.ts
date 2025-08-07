import { ipcMain, dialog, BrowserWindow } from "electron";

export function registerDialogHandlers() {
  ipcMain.handle("select-directory", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"],
      });

      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    }
  });

  ipcMain.handle("select-multiple-directories", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory", "multiSelections"],
      });

      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths;
    }
  });
}
