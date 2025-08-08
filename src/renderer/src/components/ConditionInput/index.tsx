import { Box, Button } from "@mui/material";
import { useMemo } from "react";
import GenericInput from "../GenericInput";
import { ICondition } from "../../../../shared/types/ConditionsType";
import { Operator } from "~/src/shared/types/Operator";
import { Field } from "~/src/shared/types/Field";

const allOperators: Record<Operator, { label: string }> = {
  contains: { label: "contém" },
  notContains: { label: "não contém" },
  startsWith: { label: "começa com" },
  endsWith: { label: "termina com" },
  equals: { label: "é igual a" },
  higherThan: { label: "é maior que" },
  lessThan: { label: "é menor que" },
  isBetween: { label: "está entre" },
};

const fieldConfig: Record<Field, { label: string; operators: Operator[] }> = {
  fileName: {
    label: "Nome do arquivo",
    operators: ["contains", "notContains", "startsWith", "endsWith", "equals"],
  },
  fileExtension: {
    label: "Extensão do arquivo",
    operators: ["contains", "notContains", "equals"],
  },
  creationDate: {
    label: "Data de Criação",
    operators: ["equals", "isBetween", "higherThan", "lessThan"],
  },
  modifiedDate: {
    label: "Data de modificação",
    operators: ["higherThan", "lessThan", "isBetween"],
  },
  fileSize: {
    label: "Tamanho do arquivo (em KB)",
    operators: ["higherThan", "lessThan", "equals"],
  },
};

const fieldOptions = Object.entries(fieldConfig).map(([value, { label }]) => ({
  value: value as Field,
  label,
}));

type ConditionInputProps = {
  condition: ICondition;
  onChange: (updatedCondition: ICondition) => void;
  onRemove: () => void;
};

const ConditionInput = ({ condition, onChange, onRemove }: ConditionInputProps) => {
  const handleChange = (field: keyof ICondition, value: string | undefined) => {
    onChange({ ...condition, [field]: value });
  };

  const handleChangeField = (newField: Field) => {
    const newFieldOperators = fieldConfig[newField].operators;
    const currentOperatorIsValid = newFieldOperators.includes(condition.fieldOperator);

    onChange({
      ...condition,
      field: newField,
      fieldOperator: currentOperatorIsValid ? condition.fieldOperator : newFieldOperators[0],
      value: "",
      value2: undefined,
    });
  };

  const operatorOptions = useMemo(() => {
    if (!condition.field) return [];
    return fieldConfig[condition.field].operators.map((opKey) => ({
      value: opKey,
      label: allOperators[opKey].label,
    }));
  }, [condition.field]);

  const showSecondValue = condition.fieldOperator === "isBetween";

  return (
    <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
      <GenericInput
        name="field"
        select
        required
        value={condition.field}
        selectOptions={fieldOptions}
        onChange={(e) => handleChangeField(e.target.value as Field)}
      />

      {/* Seletor de Operador */}
      <GenericInput
        name="operator"
        select
        required
        value={condition.fieldOperator}
        selectOptions={operatorOptions}
        onChange={(e) => handleChange("fieldOperator", e.target.value)}
      />

      {/* Inputs de Valor */}
      {showSecondValue ? (
        <Box display="flex" gap={1} flex={1}>
          <GenericInput
            name="value"
            value={condition.value}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder="De"
            type={condition.field === "modifiedDate" || condition.field === "creationDate" ? "date" : "text"}
          />
          <GenericInput
            name="value2"
            value={condition.value2 ?? ""}
            onChange={(e) => handleChange("value2", e.target.value)}
            placeholder="Até"
            type={condition.field === "modifiedDate" || condition.field === "creationDate" ? "date" : "text"}
          />
        </Box>
      ) : (
        <GenericInput
          name="value"
          value={condition.value}
          onChange={(e) => handleChange("value", e.target.value)}
          placeholder="Valor"
          type={
            condition.field === "modifiedDate" || condition.field === "creationDate"
              ? "date"
              : condition.field === "fileSize"
                ? "number"
                : "text"
          }
        />
      )}

      {/* Botão de Remover */}
      <Button
        sx={{
          ":hover": { backgroundColor: "brown" },
          padding: "0.5rem 1rem",
          borderRadius: 4,
          color: "#fca5a5",
          fontWeight: "600",
        }}
        variant="outlined"
        color="error"
        size="small"
        onClick={onRemove}
      >
        Remover
      </Button>
    </Box>
  );
};

export default ConditionInput;
