import { Button, Typography, useTheme } from "@mui/material";
import ContentWrapper from "../ContentWrapper";
import { RuleProps } from "../../types/RulesProps";

const handleEdit = (id: string | number) => {
  console.log(id);
};
const handleDelete = async (id: number) => {
  const response = await window.api.deleteRule(id);
  if (response) {
    alert("Excluído com sucesso.");
  }
};

const handleBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // event.preventDefault();
  const { name, id } = event.currentTarget;

  switch (name.toLocaleLowerCase()) {
    case "edit":
      handleEdit(id);
      break;
    case "duplicate":
      break;
    case "delete":
      handleDelete(parseInt(id));
      break;
    default:
      break;
  }
};
const Rule = ({ id, name, extensions, description }: RuleProps) => {
  const theme = useTheme();

  if (!id) {
    return;
  }

  return (
    <ContentWrapper
      title={name}
      titleTagType="h4"
      titleSize={22}
      action="switch"
      gap="1rem"
      bgColor="#2A3040"
    >
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: theme.typography.subtitle1 }}>
        {description}
      </Typography>
      {extensions && (
        <div style={{ display: "flex", gap: "1rem" }}>
          {extensions?.split(",").map((item, index) => {
            return (
              <span
                style={{
                  border: "1px solid",
                  borderColor: "turquoise",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  fontSize: "10px",
                  color: "turquoise",
                }}
                key={index}
              >
                {item.toUpperCase()}
              </span>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 5 }}>
        <Button
          id={id.toString()}
          variant="outlined"
          color="info"
          sx={{ fontSize: 12, borderRadius: theme.shape.borderRadius }}
          name="edit"
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
      </div>
    </ContentWrapper>
  );
};

export default Rule;
