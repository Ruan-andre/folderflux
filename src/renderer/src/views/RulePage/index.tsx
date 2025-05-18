import { useEffect, useState } from "react";
import GenericTabs from "../../components/GenericTabs";
import ContentWrapper from "../../components/ContentWrapper";
import Rule from "../../components/Rule";
import RulePopup from "../../components/RulePopup";

const tabNames: string[] = ["Todas", "Ativas", "Sistema", "Personalizadas"];

const RulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<React.ReactNode[]>();
  useEffect(() => {
    const fetchData = async () => {
      const result = await window.api.getAllRules();
      const items = result.map((item) => {
        return (
          <Rule
            key={item.id}
            id={item.id}
            name={item.name}
            description={item?.description}
            extensions={item?.extensions}
          />
        );
      });

      setRules(items);
    };

    fetchData();
  }, [isOpen]);
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
      <GenericTabs tabNames={tabNames} tabContents={rules} />
      <RulePopup popupTitle="Criar Nova Regra" isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ContentWrapper>
  );
};

export default RulePage;
