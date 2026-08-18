import FileInfo from "~/src/shared/types/FileInfo";
import DirInfo from "~/src/shared/types/DirInfo";
import { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";

export type ItemValue = string | number | Date | boolean | null;

type EvaluatorFunc = (
  itemValue: ItemValue,
  conditionValue: string,
  conditionValue2?: string | null
) => boolean;

const MB = 1024 * 1024;

const toDate = (value: ItemValue): Date => new Date(value as string | number | Date);

const diffDays = (value: ItemValue): number => (Date.now() - toDate(value).getTime()) / (1000 * 60 * 60 * 24);

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const parseDateLocal = (value: string): Date => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const dateEvaluators: Record<string, EvaluatorFunc> = {
  // Compara o dia do calendário: o usuário informa uma data, o item tem
  // data e hora. Comparar o timestamp exato nunca casaria com nada.
  equals: (itemValue, value) => {
    if (!itemValue || !value) return false;
    return isSameDay(toDate(itemValue), parseDateLocal(value));
  },
  isBetween: (itemValue, value, value2) => {
    if (!value || !value2) return false;
    const itemDate = toDate(itemValue);
    return itemDate >= new Date(value) && itemDate <= new Date(value2);
  },
  higherThan: (itemValue, value) => {
    if (!itemValue || !value) return false;
    return diffDays(itemValue) > parseInt(value);
  },
  lowerThan: (itemValue, value) => {
    if (!itemValue || !value) return false;
    return diffDays(itemValue) < parseInt(value);
  },
};

const numericEvaluators = (toComparable: (value: ItemValue) => number): Record<string, EvaluatorFunc> => ({
  equals: (itemValue, value) => toComparable(itemValue) === parseFloat(value),
  higherThan: (itemValue, value) => (!value ? false : toComparable(itemValue) > parseFloat(value)),
  lowerThan: (itemValue, value) => (!value ? false : toComparable(itemValue) < parseFloat(value)),
  isBetween: (itemValue, value, value2) => {
    if (!value || !value2) return false;
    const comparable = toComparable(itemValue);
    return comparable >= parseFloat(value) && comparable <= parseFloat(value2);
  },
});

export const conditionEvaluators: Record<string, Record<string, EvaluatorFunc>> = {
  fileName: {
    contains: (itemValue, value) => String(itemValue).toLowerCase().includes(value.toLowerCase()),
    notContains: (itemValue, value) => !String(itemValue).toLowerCase().includes(value.toLowerCase()),
    startsWith: (itemValue, value) => String(itemValue).toLowerCase().startsWith(value.toLowerCase()),
    endsWith: (itemValue, value) => String(itemValue).toLowerCase().endsWith(value.toLowerCase()),
    equals: (itemValue, value) => String(itemValue).toLowerCase() === value.toLowerCase(),
  },
  fileExtension: {
    equals: (itemValue, value) => String(itemValue).toLowerCase() === value.toLowerCase().replace(".", ""),
    notEquals: (itemValue, value) => String(itemValue).toLowerCase() !== value.toLowerCase().replace(".", ""),
    notContains: (itemValue, value) =>
      !String(itemValue).toLowerCase().includes(value.toLowerCase().replace(".", "")),
  },
  creationDate: dateEvaluators,
  modifiedDate: dateEvaluators,
  fileSize: numericEvaluators((itemValue) => Number(itemValue) / MB),
  itemCount: numericEvaluators((itemValue) => Number(itemValue)),
  isEmpty: {
    equals: (itemValue, value) => Boolean(itemValue) === (value === "true"),
  },
};

function getFileValue(file: FileInfo, field: ICondition["field"]): ItemValue {
  switch (field) {
    case "fileName":
      return file.name;
    case "fileExtension":
      return file.extension.replace(".", "");
    case "fileSize":
      return file.size;
    case "creationDate":
      return file.ctime;
    case "modifiedDate":
      return file.mtime;
    default:
      return null;
  }
}

function getDirValue(dir: DirInfo, field: ICondition["field"]): ItemValue {
  switch (field) {
    case "fileName":
      return dir.name;
    case "fileSize":
      return dir.size;
    case "creationDate":
      return dir.ctime;
    case "modifiedDate":
      return dir.mtime;
    case "itemCount":
      return dir.itemCount;
    case "isEmpty":
      return dir.isEmpty;
    default:
      return null;
  }
}

export function evaluateCondition(item: FileInfo | DirInfo, condition: ICondition, isDir: boolean): boolean {
  const evaluator = conditionEvaluators[condition.field]?.[condition.fieldOperator];
  const itemValue = isDir
    ? getDirValue(item as DirInfo, condition.field)
    : getFileValue(item as FileInfo, condition.field);

  if (evaluator && itemValue !== null) {
    return evaluator(itemValue, condition.value, condition.value2);
  }
  return false;
}

export function evaluateConditionTree(
  item: FileInfo | DirInfo,
  group: IConditionGroup,
  isDir: boolean
): boolean {
  const results = group.children.map((child) =>
    child.type === "group" ? evaluateConditionTree(item, child, isDir) : evaluateCondition(item, child, isDir)
  );

  if (results.length === 0) return true;
  return group.operator === "OR" ? results.some(Boolean) : results.every(Boolean);
}

export function conditionTreeUsesField(group: IConditionGroup, field: ICondition["field"]): boolean {
  return group.children.some((child) =>
    child.type === "group" ? conditionTreeUsesField(child, field) : child.field === field
  );
}
