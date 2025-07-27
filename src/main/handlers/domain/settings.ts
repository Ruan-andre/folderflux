import { ipcMain } from "electron";
import { getSettings } from "../../services/settingsService";

export function registerSettingsHandlers() {
  ipcMain.handle("get-settings", async () => {
    return await getSettings();
  });
}
