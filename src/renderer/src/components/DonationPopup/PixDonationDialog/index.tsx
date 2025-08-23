import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import Icon from "../../../assets/icons";
import PIX_QR_CODE_IMAGE from "./qrcodpix.png";
// --- TIPOS ---
interface PixDonationDialogProps {
  open: boolean;
  onClose: () => void;
}

// --- DADOS DO PIX ---
// !!! IMPORTANTE: Substitua estes valores pelos seus dados reais !!!
const PIX_KEY = "bef3cb4c-55b5-48c2-bd10-b8c6608fc728";
const PIX_COPY_PASTE_CODE =
  "00020126580014BR.GOV.BCB.PIX0136bef3cb4c-55b5-48c2-bd10-b8c6608fc7285204000053039865802BR5925Andre Ruan Oliveira Leite6009SAO PAULO62140510CnZxkLyvpi63049FC0";

const PixDonationDialog = ({ open, onClose }: PixDonationDialogProps) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const elementId = e.currentTarget.id;
      const textoToCopy = elementId === "pixKey" ? PIX_KEY : PIX_COPY_PASTE_CODE;
      await navigator.clipboard.writeText(textoToCopy);

      const set = elementId === "pixKey" ? setCopiedKey : setCopiedCode;

      set(true);
      // Reseta o estado do botão após 3 segundos
      setTimeout(() => set(false), 3000);
    } catch (err) {
      console.error("Falha ao copiar o código: ", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
        Doar com PIX
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {/* QR Code */}
        <Box
          component="img"
          src={PIX_QR_CODE_IMAGE}
          alt="PIX QR Code para doação"
          sx={{
            width: 280,
            height: 280,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            mt: 2,
          }}
        />

        {/* Chave PIX */}
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Chave PIX
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {PIX_KEY}
          </Typography>
        </Box>

        {/* Botão Copia e Cola */}
        <Button
          variant="contained"
          color={copiedCode ? "success" : "primary"}
          onClick={handleCopy}
          startIcon={<Icon icon={copiedCode ? "ic:round-check" : "ic:round-content-copy"} />}
          sx={{ mt: 2, fontSize: "1.3rem", textTransform: "none", minWidth: 280 }}
        >
          {copiedCode ? "Copiado com Sucesso!" : "Copiar Código (Copia e Cola)"}
        </Button>
        <Button
          id="pixKey"
          variant="contained"
          color={copiedKey ? "success" : "primary"}
          onClick={handleCopy}
          startIcon={<Icon icon={copiedKey ? "ic:round-check" : "ic:round-content-copy"} />}
          sx={{ mt: 2, fontSize: "1.3rem", textTransform: "none", minWidth: 280 }}
        >
          {copiedKey ? "Copiado com Sucesso!" : "Copiar Chave"}
        </Button>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="error" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PixDonationDialog;
