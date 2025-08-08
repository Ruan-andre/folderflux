import { FolderSchema, NewFolder, NewProfile, NewRule, ProfileSchema, RuleSchema } from "~/src/db/schema";
import { FullRule } from "./RuleWithDetails";

export type FullProfile = (ProfileSchema | NewProfile) & {
  folders: FolderSchema[];
  rules: (RuleSchema | FullRule)[];
};

export type NewFullProfile = NewProfile & {
  folders: NewFolder[];
  rules: NewRule[];
};
