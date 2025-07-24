import { sqliteTable, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { ProfileTable } from "./profiles";
import { RuleTable } from "./rules";
import { relations } from "drizzle-orm";

export const ProfileRulesTable = sqliteTable(
  "profile_rules",
  {
    profileId: integer("profile_id")
      .references(() => ProfileTable.id, { onDelete: "cascade" })
      .notNull(),
    ruleId: integer("rule_id")
      .references(() => RuleTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return [primaryKey({ columns: [table.profileId, table.ruleId] })];
  }
);

export const profileRulesRelations = relations(ProfileRulesTable, ({ one }) => ({
  // Diz que cada linha pertence a UM perfil
  profile: one(ProfileTable, {
    fields: [ProfileRulesTable.profileId],
    references: [ProfileTable.id],
  }),
  // Diz que cada linha pertence a UMA regra
  rule: one(RuleTable, {
    fields: [ProfileRulesTable.ruleId],
    references: [RuleTable.id],
  }),
}));
export type ProfileRulesSchema = typeof ProfileRulesTable.$inferSelect;
export type NewProfileRule = typeof ProfileRulesTable.$inferInsert;
