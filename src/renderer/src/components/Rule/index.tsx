import { Button, Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import { RuleProps } from "../../types/RulesProps";
import { useSnackbar } from "../../context/SnackBarContext";
import { useRuleStore } from "../../store/ruleStore";
import { useRulePopupStore } from "../../store/popupRuleStore";
const Rule = ({ id, name, extensions, description, isSystem, isActive }: RuleProps) => {
  const theme = useTheme();
  const { showMessage } = useSnackbar();
  const { deleteRule, toggleActive } = useRuleStore();
  const { openPopup } = useRulePopupStore();
  const ruleToEdit: RuleProps = {
    id,
    name,
    extensions,
    description,
    isActive,
  };
  const handleBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { name, id } = event.currentTarget;

    switch (name.toLowerCase()) {
      case "edit":
        openPopup("edit", ruleToEdit);
        break;
      case "duplicate":
        handleDuplicate();
        break;
      case "delete":
        handleDelete(parseInt(id));
        break;
      case "toggle":
        handleToggle(parseInt(id));
        break;
      default:
        break;
    }
  };

  const handleDuplicate = () => {
    console.log("Duplicar");
  };

  const handleDelete = async (id: number) => {
    await deleteRule(id);
    showMessage("Regra excluída com sucesso.", "warning");
  };

  const handleToggle = async (id: number) => {
    await toggleActive(id);
    showMessage("Status da regra atualizado.", "info");
  };

  if (!id) return null;

  return (
    <ContentWrapper
      title={name}
      titleTagType="h4"
      titleSize={22}
      switchBtn={{ Action: () => toggleActive(id), value: isActive }}
      gap="1rem"
      bgColor="#2A3040"
    >
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: theme.typography.subtitle1 }}>
        {description}
      </Typography>

      {extensions && (
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
          <>
            <Button
              id={id.toString()}
              variant="outlined"
              color="info"
              sx={{ fontSize: 12, borderRadius: theme.shape.borderRadius }}
              name="edit"
              onClick={handleBtnClick}
            >
              Editar
            </Button>

            <Button
              id={id.toString()}
              variant="outlined"
              color="warning"
              sx={{
                fontSize: 12,
                borderRadius: theme.shape.borderRadius,
                ":hover": { backgroundColor: "darkgoldenrod", color: "white" },
              }}
              name="duplicate"
              onClick={handleBtnClick}
            >
              Duplicar
            </Button>

            <Button
              id={id.toString()}
              variant="outlined"
              color="error"
              sx={{
                fontSize: 12,
                borderRadius: theme.shape.borderRadius,
                ":hover": { backgroundColor: "brown", color: "white" },
              }}
              onClick={handleBtnClick}
              name="delete"
            >
              Excluir
            </Button>
          </>
        )}
      </div>
    </ContentWrapper>
  );
};

export default Rule;
