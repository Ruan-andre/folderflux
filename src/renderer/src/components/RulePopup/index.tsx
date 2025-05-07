import { Box, Button, Modal, Stack, useTheme } from "@mui/material";
import GenericPopupProps from "../../types/GenericPopupProps";
import ContentWrapper from "../ContentWrapper";
import GenericInput from "../GenericInput";
import { useState } from "react";
import ConditionsGroup from "../ConditionsGroup";
import ActionInput from "../ActionInput";

const RulePopup = ({ isOpen, onClose }: GenericPopupProps) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    description: "",
    name: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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
          top: "10%",
          left: "50%",
          transform: "translate(-50%, -10%)",
          maxHeight: "99vh",
          width: "fit-content",
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
          hr
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <GenericInput
              name="name"
              label="Nome da Regra"
              fontSize="1.5rem"
              placeholder="Ex: Organizador de boletos"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <GenericInput
              name="description"
              label="Descrição"
              fontSize="1.5rem"
              multiline
              rows={2}
              maxLength={150}
              placeholder="Descreva o que esta regra faz"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <ConditionsGroup />
            <ActionInput />
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

export default RulePopup;
