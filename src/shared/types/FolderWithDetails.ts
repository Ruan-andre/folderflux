import { FolderSchema, ProfileSchema } from "~/src/db/schema";

export type FullFolder = FolderSchema & {
  profiles: ProfileSchema[];
};
