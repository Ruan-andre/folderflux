import { Box, Button, Modal, Stack } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import GenericInput from "../GenericInput";
import ConditionGroupComponent from "../ConditionGroup";
import ActionInput from "../ActionInput";
import { useCallback, useEffect, useState } from "react";
import isEqual from "fast-deep-equal";
import cloneDeep from "lodash.clonedeep";

import { useSnackbar } from "../../context/SnackBarContext";
import { useRuleStore } from "../../store/ruleStore";
import { useRulePopupStore } from "../../store/popupRuleStore";

import { useConditionTree } from "../../hooks/conditionTreeHook";
import { useActionForm } from "../../hooks/actionHook";
import { useRuleForm } from "../../hooks/ruleHook";

import { ActionSchema, NewAction } from "~/src/db/schema";
import { formHelper } from "../../functions/form";
import { FullRule, NewFullRulePayload } from "~/src/shared/types/RuleWithDetails";
import { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";
import { useTourStore } from "../../store/tourStore";

// Estado inicial para a árvore de condições de uma nova regra
const initialTreeState: IConditionGroup = {
  id: "root",
  type: "group",
  operator: "AND",
  displayOrder: 1,
  children: [],
};
const initialActionState: NewAction = { type: "move", value: "", ruleId: 0 };

const tourCondition: ICondition = {
  id: "0",
  type: "condition",
  displayOrder: 1,
  fieldOperator: "contains",
  value: "boleto",
  field: "fileName",
};

const RulePopup = ({ onUpdateSuccess }: { onUpdateSuccess: () => void }) => {
  const { showMessage } = useSnackbar();

  const addRule = useRuleStore((state) => state.addRule);
  const updateRule = useRuleStore((state) => state.updateRule);

  const isOpen = useRulePopupStore((state) => state.isOpen);
  const ruleToEdit = useRulePopupStore((state) => state.ruleToEdit);
  const closePopup = useRulePopupStore((state) => state.closePopup);

  const { name, setName, description, setDescription, reset: resetRuleForm } = useRuleForm();
  const { rootGroup, setRootGroup, conditionTreeHandlers } = useConditionTree(initialTreeState);
  const { action, setAction, reset: resetActionForm } = useActionForm();

  const isTourActive = useTourStore((state) => state.isTourActive());

  const [initialData, setInitialData] = useState<{
    name: string;
    description: string;
    rootGroup: IConditionGroup;
    action: NewAction;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (ruleToEdit) {
        // MODO EDIÇÃO
        resetRuleForm({ name: ruleToEdit.name, description: ruleToEdit.description ?? "" });
        setRootGroup(ruleToEdit.conditionsTree);
        setAction(ruleToEdit.action);
        // Guarda o estado inicial para comparação
        const actionClone: NewAction = { ...ruleToEdit.action, value: ruleToEdit.action.value ?? "" };
        setInitialData(
          cloneDeep({
            name: ruleToEdit.name,
            description: ruleToEdit.description ?? "",
            rootGroup: ruleToEdit.conditionsTree,
            action: actionClone,
          })
        );
      } else {
        // MODO CRIAÇÃO
        resetRuleForm({ name: "", description: "" });
        setRootGroup(initialTreeState);
        resetActionForm(initialActionState);
        setInitialData({
          name: "",
          description: "",
          rootGroup: initialTreeState,
          action: initialActionState,
        });
      }
    }
  }, [isOpen, resetActionForm, resetRuleForm, ruleToEdit, setAction, setRootGroup]);

  const handleSubmit = async () => {
    // Validação
    if (!validate()) return;

    const currentData = { name, description, rootGroup, action };

    let rootGroupTour;
    let actionTour;
    if (rootGroup.children.length === 0 || !(rootGroup.children[0] as ICondition).value) {
      rootGroupTour = JSON.parse(JSON.stringify(initialTreeState));
      rootGroupTour.children = tourCondition;
    }
    if (!action || !action?.value) {
      initialActionState.value = "BOLETOS";
      actionTour = initialActionState;
    }

    const currentDataTour = {
      name: name ? name : "Organizador de Boletos(Tutorial)",
      description,
      rootGroup: rootGroupTour ?? rootGroup,
      action: actionTour ?? action,
    };

    if (!isTourActive) {
      // Se nada mudou, apenas fecha o popup
      if (isEqual(initialData, currentData)) {
        showMessage("Nenhum dado foi alterado", "info");
        closePopup();
        return;
      }
    }
    try {
      if (ruleToEdit) {
        // --- LÓGICA DE ATUALIZAÇÃO ---
        const editedRule: FullRule = {
          ...ruleToEdit,
          name: currentData.name,
          description: currentData.description,
          action: currentData.action as ActionSchema,
          conditionsTree: currentData.rootGroup,
        };
        const response = await updateRule(editedRule);
        if (response.status) showMessage("Regra atualizada com sucesso!", "success");
        else showMessage("Ocorreu um erro ao atualizar a regra!", "error");
      } else {
        // --- LÓGICA DE CRIAÇÃO ---
        const payload: NewFullRulePayload = {
          rule: { name, description, isActive: true, isSystem: false },
          conditionsTree: rootGroup,
          action: action as NewAction,
        };

        const payloadTour: NewFullRulePayload = {
          rule: {
            name: currentDataTour.name,
            description: currentDataTour.description,
            isActive: true,
            isSystem: false,
          },
          conditionsTree: currentDataTour.rootGroup,
          action: currentDataTour.action as NewAction,
        };

        const response = await addRule(isTourActive ? payloadTour : payload, isTourActive);
        if (response.status) {
          showMessage("Regra criada com sucesso!", "success");
        } else {
          showMessage(response.message, "error");
          return;
        }
      }
      onUpdateSuccess();
      closePopup();
    } catch (error) {
      const e = error as { message: string };
      showMessage(e.message, "error");
    }
  };

  const validate = useCallback((): boolean => {
    if (isTourActive) return true;

    if (!name.trim()) {
      showMessage("O nome da regra é obrigatório.", "error");
      formHelper.htmlInputFocus("ruleName", "red");
      return false;
    }

    if (rootGroup.children) {
      const conditions = rootGroup.children as ICondition[];
      const groups = rootGroup.children as IConditionGroup[];
      const emptyGroups = groups?.some((x) => x?.children?.length === 0) || groups?.length === 0;
      const anyConditionValueIsEmpty = conditions.some((x) => x?.value === "");

      const anyConditionValueInGroupIsEmpty = groups.some((x) =>
        (x.children as ICondition[])?.some((x) => x.value === "")
      );

      if (anyConditionValueIsEmpty || anyConditionValueInGroupIsEmpty || emptyGroups) {
        showMessage("O valor dar condições deve ser preenchido.", "error");
        formHelper.htmlElementBorderChange("conditionsGroup");
        return false;
      }

      if (action?.type !== "delete" && !action?.value) {
        showMessage("O valor da ação deve ser preenchido.", "error");
        formHelper.htmlInputFocus("folderSelector", "red");
        return false;
      }
    }
    return true;
  }, [action?.type, action?.value, isTourActive, name, rootGroup.children, showMessage]);

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={closePopup}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "95vh",
          width: "75vw",
          maxWidth: "90vw",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderRadius: 4,
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <ContentWrapper
            id="rule-popup"
            sx={{ gap: "1.5rem" }}
            title={ruleToEdit ? "Editar Regra" : "Criar Nova Regra"}
            titleTagType="h3"
            commonBtn={{ style: "outlined", text: "X", Action: closePopup }}
            hr
          >
            <Box>
              <GenericInput
                id="ruleName"
                name="ruleName"
                label="Nome da Regra"
                placeholder="Ex: Organizador de boletos"
                value={name}
                onChangeInput={(e) => setName(e.target.value)}
                required
                maxLength={65}
              />
              <GenericInput
                id="ruleDescription"
                name="ruleDescription"
                label="Descrição"
                placeholder="Descreva o que esta regra faz"
                multiline
                maxLength={110}
                rows={2}
                value={description}
                onChangeInput={(e) => setDescription(e.target.value)}
              />
            </Box>
            <ConditionGroupComponent
              group={rootGroup}
              parentId="root"
              onAddNode={conditionTreeHandlers.addNode}
              onRemoveNode={conditionTreeHandlers.removeNode}
              onUpdateNode={conditionTreeHandlers.updateNode}
            />
            <ActionInput action={action!} onChange={setAction} />
          </ContentWrapper>
          <Stack
            direction="row"
            justifyContent="end"
            spacing={2}
            p={2}
            sx={{ borderTop: 1, borderColor: "divider", flexShrink: 0 }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{ ":hover": { backgroundColor: "brown" } }}
              onClick={closePopup}
            >
              Cancelar
            </Button>
            <Button id="btn-confirm-rule" variant="contained" onClick={handleSubmit}>
              {ruleToEdit ? "Salvar Alterações" : "Criar Regra"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default RulePopup;
