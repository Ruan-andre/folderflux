import { useState } from "react";
import { Action, NewAction } from "../../../db/schema/";

export function useActionForm() {
  const [action, setAction] = useState<Action | NewAction>();

  const reset = (initial?: Action | NewAction) => {
    setAction(initial);
  };

  return {
    action,
    setAction,
    reset,
  };
}
