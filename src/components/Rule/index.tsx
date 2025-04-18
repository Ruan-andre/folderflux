import { Button, Typography, useTheme } from "@mui/material";
import PageWrapper from "../PageWrapper";

type RuleProps = {
  title: string;
  extension?: string[];
  description?: string;
};
const Rule = ({ title, extension, description }: RuleProps) => {
  const theme = useTheme();

  if (!title) {
    return;
  }

  return (
    <PageWrapper title={title} titleTagType="h4" titleSize={22} action="switch" gap="1rem" bgColor="#2A3040">
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: theme.typography.subtitle1 }}>
        {description}
      </Typography>
      <div style={{ display: "flex", gap: "1rem" }}>
        {extension?.map((item, index) => {
          return (
            <span
              style={{
                border: "1px solid",
                borderColor: theme.palette.primary.main,
                padding: "5px 8px",
                borderRadius: "8px",
                fontSize: "12px",
                color: theme.palette.primary.main,
              }}
              key={index}
            >
              {item}
            </span>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        <Button variant="outlined">Editar</Button>
        <Button
          variant="outlined"
          color="warning"
          sx={{ ":hover": { backgroundColor: "darkgoldenrod", color: "white" } }}
        >
          Duplicar
        </Button>
        <Button
          variant="outlined"
          color="error"
          sx={{ ":hover": { backgroundColor: "brown", color: "white" } }}
        >
          Excluir
        </Button>
      </div>
    </PageWrapper>
  );
};

export default Rule;
