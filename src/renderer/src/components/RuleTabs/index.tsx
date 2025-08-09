import { Tabs, Tab, Box, Checkbox } from "@mui/material";
import { useState } from "react";
import Rule from "../Rule";
import { FullRule } from "../../../../shared/types/RuleWithDetails";

const tabNames = ["Todas", "Ativas", "Sistema", "Personalizadas"] as const;

type RuleTabsProps = {
  tabContents: FullRule[];
  mode: "page" | "selection";
  selectedRules: FullRule[];
  onSelectionChange: (rule: FullRule) => void;
};

const RuleTabs = ({ tabContents, mode, selectedRules, onSelectionChange }: RuleTabsProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const isSelected = (id: number) => selectedRules.some((rule) => rule.id === id);

  const renderRuleItem = (rule: FullRule) => (
    <Box key={rule.id} display="flex" alignItems="center" gap={1} width="100%">
      {mode === "selection" && (
        <Checkbox
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
      case 1:
        return tabContents.filter((r) => r.isActive);
      case 2:
        return tabContents.filter((r) => r.isSystem);
      case 3:
        return tabContents.filter((r) => !r.isSystem);
      default:
        return tabContents;
    }
  };

  if (tabContents.length === 0) return null;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        {tabNames.map((label, index) => (
          <Tab
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
