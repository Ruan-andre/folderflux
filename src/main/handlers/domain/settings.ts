import { ipcMain } from "electron";
import { getSettings, toggleSettingActive } from "../../services/settingsService";

export function registerSettingsHandlers() {
  ipcMain.handle("get-settings", async () => {
    return await getSettings();
  });
  ipcMain.handle("toggle-setting-active", async (_e, id: number) => {
    return await toggleSettingActive(id);
  });
}
