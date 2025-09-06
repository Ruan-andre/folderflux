import { Card, CardHeader, CardContent, CardActions, Button, Box, Typography } from "@mui/material";
import ConditionInput from "../ConditionInput";
import { ICondition, IConditionGroup } from "../../../../shared/types/ConditionsType";
import GenericInput from "../GenericInput";
import { memo, useCallback } from "react";
import { useTourStore } from "../../store/tourStore";

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
  const tourNext = useTourStore((state) => state.tourNext);
  const isTourActive = useTourStore((state) => state.isTourActive);
  const getCurrentStepId = useTourStore((state) => state.getCurrentStepId);
  
  const handleOperatorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const effectiveParentId = parentId ?? "root";
      onUpdateNode(group.id, effectiveParentId, { operator: event.target.value as "AND" | "OR" });
    },
    [group.id, onUpdateNode, parentId]
  );

  const handleOnAddCondition = () => {
    onAddNode(group.id, "condition");
    if (isTourActive() && getCurrentStepId() === "rule-form-add-condition-action") {
      setTimeout(() => {
        tourNext();
      }, 100);
    }
  };
  return (
    <Card
      id="conditionsGroup"
      variant="outlined"
      sx={{
        mt: 2,
        mb: 2,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "none",
        boxShadow: 4,
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="body1"
            component={"div"}
            sx={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}
            color="text.secondary"
          >
            Se
            <GenericInput
              id="group-and-or-select"
              name="andOr"
              select
              value={group.operator}
              fullWidth={false}
              inputWidth={"17rem"}
              margin={"0 0.5rem"}
              selectOptions={[
                { label: "TODAS", value: "AND" },
                { label: "QUALQUER UMA", value: "OR" },
              ]}
              inputSize="small"
              textFieldType="outlined"
              onChangeInput={handleOperatorChange}
            />
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
        <Button id={`add-condition-${group.id}`} size="medium" onClick={handleOnAddCondition}>
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

export default memo(ConditionGroup);
