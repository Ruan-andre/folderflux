import { count } from "drizzle-orm";
import { db } from "../../db";
import { NewSettings, SettingsSchema, SettingsTable } from "../../db/schema";

export async function getSystemSettingsCount(): Promise<number> {
  return (await db.select({ value: count() }).from(SettingsTable))[0].value;
}
export async function getSettings(): Promise<SettingsSchema[]> {
  return await db.select().from(SettingsTable);
}
export async function createSettings(settings: NewSettings[]) {
  await db.insert(SettingsTable).values(settings);
}
