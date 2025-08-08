import { ActionSchema, NewAction, NewRule, RuleSchema } from "@db/schema";
import { IConditionGroup } from "./ConditionsType";

/**
 * Representa uma Regra completa com todas as suas relações,
 * como usada no estado do frontend.
 */
export type FullRule = Omit<RuleSchema, "conditionsTree"> & {
  conditionsTree: IConditionGroup;
  action: ActionSchema;
};

/**
 * Representa os dados necessários para criar uma FullRule.
 * É usado como payload para o backend.
 */
export type NewFullRulePayload = {
  rule: NewRule;
  conditionsTree: IConditionGroup;
  action: NewAction;
};
