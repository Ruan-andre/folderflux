import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type SnackbarType = AlertColor;

type VerticalAlignType = "top" | "bottom";
type HorizontalAlignType = "left" | "center" | "right";

type SnackbarContextType = {
  showMessage: (
    message: string,
    severity?: SnackbarType,
    verticalAlign?: "bottom" | "top",
    horizontalAlign?: "left" | "center" | "right"
  ) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<SnackbarType>("info");
  const [verticalAlign, setverticalAlign] = useState<VerticalAlignType>("top");
  const [horizontalAlign, sethorizontalAlign] = useState<HorizontalAlignType>("right");

  const showMessage = (
    msg: string,
    sev: SnackbarType = "info",
    verticalAlign?: VerticalAlignType,
    horizontalAlign?: HorizontalAlignType
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);

    if (verticalAlign) setverticalAlign(verticalAlign);
    if (horizontalAlign) sethorizontalAlign(horizontalAlign);
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      <SnackbarContext.Provider value={{ showMessage }}>{children}</SnackbarContext.Provider>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ vertical: verticalAlign, horizontal: horizontalAlign }}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "2rem",
            "& .MuiAlert-icon": {
              fontSize: "2.5rem",
              marginRight: "1rem",
              alignItems: "center",
            },
            display: "flex",
            alignItems: "center",
            color: "#FFF",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within SnackbarProvider");
  return context;
};
