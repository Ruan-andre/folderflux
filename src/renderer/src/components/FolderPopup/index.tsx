import { Box, Button, Modal, Stack, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import GenericInput from "../GenericInput";
import { useEffect, useState } from "react";
import { FolderSchema } from "~/src/db/schema";
import { useFolderPopupStore } from "../../store/popupFolderStore";
import { useSnackbar } from "../../context/SnackBarContext";

const FolderPopup = ({ onUpdateSuccess }: { onUpdateSuccess: () => void }) => {
  const theme = useTheme();
  const { isOpen, folderToEdit, closePopup } = useFolderPopupStore();
  const [name, setName] = useState("");
  const [fullPath, setFullPath] = useState("");
  const { showMessage } = useSnackbar();

  const handleSubmit = async () => {
    if (folderToEdit) {
      const updatedFolder: FolderSchema = { ...folderToEdit, name, fullPath };
      const isDirectory = (await window.api.getStatsForPaths([fullPath]))[0]?.isDirectory;
      if (isDirectory === true) {
        await window.api.folder.updateFolder(updatedFolder);
        onUpdateSuccess();
        closePopup();
      } else {
        showMessage("Não é possível inserir diretório de arquivos, ou diretórios inexistentes.", "error");
      }
    }
  };

  useEffect(() => {
    if (isOpen && folderToEdit) {
      setName(folderToEdit.name);
      setFullPath(folderToEdit.fullPath || "");
    }
  }, [isOpen, folderToEdit]);

  if (!isOpen) {
    return null;
  }
  return (
    <Modal open={isOpen} onClose={closePopup}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "99vh",
          maxWidth: 600,
          width: "95vw",
          overflowY: "auto",
        }}
      >
        <ContentWrapper title="Editar pasta">
          <GenericInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="folderName"
            placeholder="Digite o nome da pasta"
            required
            label="Apelido"
          />
          <GenericInput
            value={fullPath}
            onChange={(e) => setFullPath(e.target.value)}
            name="folderPath"
            placeholder="Digite o caminho completo da pasta"
            required
            label="Caminho completo"
          />
          <Stack spacing={2} direction={"row"} justifyContent={"end"}>
            <Button
              variant="contained"
              sx={{
                fontSize: 12,
                borderRadius: theme.shape.borderRadius,
              }}
              onClick={handleSubmit}
            >
              Salvar
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{
                fontSize: 12,
                borderRadius: theme.shape.borderRadius,
                ":hover": { backgroundColor: "brown", color: "white" },
              }}
              onClick={closePopup}
            >
              Cancelar
            </Button>
          </Stack>
        </ContentWrapper>
      </Box>
    </Modal>
  );
};

export default FolderPopup;
