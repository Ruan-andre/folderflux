import { Field } from "../types/Field";
import { Operator } from "../types/Operator";

export type TargetType = "file" | "directory";

export type FieldSpec = {
  label: string;
  operators: readonly Operator[];
};

export type FieldCatalog = Partial<Record<Field, FieldSpec>>;

/**
 * Fonte única dos campos de condição e dos operadores válidos para cada um.
 *
 * O renderer monta os selects a partir daqui e o RuleEngine implementa
 * exatamente estes pares. Quando os dois divergem, a regra simplesmente nunca
 * casa — sem erro, sem log. O teste `fieldCatalog.test.ts` trava essa paridade.
 */
const TEXT_OPERATORS = ["contains", "notContains", "startsWith", "endsWith", "equals"] as const;
const DATE_OPERATORS = ["equals", "isBetween", "higherThan", "lowerThan"] as const;
const NUMERIC_OPERATORS = ["higherThan", "lowerThan", "equals", "isBetween"] as const;

const dateFields: FieldCatalog = {
  creationDate: { label: "Data de Criação", operators: DATE_OPERATORS },
  modifiedDate: { label: "Data de modificação", operators: DATE_OPERATORS },
};

export const FILE_FIELDS: FieldCatalog = {
  fileName: { label: "Nome do arquivo", operators: TEXT_OPERATORS },
  fileExtension: { label: "Extensão do arquivo", operators: ["equals", "notEquals"] },
  ...dateFields,
  fileSize: { label: "Tamanho do arquivo (em MB)", operators: NUMERIC_OPERATORS },
};

export const DIRECTORY_FIELDS: FieldCatalog = {
  fileName: { label: "Nome da pasta", operators: TEXT_OPERATORS },
  ...dateFields,
  fileSize: { label: "Tamanho da pasta (em MB)", operators: NUMERIC_OPERATORS },
  itemCount: { label: "Quantidade de itens", operators: NUMERIC_OPERATORS },
  isEmpty: { label: "Está vazia", operators: ["equals"] },
};

export const FIELD_CATALOG: Record<TargetType, FieldCatalog> = {
  file: FILE_FIELDS,
  directory: DIRECTORY_FIELDS,
};

export function getFieldCatalog(targetType: TargetType): FieldCatalog {
  return FIELD_CATALOG[targetType];
}
