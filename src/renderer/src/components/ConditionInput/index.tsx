import { Box, Button, Typography } from "@mui/material";
import { useMemo } from "react";
import GenericInput from "../GenericInput";
import { ICondition } from "../../../../shared/types/ConditionsType";
import { Operator } from "~/src/shared/types/Operator";
import { Field } from "~/src/shared/types/Field";
import { getFieldCatalog, TargetType } from "~/src/shared/rules/fieldCatalog";

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

const DATE_FIELDS: Field[] = ["creationDate", "modifiedDate"];
const NUMERIC_FIELDS: Field[] = ["fileSize", "itemCount"];

function resolveInputType(field: Field, operator: Operator): "date" | "number" | "text" {
  if (DATE_FIELDS.includes(field)) {
    // `equals`/`isBetween` recebem uma data; os demais recebem uma quantidade de dias.
    return operator === "equals" || operator === "isBetween" ? "date" : "number";
  }
  return NUMERIC_FIELDS.includes(field) ? "number" : "text";
}

type ConditionInputProps = {
  condition: ICondition;
  onChange: (updatedCondition: ICondition) => void;
  onRemove: () => void;
  targetType?: TargetType;
};

const ConditionInput = ({ condition, onChange, onRemove, targetType = "file" }: ConditionInputProps) => {
  const activeFieldConfig = useMemo(() => getFieldCatalog(targetType), [targetType]);
  const fieldOptions = useMemo(
    () => Object.entries(activeFieldConfig).map(([value, { label }]) => ({ value: value as Field, label })),
    [activeFieldConfig]
  );
  const handleChange = (field: keyof ICondition, value: string | undefined) => {
    onChange({ ...condition, [field]: value });
  };

  const handleChangeField = (newField: Field) => {
    const fieldDef = activeFieldConfig[newField];
    if (!fieldDef) return;
    const newFieldOperators = fieldDef.operators;
    const currentOperatorIsValid = newFieldOperators.includes(condition.fieldOperator);

    onChange({
      ...condition,
      field: newField,
      fieldOperator: currentOperatorIsValid ? condition.fieldOperator : newFieldOperators[0],
      value: newField === "isEmpty" ? "true" : "",
      value2: undefined,
    });
  };

  const operatorOptions = useMemo(() => {
    if (!condition.field) return [];
    const fieldDef = activeFieldConfig[condition.field];
    if (!fieldDef) return [];
    return fieldDef.operators.map((opKey) => ({
      value: opKey,
      label: allOperators[opKey].label,
    }));
  }, [condition.field, activeFieldConfig]);

  const showSecondValue = condition.fieldOperator === "isBetween";
  const typeOfGenericInput = resolveInputType(condition.field, condition.fieldOperator);
  return (
    <Box display="inline-flex" alignItems="center" gap={1} mb={2} width={"100%"} flexWrap="wrap">
      <GenericInput
        className="condition-field-select"
        name="field"
        select
        bgColor="default"
        required
        fullWidth={false}
        inputWidth={"23rem"}
        value={condition.field}
        selectOptions={fieldOptions}
        onChangeInput={(e) => handleChangeField(e.target.value as Field)}
      />

      {/* Seletor de Operador */}
      <GenericInput
        className="condition-operator-select"
        name="operator"
        select
        bgColor={"default"}
        required
        fullWidth={false}
        inputWidth={"13rem"}
        value={condition.fieldOperator}
        selectOptions={operatorOptions}
        onChangeInput={(e) => handleChange("fieldOperator", e.target.value)}
      />

      {/* Inputs de Valor */}
      {showSecondValue ? (
        <Box display="flex" gap={1} flex={1}>
          <GenericInput
            className="condition-value-1"
            name="value"
            fullWidth={false}
            inputWidth={"50%"}
            value={condition.value}
            onChangeInput={(e) => handleChange("value", e.target.value)}
            placeholder="De"
            type={typeOfGenericInput}
          />
          <GenericInput
            className="condition-value-2"
            name="value2"
            inputWidth={"50%"}
            fullWidth={false}
            value={condition.value2 ?? ""}
            onChangeInput={(e) => handleChange("value2", e.target.value)}
            placeholder="Até"
            type={typeOfGenericInput}
          />
        </Box>
      ) : condition.field === "isEmpty" ? (
        <Box component={"span"}>
          <GenericInput
            className="condition-value"
            name="value"
            select
            value={condition.value || "true"}
            selectOptions={[
              { label: "Sim", value: "true" },
              { label: "Não", value: "false" },
            ]}
            onChangeInput={(e) => handleChange("value", e.target.value)}
          />
        </Box>
      ) : (
        <Box component={"span"}>
          <GenericInput
            className="condition-value"
            name="value"
            value={condition.value}
            placeholder={"valor"}
            onChangeInput={(e) => handleChange("value", e.target.value)}
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
