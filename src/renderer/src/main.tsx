import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/globals.css";
import { SnackbarProvider } from "./context/SnackBarContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { GeneralTheme } from "./themes/GeneralTheme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={GeneralTheme}>
      <CssBaseline />
      <ConfirmDialogProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ConfirmDialogProvider>
    </ThemeProvider>
  </StrictMode>
);
