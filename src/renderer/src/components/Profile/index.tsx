import { Box, styled, Typography } from "@mui/material";
import GenericCard from "../GenericCard";
import Icon from "../../assets/icons";
import CrudButtons from "../CrudButtons";
import { FullProfile } from "../../../../shared/types/ProfileWithDetails";
import { useSnackbar } from "../../context/SnackBarContext";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { useProfileStore } from "../../store/profileStore";
import { useProfilePopupStore } from "../../store/popupProfileStore";
import LabelTextWithTooltip from "../LabelTextWithTooltip";

const Profile = ({
  id,
  name,
  description,
  iconId = "fluent-emoji:file-folder",
  isActive,
  folders,
  rules,
  isSystem,
}: FullProfile) => {
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
    isSystem,
  };

  const handleDeleteProfile = async (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    return showConfirm(
      { title: "Confirmar Exclusão", message: "Esta ação não poderá ser desfeita, deseja continuar?" },
      async () => {
        window.api.monitoring.stopMonitoringProfileFolders(id);
        const response = await deleteProfile(id);
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
    if (isActive) window.api.monitoring.stopMonitoringProfileFolders(id);
    else window.api.monitoring.startMonitoringProfileFolders(id);
  };

  if (!id) return;

  const ProfileCard = styled(GenericCard)(() => ({
    display: "flex",
    flexDirection: "column",
    width: "37rem",
    height: "23.5rem",
    gap: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  }));

  return (
    <ProfileCard
      title={name}
      icon={<Icon icon={iconId} width="30" height="30" />}
      iconSx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#323e5fff" : theme.palette.primary.light,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <LabelTextWithTooltip
          tooltipText={description!}
          text={description!}
          breakLine
          typographySX={(theme) => ({
            fontSize: theme.typography.subtitle1.fontSize,
            fontVariant: "body2",
            color: theme.palette.text.secondary,
          })}
        />

        <Box display={"flex"} gap={2}>
          {rules.length > 0 && (
            <Box>
              <Typography component={"span"} variant="h5" color="primary.main">
                {rules?.length}{" "}
              </Typography>
              {rules?.length > 1 ? "Regras" : "Regra"}
            </Box>
          )}
          {folders?.length > 0 && (
            <Box>
              <Typography component={"span"} variant="h5" color="primary.main">
                {folders.length}{" "}
              </Typography>
              {folders.length > 1 ? "Pastas" : "Pasta"}
            </Box>
          )}
        </Box>
        <Box display={"flex"} gap={1}>
          <CrudButtons
            id={id}
            onActivate={(e) => {
              e.stopPropagation();
              handleToggleStatus(id);
            }}
            onDelete={isSystem ? undefined : handleDeleteProfile}
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
    </ProfileCard>
  );
};

export default Profile;
