import { Box, Button, Checkbox, Modal, Stack, Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import IconSelector from "../IconSelector";
import GenericFolderSelector from "../GenericFolderSelector";
import GenericListItems from "../GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import GenericPopupProps from "../../types/GenericPopupProps";
import GenericInput from "../GenericInput";

const listaRegrasMock: GenericListItemsType[] = [
  {
    title: "Pasta 1",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 2",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 3",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 4",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 5",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 6",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 7",
    iconsAction: [<Checkbox />],
  },
  {
    title: "Pasta 8",
    iconsAction: [<Checkbox />],
  },
];

const ProfilePopup = ({ isOpen, onClose }: GenericPopupProps) => {
  const theme = useTheme();

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        onClose();
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "99vh",
          maxWidth: 600,
          width: "95vw",
          overflowY: "auto",
        }}
      >
        <ContentWrapper
          title="Criar Novo Perfil"
          titleSize={22}
          action="btn"
          btn={{
            style: "outlined",
            text: "X",
            Action: () => onClose(),
          }}
          gap="1.5rem"
          padding="2rem"
          hr
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <GenericInput
              name="profileName"
              placeholder="Ex: Trabalho, Celular, Casa"
              label="Nome do Perfil"
              inputSize="small"
              required
            />

            <GenericInput
              name="profileDescription"
              label="Descrição"
              placeholder="Descreva para que serve este perfil"
              multiline
              rows={2}
              inputSize="small"
            />
            <Box>
              <Typography gutterBottom sx={{ fontSize: theme.typography.subtitle1 }}>
                Ícone
              </Typography>
              <IconSelector />
            </Box>
          </Box>
          <GenericFolderSelector listTitle="Pastas Monitoradas" placeholder="Caminho da pasta" />

          <ContentWrapper title="Regras" gap="0.5rem" titleSize={18} hr>
            <GenericListItems
              list={listaRegrasMock}
              titleSize="1.5rem"
              listItemPadding="0px"
              maxListHeight="15rem"
            />
          </ContentWrapper>

          <Button variant="contained" fullWidth={false} sx={{ borderRadius: 12 }}>
            Ir para Regras
          </Button>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 1 }}>
            <hr />
            <Stack spacing={2} direction={"row"} justifyContent={"end"}>
              <Button
                variant="outlined"
                color="error"
                sx={{
                  fontSize: 12,
                  borderRadius: theme.shape.borderRadius,
                  ":hover": { backgroundColor: "brown", color: "white" },
                }}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{
                  fontSize: 12,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                Criar Perfil
              </Button>
            </Stack>
          </Box>
        </ContentWrapper>
      </Box>
    </Modal>
  );
};

export default ProfilePopup;
