import type { FullRule } from "~/src/shared/types/RuleWithDetails";
import type { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";
import type { Field } from "~/src/shared/types/Field";
import type { Operator } from "~/src/shared/types/Operator";
import type { ActionsType } from "~/src/shared/types/ActionsType";

let nextId = 1;
const id = () => nextId++;

export function condition(field: Field, fieldOperator: Operator, value: string, value2?: string): ICondition {
  return { id: id(), type: "condition", field, fieldOperator, value, value2, displayOrder: 1 };
}

export function group(operator: "AND" | "OR", children: (ICondition | IConditionGroup)[]): IConditionGroup {
  return { id: id(), type: "group", operator, displayOrder: 1, children };
}

type ActionType = ActionsType["type"];

export function makeRule(opts: {
  name?: string;
  targetType?: "file" | "directory";
  conditions?: IConditionGroup;
  action: { type: ActionType; value?: string | null };
  isActive?: boolean;
}): FullRule {
  const ruleId = id();
  return {
    id: ruleId,
    name: opts.name ?? `regra-${ruleId}`,
    description: null,
    targetType: opts.targetType ?? "file",
    isSystem: false,
    isActive: opts.isActive ?? true,
    fromTour: false,
    conditionsTree: opts.conditions ?? group("AND", []),
    action: {
      id: id(),
      ruleId,
      type: opts.action.type,
      value: opts.action.value ?? null,
    },
  } as FullRule;
}
