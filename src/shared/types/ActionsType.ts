export type ActionsType = {
  type: "move" | "copy" | "rename" | "delete";
  value?: string;
};

export const ActionsTypeValues = ["move", "copy", "rename", "delete"] as const;
