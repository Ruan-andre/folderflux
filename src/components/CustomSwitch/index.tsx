import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 24,
  padding: 0,
  display: "flex",
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(18px)",
      color: theme.palette.text.primary || "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#4361EE",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 20,
    height: 20,
    backgroundColor: "#fff",
  },
  "& .MuiSwitch-track": {
    borderRadius: 24,
    backgroundColor: "#aaa",
    opacity: 1,
  },
}));

export default CustomSwitch;
