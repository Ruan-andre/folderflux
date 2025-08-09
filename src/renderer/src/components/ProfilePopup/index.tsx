import { Box, Button, Modal, Stack, Typography, useTheme } from "@mui/material";
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
import { FullProfile } from "../../../../shared/types/ProfileWithDetails";
import CommonIcons from "../../types/CommonIconsType";
import { FullRule } from "~/src/shared/types/RuleWithDetails";

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
    associatedFolders: FolderSchema[];
    associatedRules: RuleSchema[];
  }>();

  const [rulesForGenericList, setRulesForGenericList] = useState<GenericListItemsType[]>([]);
  const [foldersForGenericList, setFoldersForGenericList] = useState<GenericListItemsType[]>([]);
  const [isRuleSelectorOpen, setIsRuleSelectorOpen] = useState(false);
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);

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
        };

        const foldersForGenericList: GenericListItemsType[] = folders.map((f) => ({
          id: f.id!,
          title: f.name,
          subtitle: f.fullPath,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profileToEdit]);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      showMessage("O nome do perfil é obrigatório.", "error");
      return false;
    }
    return true;
  }, [name, showMessage]);

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
    };

    // Não faz nada se os dados não mudaram
    if (isEqual(initialData, currentData)) {
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
        const response = await updateProfile(updatedProfile);
        if (response.status) {
          showMessage("Perfil atualizado com sucesso!", "success");
          closePopup();
        } else showMessage("Erro ao atualizar o perfil!", "error");
      } else {
        // Lógica de CRIAÇÃO
        const newProfile: FullProfile = {
          name: currentData.name,
          description: currentData.description,
          folders: currentData.associatedFolders,
          rules: currentData.associatedRules,
          isActive: true,
          iconId: CommonIcons.find((x) => x.value === currentData.icon)?.icon,
        };
        const response = await addProfile(newProfile);
        showMessage(response.message, response.status ? "success" : "error");
        if (response.status) closePopup();
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
    initialData,
    showMessage,
    closePopup,
    profileToEdit,
    onUpdateSuccess,
    updateProfile,
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
            title={profileToEdit ? "Editar Perfil" : "Criar Novo Perfil"}
            titleSize={22}
            commonBtn={{
              style: "outlined",
              text: "X",
              Action: closePopup,
            }}
            gap="1.5rem"
            padding="2rem"
            hr
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <GenericInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                name="profileName"
                placeholder="Ex: Trabalho, Celular, Casa"
                label="Nome do Perfil"
                inputSize="small"
                maxLength={25}
                required
              />

              <GenericInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              commonBtn={{ text: "Gerenciar Pastas", Action: () => setIsFolderSelectorOpen(true) }}
              gap="0.5rem"
              titleSize={18}
              hr
            >
              <GenericListItems
                mode="page"
                btnDelete
                isButton={false}
                onClickDelete={(e) => {
                  handleRemoveFolder(e);
                }}
                list={foldersForGenericList}
                titleSize="1.5rem"
                listItemPadding="0px"
                maxListHeight="15rem"
              />
            </ContentWrapper>

            <ContentWrapper
              title="Regras"
              commonBtn={{ text: "Gerenciar Regras", Action: () => setIsRuleSelectorOpen(true) }}
              gap="0.5rem"
              titleSize={18}
              hr
            >
              <GenericListItems
                btnDelete
                isButton={false}
                onClickDelete={(e) => {
                  handleRuleListRemove(e);
                }}
                list={rulesForGenericList}
                titleSize="1.5rem"
                listItemPadding="0px"
                maxListHeight="15rem"
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
