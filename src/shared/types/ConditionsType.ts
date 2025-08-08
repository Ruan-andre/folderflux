import { Field } from "./Field";
import { Operator } from "./Operator";

// Tipo para uma condição individual (uma "folha" da árvore)
export interface ICondition {
  id: string | number;
  type: "condition";
  field: Field;
  fieldOperator: Operator;
  displayOrder: number;
  value: string;
  value2?: string;
}

// Tipo para um grupo de condições (um "nó" da árvore)
export interface IConditionGroup {
  id: string | number;
  type: "group";
  operator: "AND" | "OR";
  displayOrder: number;
  children: (ICondition | IConditionGroup)[];
}
