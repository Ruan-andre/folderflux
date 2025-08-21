import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { RuleTable } from "./rules";

import { relations } from "drizzle-orm";
import { ActionsType, ActionsTypeValues } from "../../shared/types/ActionsType";

export const ActionTable = sqliteTable("actions", {
  id: integer("id").primaryKey(),
  type: text("type", { enum: ActionsTypeValues }).notNull(),
  value: text("value"),
  ruleId: integer("rule_id")
    .references(() => RuleTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const actionRelations = relations(ActionTable, ({ one }) => ({
  rule: one(RuleTable, {
    fields: [ActionTable.ruleId],
    references: [RuleTable.id],
  }),
}));

export type ActionSchema = typeof ActionTable.$inferSelect;
export type NewAction = Omit<typeof ActionTable.$inferInsert, "type"> & ActionsType;
