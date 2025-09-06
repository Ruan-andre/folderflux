import { FolderSchema, NewFolder, ProfileSchema } from "~/src/db/schema";

export type FullFolder = FolderSchema & {
  profiles: ProfileSchema[];
};

export type NewFullFolder = NewFolder & {
  profiles: ProfileSchema[];
};
