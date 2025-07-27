import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import GenericCard from "../GenericCard";
import Icon from "../../assets/icons";
import CrudButtons from "../CrudButtons";
import { FullProfile } from "../../types/ProfileWithDetails";
import { useSnackbar } from "../../context/SnackBarContext";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { useProfileStore } from "../../store/profileStore";
import { useProfilePopupStore } from "../../store/popupProfileStore";

const Profile = ({
  id,
  name,
  description,
  iconId = "fluent-emoji:file-folder",
  isActive,
  folders,
  rules,
}: FullProfile) => {
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const { showConfirm } = useConfirmDialog();
  const { deleteProfile, duplicateProfile, toggleActive } = useProfileStore();
  const { openPopup } = useProfilePopupStore();

  const profileToEdit: FullProfile = {
    id,
    name,
    description,
    iconId,
    isActive,
    folders,
    rules,
  };

  const handleDeleteProfile = async (selectedId: number) => {
    showConfirm(
      { title: "Confirmar Exclusão", message: "Esta ação não poderá ser desfeita, deseja continuar?" },
      async () => {
        const response = await deleteProfile(selectedId);
        if (response.status) {
          showMessage(response.message, "success");
        } else {
          showMessage(response.message, "error");
        }
      }
    );
  };

  const handleDuplicateProfile = async (profile: FullProfile) => {
    const response = await duplicateProfile(profile);
    if (response.status && response.items) showMessage("Perfil duplicado com sucesso!", "success");
    else showMessage(response.message, "error");
  };

  const handleToggleStatus = (id: number) => {
    toggleActive(id);
  };

  if (!id) return;

  return (
    <GenericCard
      displayCardStyle="flex"
      flexDirectionCard="column"
      gapCard="1rem"
      title={name}
      widthCard="370px"
      heightCard="235px"
      bgColor="#242A35"
      paddingCard={4}
      border="1px solid rgba(255, 255, 255, 0.1)"
      icon={<Icon icon={iconId} width="30" height="30" />}
      bgColorIcon="#273048"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Tooltip title={description} slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}>
          <Typography
            variant="body2"
            fontSize="1.5rem"
            color="var(--title-gray-dark)"
            sx={{
              // ✅ Estilos para o truncamento de múltiplas linhas
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2, // Define o máximo de 2 linhas
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </Typography>
        </Tooltip>
        <Box display={"flex"} gap={2}>
          {rules.length > 0 && (
            <div>
              <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}>
                {rules?.length}{" "}
              </span>
              {rules?.length > 1 ? "Regras" : "Regra"}
            </div>
          )}
          {folders?.length > 0 && (
            <div>
              <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}>
                {" "}
                {folders.length}{" "}
              </span>
              {folders.length > 1 ? "Pastas" : "Pasta"}
            </div>
          )}
        </Box>
        <Box display={"flex"} gap={1}>
          <CrudButtons
            id={id}
            onActivate={(e) => {
              e.stopPropagation();
              handleToggleStatus(id);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              handleDeleteProfile(id);
            }}
            onDuplicate={(e) => {
              e.stopPropagation();
              handleDuplicateProfile(profileToEdit);
            }}
            onEdit={(e) => {
              e.stopPropagation();
              openPopup("edit", profileToEdit);
            }}
            status={isActive}
          />
        </Box>
      </Box>
    </GenericCard>
  );
};

export default Profile;
