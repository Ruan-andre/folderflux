import { useEffect, useState } from "react";
import { useRuleStore } from "../../store/ruleStore";
import RuleTabs from "../../components/RuleTabs";
import ContentWrapper from "../../components/ContentWrapper";
import RulePopup from "../../components/RulePopup";
import { useRulePopupStore } from "../../store/popupRuleStore";
import { Box, Button, Stack } from "@mui/material";
import { RuleSchema } from "@/db/schema";

type RuleManagementViewProps = {
  mode: "page" | "selection";
  initialSelectedRules?: RuleSchema[];
  onSelectionSave?: (selecteds: RuleSchema[]) => void;
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

  const [selectedRules, setSelectedRule] = useState<RuleSchema[]>(initialSelectedRules);

  const handleUpdateSuccess = async () => {
    await getRules();
  };

  useEffect(() => {
    async function fetchData() {
      await getRules();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler para quando um checkbox é marcado/desmarcado
  const handleSelectionChange = (rule: RuleSchema) => {
    setSelectedRule((prevSelected) =>
      prevSelected.includes(rule) ? prevSelected.filter((r) => r.id !== rule.id) : [...prevSelected, rule]
    );
  };

  const handleSaveClick = () => {
    if (onSelectionSave) {
      onSelectionSave(selectedRules);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <ContentWrapper
          title="Regras de Organização"
          commonBtn={{
            style: "contained",
            Action: () => openPopup("create"),
            text: "Adicionar Regra",
          }}
        >
          {rules && (
            <RuleTabs
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
          sx={{ borderTop: 1, borderColor: "divider", flexShrink: 0 }} // flexShrink: 0 impede que ele encolha
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

export default RuleManagementView;
