import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "./assets/css/globals.css";
import "shepherd.js/dist/css/shepherd.css";
import "./assets/css/tour.css";
import { SnackbarProvider } from "./context/SnackBarContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./context/ThemeContext";
import AudioPlayer from "./components/audioPlayer/main";
import { TourController } from "./components/TourController";
// Registro de coleções de ícones Iconify para uso offline
import "./icons/registerCollections";

const container = document.getElementById("root");

const root = createRoot(container!);

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("view") === "audioPlayer") {
  root.render(<AudioPlayer />);
} else {
  root.render(
    <StrictMode>
      <ThemeProvider>
        <CssBaseline />
        <ConfirmDialogProvider>
          <SnackbarProvider>
            <App />
            <TourController />
          </SnackbarProvider>
        </ConfirmDialogProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
