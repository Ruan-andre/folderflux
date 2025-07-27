import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const SettingsTable = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", {
    enum: ["general", "appearance"],
  }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export type SettingsSchema = typeof SettingsTable.$inferSelect;
export type NewSettings = typeof SettingsTable.$inferInsert;
