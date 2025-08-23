import { ipcMain } from "electron";
import { getSettings, toggleSettingActive } from "../../services/settingsService";
import { SettingsSchema } from "~/src/db/schema";

export function registerSettingsHandlers() {
  ipcMain.handle("get-settings", async () => {
    return await getSettings();
  });
  ipcMain.handle("toggle-setting-active", async (_e, id: number, type?: SettingsSchema["type"]) => {
    return await toggleSettingActive(id, type);
  });
}
