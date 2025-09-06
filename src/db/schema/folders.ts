import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ProfileFoldersTable } from "./profileFolders";
import { relations } from "drizzle-orm";

export const FolderTable = sqliteTable("folders", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  fullPath: text("full_path", { length: 150 }).notNull().unique(),
  fromTour: integer("from_tour", { mode: "boolean" }).default(false),
});

export const folderRelations = relations(FolderTable, ({ many }) => ({
  profileFolders: many(ProfileFoldersTable),
}));
export type FolderSchema = typeof FolderTable.$inferSelect;
export type NewFolder = typeof FolderTable.$inferInsert;
