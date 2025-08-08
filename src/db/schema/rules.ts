import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { ProfileRulesTable } from "./profileRules";
import { ConditionsTreeTable } from "./conditionsTree";
import { ActionTable } from "./actions";
import type { ConditionTreeSchema } from "./conditionsTree";
import type { ActionSchema } from "./actions";

export const RuleTable = sqliteTable("rules", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description", { length: 255 }),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const ruleRelations = relations(RuleTable, ({ many, one }) => ({
  profileRules: many(ProfileRulesTable),
  conditionsTree: many(ConditionsTreeTable),
  action: one(ActionTable),
}));

export type RuleSchema = typeof RuleTable.$inferSelect & {
  conditionsTree: ConditionTreeSchema[];
  action?: ActionSchema | null;
};


export type NewRule = typeof RuleTable.$inferInsert;
