import { Box } from "@mui/material";
import { useState } from "react";
import GenericInput from "../GenericInput";
import GenericFolderSelector from "../GenericFolderSelector";

const options = [
  { label: "Mover para pasta", value: 0 },
  { label: "Copiar para pasta", value: 1 },
  { label: "Renomear arquivo", value: 2 },
  { label: "Excluir arquivo", value: 3 },
];
const ActionInput = () => {
  const [action, setAction] = useState(0);
  const [destination, setDestination] = useState("");

  return (
    <Box display="flex" flexDirection="column" gap={1} mt={2}>
      <GenericInput
        name="options"
        select
        required
        selectOptions={options}
        label="Ação"
        value={action.toString()}
        onChange={(e) => setAction(parseInt(e.target.value))}
      />
      {action !== 3 && (
        <GenericFolderSelector
          flexDirection="column"
          showList={false}
          btnAdd={false}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={action === 2 ? "Novo nome" : "Pasta de destino"}
        />
      )}
    </Box>
  );
};

export default ActionInput;
