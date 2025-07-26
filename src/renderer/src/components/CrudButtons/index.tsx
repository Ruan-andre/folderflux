import { Button, useTheme } from "@mui/material";

type CrudButtonsProps = {
  id: number | string;
  status?: boolean;
  onActivate?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDuplicate?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
};

const CrudButtons = ({ id, status, onActivate, onEdit, onDuplicate, onDelete }: CrudButtonsProps) => {
  const theme = useTheme();
  function handleStatus() {
    if (status) {
      return "Desativar";
    } else {
      return "Ativar";
    }
  }

  return (
    <>
      {onActivate && (
        <Button
          id={id.toString()}
          variant="outlined"
          color={status ? "secondary" : "success"}
          sx={{
            fontSize: 12,
            borderRadius: theme.shape.borderRadius,
            zIndex: 999,
            ":hover": { backgroundColor: status ? "purple" : "green", color: "white" },
          }}
          name="edit"
          onClick={onActivate}
        >
          {status ? handleStatus() : "Ativar"}
        </Button>
      )}
      {onEdit && (
        <Button
          id={id.toString()}
          variant="outlined"
          color="info"
          sx={{ fontSize: 12, borderRadius: theme.shape.borderRadius, zIndex: 999 }}
          name="edit"
          onClick={onEdit}
        >
          Editar
        </Button>
      )}

      {onDuplicate && (
        <Button
          id={id.toString()}
          variant="outlined"
          color="warning"
          sx={{
            fontSize: 12,
            borderRadius: theme.shape.borderRadius,
            zIndex: 999,
            ":hover": { backgroundColor: "darkgoldenrod", color: "white" },
          }}
          name="duplicate"
          onClick={onDuplicate}
        >
          Duplicar
        </Button>
      )}

      {onDelete && (
        <Button
          id={id.toString()}
          variant="outlined"
          color="error"
          sx={{
            fontSize: 12,
            borderRadius: theme.shape.borderRadius,
            ":hover": { backgroundColor: "brown", color: "white" },
          }}
          onClick={onDelete}
          name="delete"
        >
          Excluir
        </Button>
      )}
    </>
  );
};

export default CrudButtons;
