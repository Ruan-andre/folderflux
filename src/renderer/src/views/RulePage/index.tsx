import { useState } from "react";
import GenericTabs from "../../components/GenericTabs";
import ContentWrapper from "../../components/ContentWrapper";
import Rule from "../../components/Rule";
import RulePopup from "../../components/RulePopup";

const RulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ContentWrapper
      title="Regras de Organização"
      action="btn"
      btn={{
        style: "contained",
        Action: () => {
          setIsOpen(true);
        },
        text: "Adicionar Regra",
      }}
    >
      <GenericTabs
        tabNames={["Todas", "Ativas", "Sistema", "Personalizadas"]}
        tabContents={[
          <Rule
            title="Fotos por data"
            extension={["PDF", "TIFF", "JPG"]}
            description="Organiza fotos em pastas por ano/mês (ex: Imagens/2024/03-Março)"
          />,
          <Rule
            title="Sistema"
            extension={["PDF", "TIFF", "JPG"]}
            description="Organiza fotos em pastas por ano/mês (ex: Imagens/2024/03-Março)"
          />,
        ]}
      />
      <RulePopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ContentWrapper>
  );
};

export default RulePage;
