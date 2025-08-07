import { FolderSchema, NewFolder, NewProfile, NewRule, ProfileSchema, RuleSchema } from "~/src/db/schema";
import { FullRule } from "./RuleWithDetails";

export type FullProfile = (ProfileSchema | NewProfile) & {
  folders: (FolderSchema | NewFolder)[];
  rules: (RuleSchema | NewRule | FullRule)[];
};
