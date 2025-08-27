import { ipcMain } from "electron";
import { getSettings, toggleSettingActive } from "../../services/settingsService";
import { SettingsSchema } from "../../../db/schema";
import { db } from "../../../db";

export function registerSettingsHandlers() {
  ipcMain.handle("get-settings", async () => {
    return await getSettings(db);
  });
  ipcMain.handle("toggle-setting-active", async (_e, id: number, type: SettingsSchema["type"]) => {
    return await toggleSettingActive(db, id, type);
  });
}
