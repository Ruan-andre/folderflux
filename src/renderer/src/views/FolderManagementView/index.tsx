import { FolderSchema } from "~/src/db/schema";
import { useEffect, useState } from "react";
import ContentWrapper from "../../components/ContentWrapper";
import GenericListItems from "../../components/GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import { NewFolder } from "~/src/db/schema";
import { useSnackbar } from "../../context/SnackBarContext";
import { Box, Button, Stack } from "@mui/material";
import { useFolderPopupStore } from "../../store/popupFolderStore";
import FolderPopup from "../../components/FolderPopup";

type FolderManagementViewProps = {
  mode: "page" | "selection";
  initialSelectedFolders?: FolderSchema[];
  onSelectionSave?: (selecteds: FolderSchema[]) => void;
  onCancel?: () => void;
};

const FolderManagementView = ({
  mode,
  initialSelectedFolders = [],
  onSelectionSave,
  onCancel,
}: FolderManagementViewProps) => {
  const { showMessage } = useSnackbar();
  const { openPopup } = useFolderPopupStore();
  const [folders, setFolders] = useState<GenericListItemsType[]>();
  const [selectedFolders, setSelectedFolders] = useState<FolderSchema[]>(initialSelectedFolders);

  useEffect(() => {
    async function fetchData() {
      await refreshFolders();
    }
    fetchData();
  }, []);

  const handleDeleteFolder = async (folderId: number) => {
    await window.api.folder.deleteFolder(folderId);
    refreshFolders();
  };

  const refreshFolders = async () => {
    const response = await window.api.folder.getAllFolders();
    if (response.status && response.items) {
      const foldersList = response.items.map((x) => ({
        id: x.id,
        title: x.name,
        subtitle: x.fullPath,
        icon: "fluent-emoji-flat:file-folder",
      }));
      setFolders(foldersList);
    }
  };

  const handleAddFolder = async () => {
    const paths = await window.api.dialog.selectMultipleDirectories();
    if (paths && paths.length > 0) {
      const listFolders: NewFolder[] = paths?.map((p) => ({
        name: p.substring(p.lastIndexOf("\\") + 1),
        fullPath: p,
      }));
      await window.api.folder.addFolders(listFolders);
      showMessage("Pasta adicionada com sucesso", "success");
      refreshFolders();
    }
  };

  const handleEditFolder = (folderId: number) => {
    const folderToEdit = folders?.find((f) => f.id === folderId);
    if (folderToEdit) {
      // Converte para FolderSchema antes de passar
      const folderSchema: FolderSchema = {
        id: folderToEdit.id,
        name: folderToEdit.title,
        fullPath: folderToEdit.subtitle || "",
      };
      openPopup("edit", folderSchema);
    }
  };

  const handleSelectionChange = async (id: number) => {
    const a = selectedFolders.find((x) => x.id === id);
    if (a) {
      setSelectedFolders((prev) => prev.filter((p) => p.id !== a.id));
    } else {
      const response = await window.api.folder.getFolderById(id);
      if (response.status && response.items) {
        setSelectedFolders((prev) => [...prev, response.items!]);
      }
    }
  };

  const handleSaveClick = () => {
    if (onSelectionSave) {
      onSelectionSave(selectedFolders);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <ContentWrapper
          title="Gerenciar Pastas"
          commonBtn={{ Action: handleAddFolder, text: "Adicionar Pastas" }}
        >
          <GenericListItems
            mode={mode}
            selectedIds={selectedFolders.map((f) => f.id)}
            btnEdit
            btnDelete
            isButton={false}
            list={folders}
            onSelectionChange={handleSelectionChange}
            onClickEdit={(e) => {
              handleEditFolder(e);
            }}
            onClickDelete={(e) => {
              handleDeleteFolder(e);
            }}
          />
        </ContentWrapper>
        <FolderPopup onUpdateSuccess={refreshFolders} />
      </Box>
      {mode === "selection" && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          p={2}
          sx={{ borderTop: 1, borderColor: "divider", flexShrink: 0 }} // flexShrink: 0 impede que ele encolha
        >
          <Button
            variant="outlined"
            color="error"
            sx={{
              fontSize: 12,
              borderRadius: 2,
              ":hover": { backgroundColor: "brown", color: "white" },
            }}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveClick}>
            Confirmar Seleção
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default FolderManagementView;
