import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import ConditionInput from "../ConditionInput";
import { NewCondition } from "~/src/db/schema";

const ConditionsGroup = (conditionsProps: { conditionsProps: NewCondition[]; onAdd?: () => void }) => {
  const [conditions, setConditions] = useState<NewCondition[]>(conditionsProps.conditionsProps);

  const emptyCondition: NewCondition = {
    id: Date.now(),
    type: "fileName",
    typeAction: "contains",
    value: "",
    ruleId: 0,
  };

  if (conditions.length === 0) {
    setConditions([emptyCondition]);
  }
  const handleAddCondition = () => {
    setConditions((prev) => [...prev, emptyCondition]);
  };

  const handleRemoveCondition = (id: number | undefined) => {
    if (!id) return;
    setConditions((prev) => prev.filter((cond) => cond.id !== id));
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography fontSize="1.8rem">Condições</Typography>
      {conditions.map((condition) => (
        <Stack key={condition.id} direction="row" alignItems="center" spacing={1}>
          <Box flex={1}>
            <ConditionInput />
          </Box>
          {conditions.length > 1 && (
            <Button
              sx={{ ":hover": { backgroundColor: "brown" } }}
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleRemoveCondition(condition.id)}
            >
              Remover
            </Button>
          )}
        </Stack>
      ))}
      <Box>
        <Button variant="contained" color="primary" fullWidth={false} onClick={handleAddCondition}>
          Adicionar Condição
        </Button>
      </Box>
    </Box>
  );
};

export default ConditionsGroup;
