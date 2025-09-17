import { count, eq } from "drizzle-orm";
import { NewSettings, SettingsSchema, SettingsTable } from "../../../db/schema";
import { DbResponse } from "../../../shared/types/DbResponse";
import { toggleColumnStatus } from "../../../db/functions";
import AutoLaunch from "auto-launch";
import { app } from "electron";
import { is } from "@electron-toolkit/utils";
import { folderMonitorService } from "../../core/folderMonitorService";
import { DbOrTx } from "../../../db";

export async function getSystemSettingsCount(db: DbOrTx): Promise<number> {
  return (await db.select({ value: count() }).from(SettingsTable))[0].value;
}
export async function getSettings(db: DbOrTx): Promise<SettingsSchema[]> {
  return await db.select().from(SettingsTable);
}

export async function getSettingByType(db: DbOrTx, type: SettingsSchema["type"]) {
  return await db.query.SettingsTable.findFirst({ where: eq(SettingsTable.type, type) });
}

export async function getSettingStatusByType(db: DbOrTx, type: SettingsSchema["type"]) {
  const setting = await db.query.SettingsTable.findFirst({ where: eq(SettingsTable.type, type) });
  return setting?.isActive ?? false;
}

export async function createSettings(db: DbOrTx, settings: NewSettings[]) {
  for (const setting of settings) {
    const exists = await db
      .select({ count: count() })
      .from(SettingsTable)
      .where(eq(SettingsTable.type, setting.type));
    if (exists[0].count === 0) await db.insert(SettingsTable).values(setting);
  }
}

export async function toggleSettingActive(
  db: DbOrTx,
  id: number,
  type: SettingsSchema["type"]
): Promise<DbResponse> {
  const response = await toggleColumnStatus(db, SettingsTable, id);
  switch (type) {
    case "startWithOS": {
      const settingInitialization = await getSettingByType(db, "startWithOS");
      if (id === settingInitialization?.id && settingInitialization?.isActive) enableLaunchOnLogin();
      else disableLaunchOnLogin();
      break;
    }
    case "realTime": {
      const settingRealTimeMonitoring = await getSettingByType(db, "realTime");
      if (settingRealTimeMonitoring?.isActive) await folderMonitorService.start(db);
      else if (!settingRealTimeMonitoring?.isActive) folderMonitorService.stopMonitoringAll();
      break;
    }
    default:
      break;
  }
  return response;
}

const appLauncher = new AutoLaunch({
  name: "FolderFlux",
  path: app.getPath("exe"),
});

/**
 * Ativa a inicialização do aplicativo com o sistema operacional.
 */
async function enableLaunchOnLogin(): Promise<void> {
  await appLauncher.enable();
}

/**
 * Desativa a inicialização do aplicativo com o sistema operacional.
 */
async function disableLaunchOnLogin(): Promise<void> {
  await appLauncher.disable();
}

export async function syncAppSettings(db: DbOrTx) {
  try {
    if (!is.dev) {
      const startWithOSSetting = await db
        .select()
        .from(SettingsTable)
        .where(eq(SettingsTable.type, "startWithOS"))
        .limit(1);

      if (startWithOSSetting && startWithOSSetting.length > 0) {
        const isActive = startWithOSSetting[0].isActive;
        if (isActive) {
          enableLaunchOnLogin();
        } else {
          disableLaunchOnLogin();
        }
      }
    }
  } catch (error) {
    console.error("Falha ao sincronizar as configurações na inicialização:", error);
  }
}
