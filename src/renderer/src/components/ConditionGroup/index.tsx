import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Box,
  Typography,
} from "@mui/material";
import ConditionInput from "../ConditionInput";
import { ICondition, IConditionGroup } from "../../types/ConditionsType";

type ConditionGroupProps = {
  group: IConditionGroup;
  parentId?: string | number;
  onUpdateNode: (
    nodeId: string | number,
    parentId: string | number,
    updatedNode: Partial<ICondition | IConditionGroup>
  ) => void;
  onAddNode: (parentId: string | number, type: "condition" | "group") => void;
  onRemoveNode: (nodeId: string | number, parentId: string | number) => void;
};

const ConditionGroup = ({ group, parentId, onUpdateNode, onAddNode, onRemoveNode }: ConditionGroupProps) => {
  const handleOperatorChange = (event: SelectChangeEvent<"AND" | "OR">) => {
    const effectiveParentId = parentId || group.id;
    onUpdateNode(group.id, effectiveParentId, { operator: event.target.value as "AND" | "OR" });
  };

  return (
    <Card
      id="conditionsGroup"
      variant="outlined"
      sx={{
        mt: 2,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: 1,
      }}
    >
      <CardHeader
        title={
          <Typography variant="body1" color="text.secondary">
            Se{" "}
            <Select
              size="small"
              value={group.operator}
              onChange={handleOperatorChange}
              sx={{ mx: 1, fontSize: "inherit" }}
            >
              <MenuItem sx={{ fontSize: "1.5rem" }} value="AND">
                TODAS
              </MenuItem>
              <MenuItem sx={{ fontSize: "1.5rem" }} value="OR">
                QUALQUER UMA
              </MenuItem>
            </Select>
            das condições a seguir forem verdadeiras:
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pl: 4, borderLeft: "2px solid #555", position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            left: "16px",
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "divider",
          }}
        />

        {group.children.map((child) => {
          if (child.type === "group") {
            return (
              <ConditionGroup
                key={child.id}
                group={child}
                parentId={group.id}
                onUpdateNode={onUpdateNode}
                onAddNode={onAddNode}
                onRemoveNode={onRemoveNode}
              />
            );
          } else {
            return (
              <ConditionInput
                key={child.id}
                condition={child}
                onChange={(updatedCondition) => onUpdateNode(child.id, group.id, updatedCondition)}
                onRemove={() => onRemoveNode(child.id, group.id)}
              />
            );
          }
        })}
      </CardContent>
      <CardActions>
        <Button size="medium" onClick={() => onAddNode(group.id, "condition")}>
          + Adicionar Condição
        </Button>
        <Button size="medium" onClick={() => onAddNode(group.id, "group")}>
          + Adicionar Grupo
        </Button>
        <Button size="medium" color="error" onClick={() => onRemoveNode(group.id, parentId!)}>
          Remover Grupo
        </Button>
      </CardActions>
    </Card>
  );
};

export default ConditionGroup;
