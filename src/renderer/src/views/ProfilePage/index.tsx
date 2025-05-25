import { useState } from "react";
import ContentWrapper from "../../components/ContentWrapper";
import Profile from "../../components/Profile";
import ProfilePopup from "../../components/ProfilePopup";

const ProfilePage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ContentWrapper
      title="Perfis de Organização"
      action="btn"
      btn={{ Action: () => setIsOpen(true), text: "Criar Perfil" }}
    >
      <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        <Profile />
      </div>
      <ProfilePopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ContentWrapper>
  );
};

export default ProfilePage;
