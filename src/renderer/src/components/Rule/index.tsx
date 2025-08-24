import { Box, Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import { useSnackbar } from "../../context/SnackBarContext";
import { useRuleStore } from "../../store/ruleStore";
import { useRulePopupStore } from "../../store/popupRuleStore";
import { FullRule } from "../../../../shared/types/RuleWithDetails";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import CrudButtons from "../CrudButtons";
import { IConditionGroup } from "../../../../shared/types/ConditionsType";

const Rule = (rule: FullRule) => {
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const { deleteRule, toggleActive, duplicateRule } = useRuleStore();
  const { openPopup } = useRulePopupStore();
  const { showConfirm } = useConfirmDialog();
  const { id, name, description, isActive, isSystem, conditionsTree } = rule;

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
    return [...new Set(extensions)];
  };
  const extensions = getExtensionsFromTree(conditionsTree).join(", ");
  return (
    <ContentWrapper
      sx={{ gap: "1rem", backgroundColor: theme.palette.mode === "dark" ? "#2A3040" : "#e6e6e6ff" }}
      title={name}
      titleTagType="h4"
      switchBtn={{ Action: () => toggleActive(id), value: isActive }}
    >
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: theme.typography.subtitle1 }}>
        {description}
      </Typography>

      {extensions.length > 0 && (
        <Box style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {extensions.split(",").map((item, index) => (
            <Typography
              component={"span"}
              key={index}
              style={{
                border: "1px solid",
                borderColor: theme.palette.mode === "dark" ? "turquoise" : "blueviolet",
                padding: "5px 8px",
                borderRadius: "8px",
                fontSize: "10px",
                color: theme.palette.mode === "dark" ? "turquoise" : "blueviolet",
              }}
            >
              {item.toUpperCase()}
            </Typography>
          ))}
        </Box>
      )}

      <div style={{ display: "flex", gap: 5 }}>
        {!isSystem && (
          <CrudButtons
            id={id}
            onEdit={() => openPopup("edit", rule)}
            onDelete={() => handleDelete(id)}
            onDuplicate={() => handleDuplicate(id)}
          />
        )}
      </div>
    </ContentWrapper>
  );
};

export default Rule;
