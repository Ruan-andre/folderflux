import { useCallback, useState } from "react";

export function useRuleForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = useCallback((initial?: { name: string; description: string }) => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, []);

  return {
    name,
    setName,
    description,
    setDescription,
    reset,
  };
}
