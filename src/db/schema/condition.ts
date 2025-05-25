import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { rule } from "../schema/rule";
import { ConditionsType } from "~/src/renderer/src/types/ConditionsType";

export const conditionTable = sqliteTable("condition", {
  id: integer("id").primaryKey().unique(),
  type: text("type", {
    enum: ["fileName", "fileExtension", "modifiedDate", "fileDirectory", "fileLength"],
  }).notNull(),
  typeAction: text("type_action", {
    enum: ["contains", "notContains", "startsWith", "endsWith", "equals"],
  }).notNull(),
  value: text("value"),
  ruleId: integer("rule_id")
    .references(() => rule.id, { onDelete: "cascade" })
    .notNull(),
});

export type Condition = typeof conditionTable.$inferSelect;
export type NewCondition = Omit<typeof conditionTable.$inferInsert, "type" | "typeAction"> & ConditionsType;
