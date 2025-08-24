import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4361ee",
      light: "#a3bffa",
      dark: "#2d3748",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#7f8fa6",
    },
    background: {
      default: "#1a1d24",
      paper: "#242a35",
    },
    divider: "#2d3748",
    action: {
      hover: "#2d3748",
      selected: "#374151",
    },
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontSize: 16,
    caption: { fontSize: "1.8rem" },
    subtitle1: { fontSize: "1.5rem" },
    fontWeightBold: "bold",
    h5: { fontWeight: 600 },
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
