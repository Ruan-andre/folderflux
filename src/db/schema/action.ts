import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { rule } from "../schema/rule";

export const actionTable = sqliteTable("action", {
  id: integer("id").primaryKey().unique(),
  type: text("type").notNull(),
  value: text("value"),
  ruleId: integer("rule_id")
    .references(() => rule.id, { onDelete: "cascade" })
    .notNull(),
});

export type Action = typeof actionTable.$inferSelect;
export type NewAction = typeof actionTable.$inferInsert;
