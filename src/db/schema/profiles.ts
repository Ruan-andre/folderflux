import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ProfileFoldersTable } from "./profileFolders";
import { ProfileRulesTable } from "./profileRules";

export const ProfileTable = sqliteTable("profiles", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description", { length: 150 }),
  iconId: text("icon_id").notNull().default("fluent-emoji:file-folder"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  fromTour: integer("from_tour", { mode: "boolean" }).default(false),
});

export const profileRelations = relations(ProfileTable, ({ many }) => ({
  profileFolders: many(ProfileFoldersTable),
  profileRules: many(ProfileRulesTable),
}));

export type ProfileSchema = typeof ProfileTable.$inferSelect;
export type NewProfile = typeof ProfileTable.$inferInsert;
