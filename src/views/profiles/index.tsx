import { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import Profile from "../../components/Profile";
import ProfilePopup from "../../components/ProfilePopup";

const Profiles = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PageWrapper
      title="Perfis de Organização"
      action="btn"
      btn={{ Action: () => setIsOpen(true), text: "Criar Perfil" }}
    >
      <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        <Profile />
        <Profile />
        <Profile />
        <Profile />
        <Profile />
        <Profile />
      </div>
      <ProfilePopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </PageWrapper>
  );
};

export default Profiles;
