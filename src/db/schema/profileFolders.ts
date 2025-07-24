// src/db/schema/profileFolders.ts

import { sqliteTable, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { ProfileTable } from "./profiles";
import { FolderTable } from "./folders";
import { relations } from "drizzle-orm";

export const ProfileFoldersTable = sqliteTable(
  "profile_folders",
  {
    profileId: integer("profile_id")
      .notNull()
      .references(() => ProfileTable.id, { onDelete: "cascade" }),

    folderId: integer("folder_id")
      .notNull()
      .references(() => FolderTable.id, { onDelete: "cascade" }),
  },
  (table) => {
    return [primaryKey({ columns: [table.profileId, table.folderId] })];
  }
);

export const profileFoldersRelations = relations(ProfileFoldersTable, ({ one }) => ({
  profile: one(ProfileTable, {
    fields: [ProfileFoldersTable.profileId],
    references: [ProfileTable.id],
  }),
  folder: one(FolderTable, {
    fields: [ProfileFoldersTable.folderId],
    references: [FolderTable.id],
  }),
}));

export type ProfileFoldersSchema = typeof ProfileFoldersTable.$inferSelect;
export type NewProfileFolder = typeof ProfileFoldersTable.$inferInsert;
