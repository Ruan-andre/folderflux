// src/context/ConfirmDialogContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
} from "@mui/material";

type ConfirmDialogOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmBtnColor?: "inherit" | "error" | "primary" | "secondary" | "success" | "info" | "warning";
  cancelBtnColor?: "inherit" | "error" | "primary" | "secondary" | "success" | "info" | "warning";
  thirdButton?: {
    text: ConfirmDialogOptions["confirmText"];
    thirdButtonColor?: ConfirmDialogOptions["confirmBtnColor"];
  };
};

type ConfirmDialogContextType = {
  showConfirm: (
    options: ConfirmDialogOptions,
    onConfirm: () => void,
    onThirdButtonAction?: () => void
  ) => void;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirmDialog = () => {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  return ctx;
};

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({});
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});
  const [onThirdButtonAction, setOnThirdButtonAction] = useState<() => void>(() => {});

  const showConfirm = (
    opts: ConfirmDialogOptions,
    confirmCallback: () => void,
    thirdButtonAction?: () => void
  ) => {
    setOptions(opts);
    setOnConfirm(() => confirmCallback);
    if (thirdButtonAction) setOnThirdButtonAction(() => thirdButtonAction);

    setOpen(true);
  };

  const handleConfirm = useCallback(() => {
    onConfirm();
    setOpen(false);
  }, [onConfirm]);

  const handleThirdButtonAction = useCallback(() => {
    if (onThirdButtonAction) onThirdButtonAction();
    setOpen(false);
  }, [onThirdButtonAction]);

  const handleClose = () => setOpen(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
      }
    };

    if (open) document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, handleConfirm]);

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              padding: 2,
              backgroundColor: theme.palette.background.paper,
              minWidth: 360,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "2rem",
            fontWeight: 700,
            paddingBottom: 1,
          }}
        >
          {options.title ?? "Confirmar ação"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: "1.5rem",
              color: theme.palette.text.primary,
              marginBottom: 2,
              whiteSpace: "pre-line",
            }}
          >
            {options.message ?? "Deseja continuar com essa operação?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            color={options.cancelBtnColor ?? "primary"}
            sx={{
              borderRadius: 3,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1.5rem",
            }}
          >
            {options.cancelText ?? "Cancelar"}
          </Button>
          {options?.thirdButton && (
            <Button
              onClick={handleThirdButtonAction}
              variant="contained"
              color={options.thirdButton.thirdButtonColor ?? "warning"}
              sx={{
                borderRadius: 3,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1.5rem",
                color: "#FFF",
              }}
            >
              {options.thirdButton.text}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={options.confirmBtnColor ?? "error"}
            sx={{
              borderRadius: 3,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1.5rem",
              color: "#FFF",
            }}
          >
            {options.confirmText ?? "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};
