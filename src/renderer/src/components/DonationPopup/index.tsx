import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Icon from "../../assets/icons";
import PixDonationDialog from "./PixDonationDialog";
import { useState } from "react";

const DonationPopup = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [isOpenPix, setIsOpenPix] = useState(false);
  const handleKoFi = () => {
    window.open("https://ko-fi.com/folderflux");
  };

  const handlePix = () => {
    setIsOpenPix(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        Sua doação é muito importante!
      </DialogTitle>

      <DialogContent>
        <DialogContentText color="text.primary">
          <Typography fontSize={"1.5rem"}>
            O FolderFlux é um projeto independente e de código aberto, mantido por apenas uma pessoa. Dedico
            meu tempo e esforço para criar a melhor ferramenta de organização possível e disponibilizá-la
            gratuitamente.
          </Typography>
          <br />
          <Typography fontSize={"1.5rem"}>
            Se o FolderFlux facilita sua vida, sua doação apoia diretamente o meu trabalho e ajuda a manter o
            projeto vivo e em constante evolução.
          </Typography>
          <br />
          <Typography fontSize={"1.5rem"}>Agradeço imensamente seu apoio!</Typography>
        </DialogContentText>

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            color="info"
            variant="outlined"
            fullWidth={false}
            onClick={handleKoFi}
            sx={{ fontSize: "1.3rem" }}
            startIcon={<Icon icon="simple-icons:kofi" width="30" height="30" />}
          >
            Doar com Ko-fi (Cartão)
          </Button>
          <Button
            sx={{ fontSize: "1.3rem" }}
            color="info"
            variant="outlined"
            onClick={handlePix}
            startIcon={<Icon icon="ic:baseline-pix" width="30" height="30" style={{ color: "#32BCAD" }} />}
          >
            Doar com PIX (Brasil)
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
      <PixDonationDialog
        open={isOpenPix}
        onClose={() => {
          setIsOpenPix(false);
        }}
      />
    </Dialog>
  );
};

export default DonationPopup;
