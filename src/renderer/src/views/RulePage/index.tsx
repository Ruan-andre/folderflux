import { useEffect } from "react";
import { useRuleStore } from "../../store/ruleStore";
import RuleTabs from "../../components/RuleTabs";
import ContentWrapper from "../../components/ContentWrapper";
import RulePopup from "../../components/RulePopup";
import { useRulePopupStore } from "../../store/popupRuleStore";

const RulePage = () => {
  const { rules, fetchRules } = useRuleStore();
  const { closePopup, openPopup, isOpen } = useRulePopupStore();

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (rules.length === 0) return;

  return (
    <ContentWrapper
      title="Regras de Organização"
      commonBtn={{
        style: "contained",
        Action: () => openPopup("create"),
        text: "Adicionar Regra",
      }}
    >
      <RuleTabs tabContents={rules} />
      <RulePopup isOpen={isOpen} onClose={() => closePopup()}  />
    </ContentWrapper>
  );
};

export default RulePage;
