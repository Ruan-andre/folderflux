import { useState } from "react";
import { ConditionSchema } from "../../../db/schema/";

export function useConditionsForm() {
  const [conditions, setConditions] = useState<ConditionSchema[]>([]);

  const reset = (initial?: ConditionSchema[]) => {
    setConditions(initial ?? []);
  };

  return {
    conditions,
    setConditions,
    reset,
  };
}
