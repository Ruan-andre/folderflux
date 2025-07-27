import { Tabs, Tab, Box, Checkbox } from "@mui/material";
import { useState } from "react";
import Rule from "../Rule";
import { FullRule } from "../../types/RuleWithDetails";
import { RuleSchema } from "~/src/db/schema";

const tabNames = ["Todas", "Ativas", "Sistema", "Personalizadas"];

type RuleTabsProps = {
  tabContents?: FullRule[];
  // ✅ Novas props para controlar o modo de seleção
  mode: "page" | "selection";
  selectedRules: RuleSchema[];
  onSelectionChange: (rule: RuleSchema) => void;
};

const RuleTabs = ({ tabContents, mode, selectedRules, onSelectionChange }: RuleTabsProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const filterContent = (value: number) => {
    if (!tabContents) return null;

    let filtered = tabContents;

    if (value === 1) filtered = filtered.filter((r) => r.isActive);
    if (value === 2) filtered = filtered.filter((r) => r.isSystem);
    if (value === 3) filtered = filtered.filter((r) => !r.isSystem);

    return filtered.map((rule) => (
      <Box key={rule.id} display="flex" alignItems="center" gap={1} width="100%">
        {mode === "selection" && (
          <Checkbox
            checked={selectedRules?.some((x) => x.id === rule.id)}
            onChange={() => onSelectionChange(rule as RuleSchema)}
          />
        )}
        <Box flex={1}>
          <Rule {...rule} />
        </Box>
      </Box>
    ));
  };

  if (!tabContents || tabContents.length === 0) return null;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Tabs value={value} onChange={handleChange}>
        {tabNames.map((item, index) => (
          <Tab
            key={index}
            label={item}
            sx={{ fontSize: (theme) => theme.typography.subtitle1, textTransform: "none" }}
          />
        ))}
      </Tabs>
      {filterContent(value)}
    </Box>
  );
};

export default RuleTabs;
