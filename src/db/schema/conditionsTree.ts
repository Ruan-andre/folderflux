import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { RuleTable } from "./rules";

export const ConditionsTreeTable = sqliteTable("conditions_tree", {
  id: integer("id").primaryKey(),
  type: text("type", { enum: ["group", "condition"] }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ruleId: integer("rule_id")
    .references(() => RuleTable.id, { onDelete: "cascade" })
    .notNull(),
  parentGroupId: integer("parent_group_id").references((): AnySQLiteColumn => ConditionsTreeTable.id, {
    onDelete: "cascade",
  }),
  // Colunas específicas de GRUPO (podem ser nulas)
  operator: text("operator", { enum: ["AND", "OR"] }),
  // Colunas específicas de CONDIÇÃO (podem ser nulas)
  field: text("field", {
    enum: ["fileName", "fileExtension", "creationDate", "modifiedDate", "fileSize"],
  }),
  fieldOperator: text("field_operator", {
    enum: [
      "contains",
      "notContains",
      "isBetween",
      "startsWith",
      "endsWith",
      "equals",
      "notEquals",
      "lowerThan",
      "higherThan",
    ],
  }),
  value: text("value"),
  value2: text("value2"),
  fromTour: integer("from_tour", { mode: "boolean" }).default(false),
});

// Relações para a árvore
export const conditionsTreeRelations = relations(ConditionsTreeTable, ({ one, many }) => ({
  rule: one(RuleTable, {
    fields: [ConditionsTreeTable.ruleId],
    references: [RuleTable.id],
  }),
  parentGroup: one(ConditionsTreeTable, {
    fields: [ConditionsTreeTable.parentGroupId],
    references: [ConditionsTreeTable.id],
    relationName: "children", // O pai tem a relação com os filhos
  }),
  children: many(ConditionsTreeTable, {
    relationName: "children", // Os filhos se relacionam com o pai
  }),
}));

export type ConditionTreeSchema = typeof ConditionsTreeTable.$inferSelect;
export type NewConditionTree = typeof ConditionsTreeTable.$inferInsert;
