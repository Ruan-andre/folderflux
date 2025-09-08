import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";

export const logTypes = ["organization", "cleanup", "error"] as const;

export const OrganizationLogsTable = sqliteTable("organization_logs", {
  id: integer("id").primaryKey(),
  type: text("type", { enum: logTypes }).notNull(),
  // O JSON que guardará os detalhes específicos de cada tipo de log
  // O '$type<T>()' é um helper do Drizzle para garantir a segurança de tipo.
  metadata: text("metadata", { mode: "json" }).notNull().$type<Omit<LogMetadata, "files">>(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`),
  fromTour: integer("from_tour", { mode: "boolean" }).default(false),
});

export const AffectedFilesTable = sqliteTable("affected_files", {
  id: integer("id").primaryKey(),
  logId: integer("log_id")
    .notNull()
    .references(() => OrganizationLogsTable.id, { onDelete: "cascade" }),
  currentValue: text("current_value").notNull(),
  newValue: text("new_value"),
  reason: text("reason", { mode: "json" }).$type<PromiseRejectedResult>(),
});

export const organizationLogsRelations = relations(OrganizationLogsTable, ({ many }) => ({
  fileLogs: many(AffectedFilesTable),
}));

export const afecctedFilesRelations = relations(AffectedFilesTable, ({ one }) => ({
  fileLogs: one(OrganizationLogsTable, {
    fields: [AffectedFilesTable.logId],
    references: [OrganizationLogsTable.id],
  }),
}));

export type NewOrganizationLogs = typeof OrganizationLogsTable.$inferInsert;
export type OrganizationLogsSchema = typeof OrganizationLogsTable.$inferSelect;
export type AffectedFilesTableSchema = typeof AffectedFilesTable.$inferSelect;
