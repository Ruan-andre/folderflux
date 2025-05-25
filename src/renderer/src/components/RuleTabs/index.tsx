import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";
import { RuleProps } from "../../types/RulesProps";
import Rule from "../Rule";

const tabNames = ["Todas", "Ativas", "Sistema", "Personalizadas"];

const RuleTabs = ({ tabContents }: { tabContents?: RuleProps[] }) => {
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

    return filtered.map((rule) => <Rule key={rule.id} {...rule} />);
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
