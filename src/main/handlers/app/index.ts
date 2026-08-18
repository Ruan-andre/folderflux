import { app, BrowserWindow, ipcMain } from "electron";

export function registerAppHandlers() {
  ipcMain.handle("app:is-packaged", () => app.isPackaged);

  ipcMain.handle("app:get-version", () => app.getVersion());

  // O renderer captura F5/CTRL+R e pede o reload por IPC, em vez de atalho global.
  ipcMain.on("window:reload", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.reload();
  });
}
