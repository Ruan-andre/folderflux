import { BrowserWindow, ipcMain } from "electron";
import { MainLogger } from "electron-log";
import { AppUpdater } from "electron-updater";
import { getSettingStatusByType } from "../../../services/domain/settingsService";
import { db } from "../../../../db";

export function registerElectronUpdaterHandlers(
  autoUpdater: AppUpdater,
  mainWindow: BrowserWindow | null,
  updateWindow: BrowserWindow | null,
  log: MainLogger
) {
  autoUpdater.on("update-available", async (info) => {
    log.info("Update available.", info);
    const autoUpdateSetting = await getSettingStatusByType(db, "autoUpdate");
    if (!autoUpdateSetting) {
      if (updateWindow) {
        updateWindow?.close();
      }
      if (mainWindow) {
        mainWindow.show();
        mainWindow?.webContents.send("update-available", info.version);
      }
    }
  });

  autoUpdater.on("update-not-available", () => {
    log.info("Update not available.");
    updateWindow?.close();
    mainWindow?.show();
  });

  autoUpdater.on("update-downloaded", async (info) => {
    log.info("Update downloaded.");
    const autoUpdateSetting = await getSettingStatusByType(db, "autoUpdate");

    const releaseNotes = info.releaseNotes?.toString().toLowerCase() || "";

    if (releaseNotes.includes("[critical]")) {
      log.info("Critical update detected. Forcing restart.");
      autoUpdater.quitAndInstall(true, true);
    } else if (!autoUpdateSetting) {
      log.info("Standard update. Notifying user to install.");
      if (mainWindow) {
        if (mainWindow.webContents.isLoading()) {
          mainWindow.webContents.once("did-finish-load", () => {
            mainWindow.webContents.send("update-downloaded");
          });
        } else {
          mainWindow.webContents.send("update-downloaded");
        }
        if (updateWindow) {
          updateWindow.close();
        }
      }
    } else {
      log.info("Auto-update is enabled. Installing update.");
      autoUpdater.quitAndInstall(true, true);
    }
  });

  autoUpdater.on("error", (err) => {
    log.error("Erro no autoUpdater: ", err);

  
    const resumeMain = () => {
      try {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send("update-error", {
          message: err instanceof Error ? err.message : String(err),
        });
      } catch (e) {
        log.warn("Falha ao retomar janela principal após erro do updater:", e);
      }
    };

    if (mainWindow) {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once("did-finish-load", resumeMain);
      } else {
        resumeMain();
      }
    }
  });

  ipcMain.on("download-update", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on("install-update", () => {
    mainWindow?.hide();
    autoUpdater.quitAndInstall(true, true);
  });
}
