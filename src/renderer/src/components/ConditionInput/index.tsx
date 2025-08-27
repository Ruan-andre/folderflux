import { Box, Button, Typography } from "@mui/material";
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
  notEquals: { label: "não é igual a" },
  higherThan: { label: "é maior que" },
  lowerThan: { label: "é menor que" },
  isBetween: { label: "está entre" },
};

const fieldConfig: Record<Field, { label: string; operators: Operator[] }> = {
  fileName: {
    label: "Nome do arquivo",
    operators: ["contains", "notContains", "startsWith", "endsWith", "equals"],
  },
  fileExtension: {
    label: "Extensão do arquivo",
    operators: ["equals", "notEquals"],
  },
  creationDate: {
    label: "Data de Criação",
    operators: ["equals", "isBetween", "higherThan", "lowerThan"],
  },
  modifiedDate: {
    label: "Data de modificação",
    operators: ["isBetween", "higherThan", "lowerThan"],
  },
  fileSize: {
    label: "Tamanho do arquivo (em KB)",
    operators: ["higherThan", "lowerThan", "equals"],
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
  const typeOfGenericInput =
    (condition.field === "modifiedDate" || condition.field === "creationDate") &&
    (showSecondValue || condition.fieldOperator === "equals")
      ? "date"
      : (condition.field === "modifiedDate" ||
            condition.field === "creationDate" ||
            condition.field === "fileSize") &&
          (condition.fieldOperator === "higherThan" ||
            condition.fieldOperator === "lowerThan" ||
            condition.fieldOperator === "equals")
        ? "number"
        : "text";
  return (
    <Box display="inline-flex" alignItems="center" gap={1} mb={2} width={"100%"} flexWrap="wrap">
      <GenericInput
        name="field"
        select
        bgColor="default"
        required
        fullWidth={false}
        inputWidth={"23rem"}
        value={condition.field}
        selectOptions={fieldOptions}
        onChange={(e) => handleChangeField(e.target.value as Field)}
      />

      {/* Seletor de Operador */}
      <GenericInput
        name="operator"
        select
        bgColor={"default"}
        required
        fullWidth={false}
        inputWidth={"13rem"}
        value={condition.fieldOperator}
        selectOptions={operatorOptions}
        onChange={(e) => handleChange("fieldOperator", e.target.value)}
      />

      {/* Inputs de Valor */}
      {showSecondValue ? (
        <Box display="flex" gap={1} flex={1}>
          <GenericInput
            name="value"
            fullWidth={false}
            inputWidth={"50%"}
            value={condition.value}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder="De"
            type={typeOfGenericInput}
          />
          <GenericInput
            name="value2"
            inputWidth={"50%"}
            fullWidth={false}
            value={condition.value2 ?? ""}
            onChange={(e) => handleChange("value2", e.target.value)}
            placeholder="Até"
            type={typeOfGenericInput}
          />
        </Box>
      ) : (
        <Box component={"span"}>
          <GenericInput
            name="value"
            value={condition.value}
            placeholder={"valor"}
            onChange={(e) => handleChange("value", e.target.value)}
            type={typeOfGenericInput}
          />
        </Box>
      )}
      {(condition.field === "modifiedDate" || condition.field === "creationDate") &&
        (condition.fieldOperator === "higherThan" || condition.fieldOperator === "lowerThan") && (
          <Typography variant="caption">dias</Typography>
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
