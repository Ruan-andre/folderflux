import { useEffect } from "react";
import ContentWrapper from "../../components/ContentWrapper";
import Profile from "../../components/Profile";
import ProfilePopup from "../../components/ProfilePopup";
import { useProfileStore } from "../../store/profileStore";
import { useProfilePopupStore } from "../../store/popupProfileStore";
import { Box } from "@mui/material";

const ProfilePage = () => {
  const { profiles, getProfiles } = useProfileStore();
  const { openPopup } = useProfilePopupStore();

  const handleUpdateSuccess = async () => {
    await getProfiles();
  };

  useEffect(() => {
    async function fetchData() {
      await getProfiles();
    }
    fetchData();
  }, [getProfiles]);

  return (
    <ContentWrapper
      title="Perfis de Organização"
      commonBtn={{ Action: () => openPopup("create"), text: "Criar Perfil" }}
    >
      <Box display={"flex"} gap={"3rem 3rem"} flexWrap="wrap" justifyContent={"center"}>
        {profiles.map((p) => {
          return (
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
              />
            </div>
          );
        })}
      </Box>

      <ProfilePopup onUpdateSuccess={handleUpdateSuccess} />
    </ContentWrapper>
  );
};

export default ProfilePage;
