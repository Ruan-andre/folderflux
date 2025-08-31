import { Box, Button, Modal, Stack, styled, Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import IconSelector from "../IconSelector";
import GenericListItems from "../GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import GenericInput from "../GenericInput";
import { useProfilePopupStore } from "../../store/popupProfileStore";
import { useProfileStore } from "../../store/profileStore";
import { useSnackbar } from "../../context/SnackBarContext";
import { ProfileFormData, useProfileForm } from "../../hooks/profileHook";
import { useState, useEffect, useCallback } from "react";
import isEqual from "fast-deep-equal";
import RuleManagementView from "../../views/RuleManagementView";
import { FolderSchema, RuleSchema } from "~/src/db/schema";
import FolderManagementView from "../../views/FolderManagementView";
import { NewFullProfile } from "../../../../shared/types/ProfileWithDetails";
import CommonIcons from "../../types/CommonIconsType";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { formHelper } from "../../functions/form";
import normalizeSafe from "../../functions/normalizeSafe";

const GenericList = styled(GenericListItems)({
  maxHeight: "15rem",
  "& .MuiListItemText-primary": {
    fontSize: "1.5rem",
  },
});
const ProfilePopup = ({ onUpdateSuccess }: { onUpdateSuccess: () => void }) => {
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const { isOpen, profileToEdit, closePopup } = useProfilePopupStore();
  const { addProfile, updateProfile } = useProfileStore();
  const {
    id,
    name,
    description,
    icon,
    associatedRules,
    associatedFolders,
    isSystem,
    setName,
    setDescription,
    setIcon,
    setAssociatedRules,
    setAssociatedFolders,
    reset,
  } = useProfileForm();

  const [initialData, setInitialData] = useState<{
    name: string;
    description: string;
    icon: string;
    isSystem: boolean;
    associatedFolders: FolderSchema[];
    associatedRules: RuleSchema[];
  }>();

  const [rulesForGenericList, setRulesForGenericList] = useState<GenericListItemsType[]>([]);
  const [foldersForGenericList, setFoldersForGenericList] = useState<GenericListItemsType[]>([]);
  const [isRuleSelectorOpen, setIsRuleSelectorOpen] = useState(false);
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);
  const [foldersIdToUnwatch, setFolderIdToUnwatch] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      if (profileToEdit) {
        // MODO EDIÇÃO: Carrega dados do perfil
        const { rules, folders } = profileToEdit;
        const formData = {
          id: profileToEdit.id!,
          name: profileToEdit.name,
          description: profileToEdit.description ?? "",
          icon: profileToEdit.iconId,
          associatedFolders: profileToEdit.folders,
          associatedRules: profileToEdit.rules,
          isSystem: profileToEdit.isSystem,
        };

        const foldersForGenericList: GenericListItemsType[] = folders.map((f) => ({
          id: f.id!,
          title: f.name,
          subtitle: f.fullPath,
          icon: "fluent-emoji:file-folder",
        }));

        const rulesForGenericList: GenericListItemsType[] = rules.map((r) => ({
          id: r.id!,
          title: r.name ?? undefined,
          subtitle: r.description ?? undefined,
          icon: "flat-color-icons:settings",
        }));

        reset(formData as Partial<ProfileFormData>);
        setInitialData(JSON.parse(JSON.stringify(formData))); // Cópia profunda para comparação
        setFoldersForGenericList(foldersForGenericList);
        setRulesForGenericList(rulesForGenericList);
      } else {
        // MODO CRIAÇÃO: Reseta para o estado inicial/vazio
        const emptyData = {
          name: "",
          description: "",
          icon: "",
          isSystem: false,
          associatedFolders: [],
          associatedRules: [],
        };
        reset(emptyData);
        setInitialData(emptyData);
        setFoldersForGenericList([]);
        setRulesForGenericList([]);
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, profileToEdit, reset]);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      showMessage("O nome do perfil é obrigatório.", "error");
      return false;
    }
    if (rulesForGenericList.length === 0) {
      showMessage("O perfil precisa ter pelo menos uma regra.", "error");
      formHelper.htmlElementBorderChange("rulesList", "red");
      return false;
    }
    return true;
  }, [name, rulesForGenericList.length, showMessage]);

  const handleRuleSelectionSave = (selectedRules: FullRule[]) => {
    setAssociatedRules(selectedRules);
    const rulesGenericList = selectedRules.map((r) => ({
      id: r.id,
      title: r.name,
      icon: "flat-color-icons:settings",
    }));
    setRulesForGenericList(rulesGenericList);
    setIsRuleSelectorOpen(false);
  };

  const handleRuleListRemove = (ruleId: number) => {
    setAssociatedRules((prev) => prev.filter((r) => r.id !== ruleId));
    setRulesForGenericList((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleRemoveFolder = (folderId: number) => {
    setAssociatedFolders((prev) => prev.filter((x) => x.id !== folderId));
    setFoldersForGenericList((prev) => prev.filter((x) => x.id !== folderId));
    setFolderIdToUnwatch((state) => state.add(folderId));
  };

  const handleFolderSelectionSave = (selectedFolders: FolderSchema[]) => {
    setAssociatedFolders(selectedFolders);
    const selectedFoldersForGenericList: GenericListItemsType[] = selectedFolders.map((sf) => ({
      id: sf.id,
      title: sf.name,
      subtitle: sf.fullPath,
    }));
    setFoldersForGenericList(selectedFoldersForGenericList);
    setIsFolderSelectorOpen(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const currentData = {
      id,
      name,
      description,
      icon,
      associatedFolders,
      associatedRules,
      isSystem,
    };

    // Não faz nada se os dados não mudaram
    if (isEqual(normalizeSafe(initialData), normalizeSafe(currentData))) {
      showMessage("Nenhuma alteração efetuada.", "info");
      closePopup();
      return;
    }

    try {
      if (profileToEdit) {
        // Lógica de ATUALIZAÇÃO
        const updatedProfile = {
          ...profileToEdit,
          name,
          description,
          iconId: icon,
          folders: associatedFolders,
          rules: associatedRules,
        };
        const responseProfile = await updateProfile(updatedProfile);
        if (responseProfile.status) {
          if (foldersIdToUnwatch.size > 0) {
            const pathsToUnwatch = new Set<string>();
            for (const id of foldersIdToUnwatch) {
              const count = await window.api.profile.getCountProfilesWithFolder(id);
              if (count > 1) continue;

              const responseFolder = await window.api.folder.getFolderById(id);

              if (responseProfile.status && responseFolder.items)
                pathsToUnwatch.add(responseFolder.items.fullPath);
            }
            if (pathsToUnwatch.size > 0) {
              window.api.monitoring.stopMonitoring(Array.from(pathsToUnwatch));
              pathsToUnwatch.clear();
              foldersIdToUnwatch.clear();
            }
          }
          window.api.monitoring.startMonitoringProfileFolders(updatedProfile.id, true);
          showMessage("Perfil atualizado com sucesso!", "success");
          closePopup();
        } else showMessage("Erro ao atualizar o perfil!", "error");
      } else {
        // Lógica de CRIAÇÃO
        const newProfile: NewFullProfile = {
          name: currentData.name,
          description: currentData.description,
          folders: currentData.associatedFolders,
          rules: currentData.associatedRules,
          isActive: true,
          iconId: CommonIcons.find((x) => x.icon === currentData.icon)?.icon ?? "",
        };
        const response = await addProfile(newProfile);
        showMessage(response.message, response.status ? "success" : "error");
        if (response.status && response.items) {
          closePopup();
          window.api.monitoring.startMonitoringProfileFolders(response.items?.id, true);
        }
      }
      onUpdateSuccess();
    } catch (error) {
      const e = error as { message: string };
      showMessage(e.message, "error");
    }
  }, [
    validateForm,
    id,
    name,
    description,
    icon,
    associatedFolders,
    associatedRules,
    isSystem,
    initialData,
    showMessage,
    closePopup,
    profileToEdit,
    onUpdateSuccess,
    updateProfile,
    foldersIdToUnwatch,
    addProfile,
  ]);

  if (!isOpen) return null;

  return (
    <>
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
          <ContentWrapper
            id="profile-poup"
            sx={{ gap: "1.5rem", padding: "2rem" }}
            title={profileToEdit ? "Editar Perfil" : "Criar Novo Perfil"}
            titleTagType="h3"
            commonBtn={{
              style: "outlined",
              text: "X",
              Action: closePopup,
            }}
            hr
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <GenericInput
                value={name}
                onChangeInput={(e) => setName(e.target.value)}
                name="profileName"
                placeholder="Ex: Trabalho, Celular, Casa"
                label="Nome do Perfil"
                inputSize="small"
                maxLength={25}
                required
              />

              <GenericInput
                value={description}
                onChangeInput={(e) => setDescription(e.target.value)}
                name="profileDescription"
                label="Descrição"
                placeholder="Descreva para que serve este perfil"
                multiline
                rows={2}
                inputSize="small"
                maxLength={100}
              />

              <Box>
                <Typography gutterBottom sx={{ fontSize: theme.typography.subtitle1 }}>
                  Ícone
                </Typography>
                <IconSelector iconName={icon} onChangeIcon={(e) => setIcon(e)} />
              </Box>
            </Box>

            <ContentWrapper
              title="Pastas"
              sx={{ gap: "0.5rem" }}
              commonBtn={{ text: "Gerenciar Pastas", Action: () => setIsFolderSelectorOpen(true) }}
              titleTagType="h4"
              hr
            >
              <GenericList
                mode="page"
                btnDelete
                listItemSx={{ padding: "2px 0px" }}
                isButton={false}
                onClickDelete={handleRemoveFolder}
                list={foldersForGenericList}
              />
            </ContentWrapper>

            <ContentWrapper
              sx={{ gap: "0.5rem" }}
              id="rulesList"
              title="Regras"
              commonBtn={{
                text: "Gerenciar Regras",
                Action: isSystem ? undefined : () => setIsRuleSelectorOpen(true),
              }}
              titleTagType="h4"
              hr
            >
              <GenericList
                btnDelete
                listItemSx={{ padding: "2px 0px" }}
                isButton={false}
                onClickDelete={isSystem ? undefined : handleRuleListRemove}
                list={rulesForGenericList}
              />
            </ContentWrapper>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 1 }}>
              <hr />

              <Stack spacing={2} direction={"row"} justifyContent={"end"}>
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

                <Button
                  variant="contained"
                  sx={{
                    fontSize: 12,
                    borderRadius: theme.shape.borderRadius,
                  }}
                  onClick={handleSubmit}
                >
                  {profileToEdit ? "Salvar" : "Criar"}
                </Button>
              </Stack>
            </Box>
          </ContentWrapper>
        </Box>
      </Modal>
      <Modal
        open={isRuleSelectorOpen}
        onClose={() => setIsRuleSelectorOpen(false)}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 8,
          width: "90vw",
          height: "90vh",
          margin: "auto",
        }}
      >
        <RuleManagementView
          mode="selection"
          initialSelectedRules={associatedRules}
          onSelectionSave={handleRuleSelectionSave}
          onCancel={() => setIsRuleSelectorOpen(false)}
        />
      </Modal>

      <Modal
        open={isFolderSelectorOpen}
        onClose={() => setIsFolderSelectorOpen(false)}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 8,
          width: "90vw",
          height: "90vh",
          margin: "auto",
        }}
      >
        <FolderManagementView
          mode="selection"
          initialSelectedFolders={associatedFolders}
          onSelectionSave={handleFolderSelectionSave}
          onCancel={() => setIsFolderSelectorOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ProfilePopup;
