import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { RuleTable } from "./rules";
import { ConditionTable } from "./conditions";

export const ConditionGroupTable = sqliteTable("condition_groups", {
  id: integer("id").primaryKey(),
  operator: text("operator", { enum: ["AND", "OR"] })
    .notNull()
    .default("AND"),
  ruleId: integer("rule_id")
    .references(() => RuleTable.id, { onDelete: "cascade" })
    .notNull(),
  parentGroupId: integer("parent_group_id").references((): AnySQLiteColumn => ConditionGroupTable.id, {
    onDelete: "cascade",
  }),
});

export const conditionGroupRelations = relations(ConditionGroupTable, ({ one, many }) => ({
  rule: one(RuleTable, {
    fields: [ConditionGroupTable.ruleId],
    references: [RuleTable.id],
  }),
  parentGroup: one(ConditionGroupTable, {
    fields: [ConditionGroupTable.parentGroupId],
    references: [ConditionGroupTable.id],
    relationName: "parent",
  }),
  childConditions: many(ConditionTable),
  childGroups: many(ConditionGroupTable, { relationName: "parent" }),
}));

export type ConditionGroupSchema = typeof ConditionGroupTable.$inferSelect;
export type NewConditionGroup = typeof ConditionGroupTable.$inferInsert;
