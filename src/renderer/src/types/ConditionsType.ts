export type ConditionsType = {
  type: "fileName" | "fileExtension" | "modifiedDate" | "fileDirectory" | "fileLength";
  typeAction: "contains" | "notContains" | "startsWith" | "endsWith" | "equals";
};
