import { useEffect, useState } from "react";
import { useRuleStore } from "../../store/ruleStore";
import RuleTabs from "../../components/RuleTabs";
import ContentWrapper from "../../components/ContentWrapper";
import RulePopup from "../../components/RulePopup";
import { useRulePopupStore } from "../../store/popupRuleStore";
import { Box, Button, Stack } from "@mui/material";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { useTourStore } from "../../store/tourStore";

type RuleManagementViewProps = {
  mode: "page" | "selection";
  initialSelectedRules?: FullRule[];
  onSelectionSave?: (selecteds: FullRule[]) => void;
  onCancel?: () => void;
};

const RuleManagementView = ({
  mode,
  initialSelectedRules = [],
  onSelectionSave,
  onCancel,
}: RuleManagementViewProps) => {
  const { rules, getRules } = useRuleStore();
  const { openPopup } = useRulePopupStore();
  const tourNext = useTourStore((state) => state.tourNext);
  const isTourActive = useTourStore((state) => state.isTourActive);
  const getCurrentStepId = useTourStore((state) => state.getCurrentStepId);

  const [selectedRules, setSelectedRule] = useState<FullRule[]>(initialSelectedRules);

  const handleUpdateSuccess = async () => {
    await getRules();
  };

  useEffect(() => {
    async function fetchData() {
      await getRules();
    }
    fetchData();
  }, [getRules]);

  // Handler para quando um checkbox é marcado/desmarcado
  const handleSelectionChange = (rule: FullRule) => {
    setSelectedRule((prevSelected) =>
      prevSelected.some((pr) => pr.id === rule.id)
        ? prevSelected.filter((r) => r.id !== rule.id)
        : [...prevSelected, rule]
    );
  };

  const handleSaveClick = () => {
    if (onSelectionSave) {
      onSelectionSave(selectedRules);
    }
  };

  const handleAddRuleClick = () => {
    if (isTourActive() && getCurrentStepId() === "add-rule-action") {
      setTimeout(() => {
        tourNext();
      }, 150);
    }
    openPopup("create");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "100%", overflow: "hidden" }}>
      <Box sx={{ overflowY: "auto" }}>
        <ContentWrapper
          title="Regras de Organização"
          commonBtn={{
            style: "contained",
            Action: handleAddRuleClick,
            text: "Adicionar Regra",
            id: "btn-add-rule",
          }}
        >
          {rules && (
            <RuleTabs
              id="rule-tabs"
              tabContents={rules}
              mode={mode}
              selectedRules={selectedRules}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </ContentWrapper>
      </Box>

      <RulePopup onUpdateSuccess={handleUpdateSuccess} />

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
          <Button variant="contained" id="confirm-add-rule" onClick={handleSaveClick}>
            Confirmar Seleção
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default RuleManagementView;
