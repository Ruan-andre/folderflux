import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Icon from "../../assets/icons/";
import CommonIcons from "../../types/CommonIconsType";

export default function IconSelector({
  iconName,
  onChangeIcon,
}: {
  iconName: string;
  onChangeIcon: (iconId: string) => void;
}) {
  const [selected, setSelected] = useState(iconName ?? "fluent-color:home-32");

  const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    event.preventDefault();
    if (newValue !== null) {
      setSelected(newValue);
      onChangeIcon(newValue);
    }
  };

  return (
    <ToggleButtonGroup value={selected} exclusive onChange={handleChange} sx={{ display: "flex", gap: 1 }}>
      {CommonIcons.map(({ value, icon }) => (
        <ToggleButton
          key={value}
          value={icon}
          disableRipple
          disableFocusRipple
          sx={{
            padding: 1.5,
            border: "none",
          }}
        >
          <Icon icon={icon} width={25} height={25} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
