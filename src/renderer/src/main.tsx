import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/globals.css";
import { SnackbarProvider } from "./context/SnackBarContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </StrictMode>
);
