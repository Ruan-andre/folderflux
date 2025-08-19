import { count, eq } from "drizzle-orm";
import { db } from "../../db";
import { NewSettings, SettingsSchema, SettingsTable } from "../../db/schema";
import { DbResponse } from "../../shared/types/DbResponse";
import { toggleColumnStatus } from "../../db/functions";

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

export async function toggleSettingActive(id: number): Promise<DbResponse> {
  return toggleColumnStatus(SettingsTable, id);
}
