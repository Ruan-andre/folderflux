import { Tabs, Tab, Box, Checkbox } from "@mui/material";
import { useState } from "react";
import Rule from "../Rule";
import { FullRule } from "../../../../shared/types/RuleWithDetails";

const tabNames = ["Ativas", "Desativadas", "Personalizadas", "Sistema", "Todas"] as const;

type RuleTabsProps = {
  tabContents: FullRule[];
  mode: "page" | "selection";
  selectedRules: FullRule[];
  onSelectionChange: (rule: FullRule) => void;
  children?: React.ReactNode;
};

const RuleTabs = ({
  tabContents,
  mode,
  selectedRules,
  onSelectionChange,
  ...rest
}: RuleTabsProps & React.HtmlHTMLAttributes<HTMLElement>) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const isSelected = (id: number) => selectedRules.some((rule) => rule.id === id);

  const renderRuleItem = (rule: FullRule) => (
    <Box key={rule.id} display="flex" alignItems="center" gap={1} width="100%">
      {mode === "selection" && (
        <Checkbox
          className="chk-rule"
          checked={isSelected(rule.id)}
          onChange={() =>
            onSelectionChange({
              id: rule.id,
              name: rule.name,
              description: rule.description,
              isActive: rule.isActive,
              isSystem: rule.isSystem,
              action: rule.action,
              conditionsTree: rule.conditionsTree,
              fromTour: rule.fromTour,
            })
          }
        />
      )}
      <Box flex={1}>
        <Rule {...rule} />
      </Box>
    </Box>
  );

  const getFilteredRules = () => {
    switch (tabIndex) {
      // ATIVAS
      case 0:
        return tabContents.filter((r) => r.isActive);
      // DESATIVADAS
      case 1:
        return tabContents.filter((r) => !r.isActive);
      // PERSONALIZADAS
      case 2:
        return tabContents.filter((r) => !r.isSystem);
      // SISTEMA
      case 3:
        return tabContents.filter((r) => r.isSystem);
      default:
        return tabContents;
    }
  };

  if (tabContents.length === 0) return null;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }} {...rest}>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        {tabNames.map((label, index) => (
          <Tab
            id="rule-tabs-filter"
            key={index}
            label={label}
            sx={{ fontSize: (theme) => theme.typography.subtitle1, textTransform: "none" }}
          />
        ))}
      </Tabs>

      {getFilteredRules().map(renderRuleItem)}
    </Box>
  );
};

export default RuleTabs;
