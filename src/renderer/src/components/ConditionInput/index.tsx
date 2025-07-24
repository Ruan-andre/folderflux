import { Box, Button } from "@mui/material";
import GenericInput from "../GenericInput";
import { ICondition } from "../../types/ConditionsType";

const fieldOptions = [
  { label: "Nome do arquivo", value: "fileName" as const },
  { label: "Extensão do arquivo", value: "fileExtension" as const },
  { label: "Data de modificação", value: "modifiedDate" as const },
  { label: "Origem do arquivo", value: "fileDirectory" as const },
  { label: "Tamanho do arquivo", value: "fileSize" as const },
];

type ConditionInputProps = {
  condition: ICondition;
  onChange: (updatedCondition: ICondition) => void;
  onRemove: () => void;
};

const ConditionInput = ({ condition, onChange, onRemove }: ConditionInputProps) => {
  const isRangeField = condition.field === "modifiedDate" || condition.field === "fileSize";

  const operatorOptions = [
    { label: "contém", value: "contains" as const },
    { label: "não contém", value: "notContains" as const },
    { label: "começa com", value: "startsWith" as const },
    { label: "termina com", value: "endsWith" as const },
    { label: "é igual a", value: "equals" as const },
    ...(isRangeField ? [{ label: "está entre", value: "isBetween" as const }] : []),
  ];
  const handleChange = (field: keyof ICondition, value: string) => {
    onChange({ ...condition, [field]: value });
  };
  return (
    <Box display="flex" alignItems={"center"} gap={1} mb={2} flexWrap="wrap">
      <GenericInput
        name="field"
        select
        required
        value={condition.field}
        selectOptions={fieldOptions}
        onChange={(e) => handleChange("field", e.target.value)}
      />

      <GenericInput
        name="operator"
        select
        value={condition.operator}
        selectOptions={operatorOptions}
        onChange={(e) => handleChange("operator", e.target.value)}
      />

      {!isRangeField || condition.operator !== "isBetween" ? (
        <GenericInput
          name="value"
          value={condition.value}
          onChange={(e) => handleChange("value", e.target.value)}
          placeholder="Valor"
        />
      ) : (
        <Box display="flex" gap={1} flex={1}>
          <GenericInput
            name="value"
            value={condition.value}
            onChange={(e) => handleChange("value", e.target.value)}
            placeholder="De"
          />
          <GenericInput
            name="value2"
            value={condition.value2 ?? ""}
            onChange={(e) => handleChange("value2", e.target.value)}
            placeholder="Até"
          />
        </Box>
      )}
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
