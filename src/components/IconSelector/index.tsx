import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Icon } from "@iconify/react";

type IconOption = {
  value: string;
  icon: string;
};

export default function IconSelector() {
  const [selected, setSelected] = useState("home");

  const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    event.preventDefault();
    if (newValue !== null) {
      setSelected(newValue);
    }
  };

  const iconOptions: IconOption[] = [
    { value: "home", icon: "fluent-color:home-32" },
    { value: "briefcase", icon: "noto:briefcase" },
    { value: "smartphone", icon: "flat-color-icons:two-smartphones" },
    { value: "music", icon: "emojione-v1:music-descend" },
    { value: "camera", icon: "noto:camera" },
    { value: "folder", icon: "fluent-emoji:file-folder" },
  ];

  return (
    <ToggleButtonGroup value={selected} exclusive onChange={handleChange} sx={{ display: "flex", gap: 1 }}>
      {iconOptions.map(({ value, icon }) => (
        <ToggleButton
          key={value}
          value={value}
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
