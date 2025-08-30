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
        const resourcesPath = app.isPackaged
          ? process.resourcesPath // Em produção, aponta para a pasta 'resources'
          : app.getAppPath(); // Em desenvolvimento, aponta para a raiz do projeto

        tutorialDir = path.join(resourcesPath, "resources", "tutorial-example");
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
