import { Box } from "@mui/material";
import GenericInput from "../GenericInput";
import GenericFolderSelector from "../GenericFolderSelector";
import { ActionSchema, NewAction } from "~/src/db/schema";

type ActionInputProps = {
  action: ActionSchema | NewAction;
  onChange: (updated: ActionSchema | NewAction) => void;
};

type optionsType = {
  label: string;
  value: "move" | "copy" | "rename" | "delete";
};
const options: optionsType[] = [
  { label: "Mover para pasta", value: "move" },
  { label: "Copiar para pasta", value: "copy" },
  { label: "Renomear arquivo", value: "rename" },
  { label: "Excluir arquivo", value: "delete" },
];

const ActionInput = ({ action, onChange }: ActionInputProps) => {
  const handleChangeOption = (typeSelected: string) => {
    onChange({ ...action, type: typeSelected as optionsType["value"] });
  };

  const handleValueChange = (value: string) => {
    onChange({ ...action, value: value });
  };
  return (
    <Box display="flex" flexDirection="column" gap={1} mt={2}>
      <GenericInput
        id="inputOptions"
        name="inputOptions"
        select
        required
        selectOptions={options}
        label="Ação"
        value={action?.type ?? "move"}
        onChangeInput={(e) => handleChangeOption(e.target.value)}
      />
      {action?.type !== "delete" && (
        <GenericFolderSelector
          sx={{ flexDirection: "column" }}
          onChangeInput={(e) => handleValueChange(e.target.value)}
          value={action?.value ?? ""}
          placeholder={action?.type === "rename" ? "Novo nome" : "Pasta de destino"}
          hideSearchButton={action?.type === "rename"}
        />
      )}
    </Box>
  );
};

export default ActionInput;
