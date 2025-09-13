import { BrowserWindow, ipcMain } from "electron";
import { MainLogger } from "electron-log";
import { AppUpdater } from "electron-updater";

export function registerElectronUpdaterHandlers(
  autoUpdater: AppUpdater,
  mainWindow: BrowserWindow | null,
  log: MainLogger
) {
  autoUpdater.on("update-available", (info) => {
    log.info("Update available.", info);
    mainWindow?.webContents.send("update-available", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    log.info("Update not available.");
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded.");

    const releaseNotes = info.releaseNotes?.toString().toLowerCase() || "";

    if (releaseNotes.includes("[critical]")) {
      log.info("Critical update detected. Forcing restart.");
      autoUpdater.quitAndInstall(true, true);
    } else {
      log.info("Standard update. Notifying user to install.");
      mainWindow?.webContents.send("update-downloaded");
    }
  });

  autoUpdater.on("error", (err) => {
    log.error("Erro no autoUpdater: ", err);
  });

  ipcMain.on("download-update", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on("install-update", () => {
    autoUpdater.quitAndInstall(true, true);
  });
}
