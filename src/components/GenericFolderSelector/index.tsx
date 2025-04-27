import { Box, Button } from "@mui/material";
import GenericListItems from "../GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import PageWrapper from "../PageWrapper";
import Icon from "../../assets/icons";
import GenericInput from "../GenericInput";
const listaPastasMock: GenericListItemsType[] = [
  {
    title: "Pasta 1",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 2",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 3",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 4",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 5",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 6",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 7",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
  {
    title: "Pasta 8",
    iconsAction: [<Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />],
  },
];

type GenericFolderSelectorProps = {
  value?: string;
  showList?: boolean;
  inputLabel?: string;
  btnLabel?: string;
  btnAdd?: boolean;
  btnAddLabel?: string;
  listTitle?: string;
  placeholder?: string;
  flexDirection?: "row" | "column";
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const GenericFolderSelector = ({
  value = "",
  showList = true,
  listTitle,
  inputLabel,
  btnLabel,
  btnAdd = true,
  btnAddLabel,
  placeholder,
  flexDirection,
  onChange,
}: GenericFolderSelectorProps) => {
  const handleBrowse = () => {
    // Aqui você pode acionar um file picker nativo ou Electron (se for desktop)
    alert("Abrir diálogo de seleção de pasta");
  };

  return (
    <Box display="flex" flexDirection={flexDirection ?? "column"} gap="1rem">
      <Box display="flex" gap={1} alignItems={"center"} justifyContent={"center"}>
        <Box flex={1}>
          <GenericInput
            name="folderSelector"
            value={value}
            onChange={onChange}
            label={inputLabel ?? ""}
            placeholder={placeholder ?? ""}
            inputSize="small"
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={handleBrowse}
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 12,
              fontWeight: "bolder",
              marginTop: inputLabel ? 4 : 0,
            }}
            fullWidth
          >
            {btnLabel ?? "Procurar"}
          </Button>
        </Box>
      </Box>
      {btnAdd && (
        <Button
          variant="outlined"
          fullWidth
          color="success"
          sx={{
            borderRadius: 8,
            fontWeight: "bolder",
            ":hover": {
              backgroundColor: "green",
              color: "white",
            },
          }}
        >
          {btnAddLabel ?? "Adicionar"}
        </Button>
      )}

      {showList && (
        <PageWrapper title={listTitle || ""} gap="0.5rem" titleSize={18} hr>
          <GenericListItems
            list={listaPastasMock}
            isButton={false}
            titleSize="1.5rem"
            maxListHeight="10.5rem"
          />
        </PageWrapper>
      )}
    </Box>
  );
};

export default GenericFolderSelector;
