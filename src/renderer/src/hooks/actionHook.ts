import { useCallback, useState } from "react";
import { ActionSchema, NewAction } from "../../../db/schema/";

export function useActionForm() {
  const [action, setAction] = useState<ActionSchema | NewAction>();

  const reset = useCallback((initial?: ActionSchema | NewAction) => {
    setAction(initial);
  }, []);

  return {
    action,
    setAction,
    reset,
  };
}
