import { Box } from "@mui/material";
import { useState } from "react";
import GenericInput from "../GenericInput";

const options = [
  { label: "Nome do arquivo", value: 0 },
  { label: "Extensão do arquivo", value: 1 },
  { label: "Data de modificação", value: 2 },
  { label: "Origem do arquivo", value: 3 },
  { label: "Tamanho do arquivo", value: 4 },
];

const ConditionInput = () => {
  const [field, setField] = useState(0);
  const [operator, setOperator] = useState(0);
  const [value, setValue] = useState("");
  const [rangeValue, setRangeValue] = useState({ from: "", to: "" });

  const isRangeField = field === 4 || field === 2;

  const conditions = [
    { label: "contém", value: 0 },
    { label: "não contém", value: 1 },
    { label: "começa com", value: 2 },
    { label: "termina com", value: 3 },
    { label: "é igual a", value: 4 },
    ...(isRangeField ? [{ label: "está entre", value: 5 }] : []),
  ];

  return (
    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
      <GenericInput
        name="options"
        select
        value={field.toString()}
        selectOptions={options}
        onChange={(e) => setField(parseInt(e.target.value))}
      />

      <GenericInput
        name="conditions"
        select
        value={operator.toString()} // Alterado para passar valor numérico
        onChange={(e) => setOperator(parseInt(e.target.value))} // Alterado para lidar com valor numérico
        selectOptions={conditions}
      />

      {!isRangeField || operator !== 5 ? (
        <GenericInput
          name="commonConditionInput"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor"
        />
      ) : (
        <Box display="flex" gap={1} flex={1}>
          <GenericInput
            name="initialRangeInput"
            value={rangeValue.from}
            onChange={(e) => setRangeValue({ ...rangeValue, from: e.target.value })}
            placeholder="De"
          />
          <GenericInput
            name="finalRangeInput"
            value={rangeValue.to}
            onChange={(e) => setRangeValue({ ...rangeValue, to: e.target.value })}
            placeholder="Até"
          />
        </Box>
      )}
    </Box>
  );
};

export default ConditionInput;
