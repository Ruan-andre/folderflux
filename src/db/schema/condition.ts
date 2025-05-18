import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { rule } from "../schema/rule";

export const condition = sqliteTable("condition", {
  id: integer("id").primaryKey().unique(),
  type: text("name").notNull(),
  description: text("description"),
  ruleId: integer("rule_id")
    .references(() => rule.id, { onDelete: "cascade" })
    .notNull(),
});

export type Condition = typeof condition.$inferSelect;
export type NewCondition = typeof condition.$inferInsert;
