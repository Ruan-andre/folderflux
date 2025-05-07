import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import ConditionInput from "../ConditionInput";

const ConditionsGroup = () => {
  const [conditions, setConditions] = useState([{ id: Date.now() }]);

  const handleAddCondition = () => {
    setConditions((prev) => [...prev, { id: Date.now() }]);
  };

  const handleRemoveCondition = (id: number) => {
    setConditions((prev) => prev.filter((cond) => cond.id !== id));
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {conditions.map((condition) => (
        <Stack key={condition.id} direction="row" alignItems="center" spacing={1}>
          <Box flex={1}>
            <ConditionInput />
          </Box>
          {conditions.length > 1 && (
            <Button
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
