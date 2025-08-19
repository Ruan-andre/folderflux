import { FolderSchema, NewFolder, NewProfile, NewRule, ProfileSchema } from "~/src/db/schema";
import { FullRule } from "./RuleWithDetails";

export type FullProfile = (ProfileSchema | NewProfile) & {
  folders: FolderSchema[];
  rules: FullRule[];
};

export type NewFullProfile = NewProfile & {
  folders: NewFolder[];
  rules: NewRule[];
};
