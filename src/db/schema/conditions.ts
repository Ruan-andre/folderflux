import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ConditionGroupTable } from "./conditionGroups";
import { relations } from "drizzle-orm/relations";

export const ConditionTable = sqliteTable("conditions", {
  id: integer("id").primaryKey().unique(),
  type: text("type", {
    enum: ["fileName", "fileExtension", "modifiedDate", "fileDirectory", "fileSize"],
  }).notNull(),
  typeAction: text("type_action", {
    enum: ["contains", "notContains", "isBetween", "startsWith", "endsWith", "equals"],
  }).notNull(),
  value: text("value"),
  value2: text("value2"),
  groupId: integer("group_id")
    .references(() => ConditionGroupTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const ConditionRelations = relations(ConditionTable, ({ one }) => ({
  group: one(ConditionGroupTable, {
    fields: [ConditionTable.groupId],
    references: [ConditionGroupTable.id],
  }),
}));

export type ConditionSchema = typeof ConditionTable.$inferSelect;
export type NewCondition = typeof ConditionTable.$inferInsert;
