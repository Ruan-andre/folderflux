import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const rules = sqliteTable("rules", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const conditions = sqliteTable("conditions", {
  id: integer("id").primaryKey(),
  type: text("name").notNull().unique(),
  description: text("description"),
});
