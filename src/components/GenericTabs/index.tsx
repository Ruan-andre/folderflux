import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";

type GenericTabsProps = {
  tabNames: string[];
  tabContents: React.ReactNode[];
  tabTitle?: string;
};
const GenericTabs = ({ tabNames, tabTitle, tabContents }: GenericTabsProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (tabNames.length === 0) return;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Tabs value={value} onChange={handleChange} aria-label={tabTitle}>
        {tabNames.map((item, index) => {
          return (
            <Tab
              key={index}
              label={item}
              sx={{ fontSize: (theme) => theme.typography.subtitle1, textTransform: "none" }}
            />
          );
        })}
      </Tabs>
      {value > 0 ? tabContents[value] : tabContents}
    </Box>
  );
};

export default GenericTabs;
