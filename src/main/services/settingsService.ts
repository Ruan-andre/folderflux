import { count, eq } from "drizzle-orm";
import { db } from "../../db";
import { NewSettings, SettingsSchema, SettingsTable } from "../../db/schema";
import { DbResponse } from "../../shared/types/DbResponse";
import { toggleColumnStatus } from "../../db/functions";
import AutoLaunch from "auto-launch";
import { app } from "electron";

export async function getSystemSettingsCount(): Promise<number> {
  return (await db.select({ value: count() }).from(SettingsTable))[0].value;
}
export async function getSettings(): Promise<SettingsSchema[]> {
  return await db.select().from(SettingsTable);
}

export async function getSettingByType(type: SettingsSchema["type"]) {
  return await db.query.SettingsTable.findFirst({ where: eq(SettingsTable.type, type) });
}
export async function createSettings(settings: NewSettings[]) {
  await db.insert(SettingsTable).values(settings);
}

export async function toggleSettingActive(id: number, type?: SettingsSchema["type"]): Promise<DbResponse> {
  const response = await toggleColumnStatus(SettingsTable, id);
  if (type && type === "startWithOS") {
    const settingInitialization = await getSettingByType("startWithOS");
    if (id === settingInitialization?.id && settingInitialization?.isActive) enableLaunchOnLogin();
    else disableLaunchOnLogin();
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
export async function enableLaunchOnLogin(): Promise<void> {
  await appLauncher.enable();
}

/**
 * Desativa a inicialização do aplicativo com o sistema operacional.
 */
export async function disableLaunchOnLogin(): Promise<void> {
  await appLauncher.disable();
}

/**
 * Verifica se a inicialização automática está atualmente ativada.
 * @returns `true` se estiver ativado, `false` caso contrário.
 */
export async function isLaunchOnLoginEnabled(): Promise<boolean> {
  return await appLauncher.isEnabled();
}
