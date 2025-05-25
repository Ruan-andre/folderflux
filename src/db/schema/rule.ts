import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const rule = sqliteTable("rule", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description", { length: 150 }),
  extensions: text("extensions"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export type Rule = typeof rule.$inferSelect;
export type NewRule = typeof rule.$inferInsert;
