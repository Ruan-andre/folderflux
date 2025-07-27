import { Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import { useSnackbar } from "../../context/SnackBarContext";
import { useRuleStore } from "../../store/ruleStore";
import { useRulePopupStore } from "../../store/popupRuleStore";
import { FullRule } from "../../types/RuleWithDetails";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import CrudButtons from "../CrudButtons";
import { IConditionGroup } from "../../types/ConditionsType";

const Rule = ({ id, name, description, isSystem, isActive, conditionsTree, action }: FullRule) => {
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const { deleteRule, toggleActive, duplicateRule } = useRuleStore();
  const { openPopup } = useRulePopupStore();
  const { showConfirm } = useConfirmDialog();
  const ruleToEdit: FullRule = {
    id,
    name,
    description,
    isActive,
    isSystem,
    conditionsTree,
    action,
  };

  const handleDuplicate = async (ruleId: number) => {
    const response = await duplicateRule(ruleId);
    if (response.status) {
      showMessage("Regra duplicada com sucesso", "success");
    } else {
      showMessage(response.message, "warning");
    }
  };

  const handleDelete = async (id: number) => {
    showConfirm(
      {
        title: "Excluir regra",
        message: "Deseja realmente excluir esta regra? Essa ação não pode ser desfeita.",
        confirmText: "Excluir",
        cancelText: "Cancelar",
      },
      async () => {
        await deleteRule(id);
        showMessage("Regra excluída com sucesso.", "warning");
      }
    );
  };

  if (!id) return null;

  const getExtensionsFromTree = (group: IConditionGroup): string[] => {
    let extensions: string[] = [];
    for (const child of group.children) {
      if (child.type === "condition" && child.field === "fileExtension" && child.value) {
        extensions.push(child.value);
      } else if (child.type === "group") {
        extensions = extensions.concat(getExtensionsFromTree(child));
      }
    }
    return extensions;
  };
  const extensions = getExtensionsFromTree(conditionsTree).join(", ");
  return (
    <ContentWrapper
      title={name}
      titleTagType="h4"
      titleSize={22}
      gap="1rem"
      bgColor="#2A3040"
      switchBtn={{ Action: () => toggleActive(id), value: isActive }}
    >
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: theme.typography.subtitle1 }}>
        {description}
      </Typography>

      {extensions.length > 0 && (
        <div style={{ display: "flex", gap: "1rem" }}>
          {extensions.split(",").map((item, index) => (
            <span
              key={index}
              style={{
                border: "1px solid",
                borderColor: "turquoise",
                padding: "5px 8px",
                borderRadius: "8px",
                fontSize: "10px",
                color: "turquoise",
              }}
            >
              {item.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 5 }}>
        {!isSystem && (
          <CrudButtons
            id={id}
            onEdit={() => openPopup("edit", ruleToEdit)}
            onDelete={() => handleDelete(id)}
            onDuplicate={() => handleDuplicate(id)}
          />
        )}
      </div>
    </ContentWrapper>
  );
};

export default Rule;
