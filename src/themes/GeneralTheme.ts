import { createTheme } from "@mui/material";

export const GeneralTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4361ee",
    },
    text: { primary: "#FFFFFF", secondary: "#7f8fa6" },
    background: {
      default: "#1a1d24",
      paper: "#242a35",
    },
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontSize: 16,
    caption: { fontSize: "1.8rem" },
    subtitle1: { fontSize: "1.5rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        outlined: {
          transition: "0.3s",
          ":hover": {
            color: "#FFFFFF",
            backgroundColor: "#4361ee",
          },
        },
      },
    },
  },
});
