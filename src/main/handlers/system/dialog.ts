import { ipcMain, dialog, BrowserWindow, app } from "electron";
import path from "path";

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

  ipcMain.handle("select-multiple-directories", async (event, isTutorialPath) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      let tutorialDir;
      if (isTutorialPath) {
        const publicPath = app.isPackaged
          ? path.join(process.resourcesPath)
          : path.join(app.getAppPath(), "public");

        tutorialDir = path.join(publicPath, "tutorial-example");
      }

      const result = await dialog.showOpenDialog(win, {
        properties: ["openDirectory", "multiSelections"],
        defaultPath: tutorialDir,
      });

      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths;
    }
  });
}
