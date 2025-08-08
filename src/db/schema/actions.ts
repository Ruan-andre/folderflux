import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { RuleTable } from "./rules";
import { ActionsType } from "~/src/shared/types/ActionsType";
import { relations } from "drizzle-orm";

export const ActionTable = sqliteTable("actions", {
  id: integer("id").primaryKey(),
  type: text("type", { enum: ["move", "copy", "rename", "delete"] }).notNull(),
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
