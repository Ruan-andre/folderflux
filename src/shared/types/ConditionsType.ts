// Tipo para uma condição individual (uma "folha" da árvore)
export interface ICondition {
  id: string | number; // Usar string para UUIDs temporários é uma boa prática
  type: "condition";
  field: "fileName" | "fileExtension" | "creationDate" | "modifiedDate" | "fileDirectory" | "fileSize";
  operator: "contains" | "notContains" | "isBetween" | "startsWith" | "endsWith" | "equals";
  value: string;
  value2?: string; // Usado apenas para 'isBetween'
}

// Tipo para um grupo de condições (um "nó" da árvore)
export interface IConditionGroup {
  id: string | number;
  type: "group";
  operator: "AND" | "OR";
  children: (ICondition | IConditionGroup)[];
}
