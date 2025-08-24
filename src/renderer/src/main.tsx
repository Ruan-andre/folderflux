import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/globals.css";
import { SnackbarProvider } from "./context/SnackBarContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <ConfirmDialogProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ConfirmDialogProvider>
    </ThemeProvider>
  </StrictMode>
);
