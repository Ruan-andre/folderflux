import { Box, Button, Modal, Stack, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import GenericInput from "../GenericInput";
import { useEffect, useState } from "react";
import ConditionsGroup from "../ConditionsGroup";
import ActionInput from "../ActionInput";
import { useSnackbar } from "../../context/SnackBarContext";
import { useRuleStore } from "../../store/ruleStore";
import { useRulePopupStore } from "../../store/popupRuleStore";
import { ConditionsType } from "../../types/ConditionsType";
import { NewCondition, NewRule } from "~/src/db/schema";

type ActionsType = {
  type: "move" | "copy" | "rename" | "delete";
  value?: string;
};

type FormType = {
  name: string;
  description?: string;
  conditions?: ConditionsType[];
  action?: ActionsType[];
};

type RulePopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RulePopup = ({ isOpen, onClose }: RulePopupProps) => {
  const { showMessage } = useSnackbar();
  const theme = useTheme();
  const { addRule } = useRuleStore();
  const { ruleToEdit } = useRulePopupStore();
  const [conditions, setConditions] = useState<NewCondition>();
  const [formData, setFormData] = useState<FormType>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  async function handleAddOrUpdate() {
    if (!formData?.name) {
      showMessage("O nome da regra não pode ser vazio", "error");
      return;
    }

    const newRule: NewRule = {
      name: formData?.name,
      description: formData?.description,
      isActive: true,
      isSystem: false,
      
    };

    try {
      const response = await addRule(newRule);
      if (response.status) {
        showMessage(response.message, "success");
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const e = error as { message: string; code?: string };
      showMessage(e.message, "error");
    }
  }

  useEffect(() => {
    if (!ruleToEdit) {
      setFormData({
        name: "",
        description: "",
        conditions: [],
        action: [],
      });
    } else {
      setFormData({
        name: ruleToEdit.name,
        description: ruleToEdit.description,
        conditions: [],
        action: [],
      });
    }
  }, [isOpen, ruleToEdit]);

  if (!isOpen) return;

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
          title={ruleToEdit ? "Editar Regra" : "Criar Nova Regra"}
          titleSize={22}
          commonBtn={{
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
              value={formData?.name}
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
              value={formData?.description}
              onChange={handleInputChange}
            />
            <ConditionsGroup conditionsProps={[]} onAdd={() => setConditions} />
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
                variant={ruleToEdit ? "outlined" : "contained"}
                sx={{
                  fontSize: 12,
                  borderRadius: theme.shape.borderRadius,
                  ":hover": { backgroundColor: ruleToEdit ? "green" : "", color: "white" },
                }}
                color={ruleToEdit ? "success" : "primary"}
                onClick={handleAddOrUpdate}
              >
                {ruleToEdit ? "Salvar" : "Criar"}
              </Button>
            </Stack>
          </Box>
        </ContentWrapper>
      </Box>
    </Modal>
  );
};

export default RulePopup;
