export type ActionsType = {
  type: "move" | "copy" | "rename" | "delete";
  value?: string;
};
