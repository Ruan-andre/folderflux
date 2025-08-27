import { useEffect, useState } from "react";
import { useProfileStore } from "../../store/profileStore";
import ProfilePopup from "../../components/ProfilePopup";
import ContentWrapper from "../../components/ContentWrapper";
import { useProfilePopupStore } from "../../store/popupProfileStore";
import { Box, Button, Stack, List, ListItem, Checkbox, ListItemText } from "@mui/material";
import Profile from "../../components/Profile";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";

type ProfileManagementViewProps = {
  mode: "page" | "selection";
  initialSelectedProfiles?: FullProfile[];
  onSelectionSave?: (selecteds: FullProfile[]) => void;
  onCancel?: () => void;
};

const ProfileManagementView = ({
  mode,
  initialSelectedProfiles = [],
  onSelectionSave,
  onCancel,
}: ProfileManagementViewProps) => {
  const { profiles, getProfiles } = useProfileStore();
  const { openPopup } = useProfilePopupStore();

  const [selectedProfiles, setSelectedProfiles] = useState<FullProfile[]>(initialSelectedProfiles);

  const handleUpdateSuccess = async () => {
    await getProfiles();
  };

  useEffect(() => {
    async function fetchData() {
      await getProfiles();
    }
    fetchData();
  }, [getProfiles]);

  const handleSelectionChange = (profile: FullProfile) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.some((pr) => pr.id === profile.id)
        ? prevSelected.filter((p) => p.id !== profile.id)
        : [...prevSelected, profile]
    );
  };

  const handleSaveClick = () => {
    if (onSelectionSave) {
      onSelectionSave(selectedProfiles);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "100%", overflow: "hidden" }}>
      <Box sx={{ overflowY: "auto" }}>
        <ContentWrapper
          title="Perfis de Organização"
          commonBtn={{
            style: "contained",
            Action: () => openPopup("create"),
            text: "Criar Perfil",
          }}
        >
          {mode === "page" ? (
            <Box display={"flex"} gap={"3rem 3rem"} flexWrap="wrap" justifyContent={"center"}>
              {profiles.map((p) => (
                <div
                  key={p.id}
                  style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}
                  onClick={() => {
                    openPopup("edit", p);
                  }}
                >
                  <Profile
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    description={p.description}
                    rules={p.rules}
                    folders={p.folders}
                    iconId={p.iconId}
                    isActive={p.isActive}
                    isSystem={p.isSystem}
                  />
                </div>
              ))}
            </Box>
          ) : (
            <List>
              {profiles.map((profile) => (
                <ListItem
                  key={profile.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={selectedProfiles.some((p) => p.id === profile.id)}
                      onChange={() => handleSelectionChange(profile)}
                    />
                  }
                >
                  <ListItemText
                    primary={profile.name}
                    secondary={profile.description}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: (theme) => theme.typography.h4,
                      },
                      "& .MuiListItemText-secondary": {
                        fontSize: (theme) => theme.typography.fontSize * 1.2,
                        fontWeight: (theme) => theme.typography.fontWeightLight,
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </ContentWrapper>
      </Box>

      <ProfilePopup onUpdateSuccess={handleUpdateSuccess} />

      {mode === "selection" && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          p={2}
          sx={{ borderTop: 1, borderColor: "divider", flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            color="error"
            sx={{
              fontSize: 12,
              borderRadius: 8,
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

export default ProfileManagementView;
