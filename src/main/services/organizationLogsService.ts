import { DbResponse } from "~/src/shared/types/DbResponse";
import { db } from "../../db";
import { AffectedFilesTable, AffectedFilesTableSchema, OrganizationLogsTable } from "../../db/schema";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import { createResponse, handleError } from "../../db/functions";
import { desc } from "drizzle-orm/sql/expressions/select";
import { eq, lt } from "drizzle-orm/sql/expressions/conditions";

export async function saveLog(log: LogMetadata): Promise<LogMetadata> {
  const { id, metadata, files, createdAt } = await db.transaction(async (tx) => {
    //Para salvar na tabela de arquivos
    const files = log.files;
    delete log.files;

    const logToInsert = {
      type: log.type,
      metadata: log,
    };

    const [insertedLog] = await tx.insert(OrganizationLogsTable).values(logToInsert).returning();
    let returningFiles: AffectedFilesTableSchema[] = [];
    if (files && files.length > 0) {
      const filesToInsert = files.map((file) => ({
        logId: insertedLog.id,
        currentValue: file.currentValue,
        newValue: file.newValue,
        reason: file.reason,
      }));

      returningFiles = await tx.insert(AffectedFilesTable).values(filesToInsert).returning();
    }

    return { ...insertedLog, files: returningFiles };
  });

  const { title, description, filesAffected, type } = metadata;

  const baseLog = {
    id,
    description,
    title,
    filesAffected,
    files,
    createdAt,
  };
  switch (type) {
    case "organization":
      return {
        ...baseLog,
        type,
      };
    case "cleanup":
      return {
        ...baseLog,
        type,
        spaceFreedMB: "spaceFreedMB" in metadata ? (metadata.spaceFreedMB as number) : 0,
      };
    case "error":
      return {
        ...baseLog,
        type,
      };
    default:
      throw new Error(`Tipo de log desconhecido: ${type}`);
  }
}

export async function getLogs(lastId?: number): Promise<DbResponse<LogMetadata[]>> {
  try {
    const response = await db.query.OrganizationLogsTable.findMany({
      orderBy: desc(OrganizationLogsTable.id),
      where: lastId ? lt(OrganizationLogsTable.id, lastId) : undefined,
      with: { fileLogs: true },
      limit: 10,
    });

    const logs: LogMetadata[] = response.map((r) => {
      const baseLog = {
        id: r.id,
        description: r.metadata.description,
        title: r.metadata.title,
        filesAffected: r.fileLogs.length,
        files: r.fileLogs,
        createdAt: r.createdAt,
      };
      switch (r.type) {
        case "organization":
          return {
            ...baseLog,
            type: r.type,
          };
        case "cleanup":
          return {
            ...baseLog,
            type: r.type,
            spaceFreedMB: "spaceFreedMB" in r.metadata ? (r.metadata.spaceFreedMB as number) : 0,
          };
        case "error":
          return {
            ...baseLog,
            type: r.type,
          };
        default:
          throw new Error(`Tipo de log desconhecido: ${r.type}`);
      }
    });

    return createResponse(true, "Sucesso aos buscar logs", logs);
  } catch (error) {
    return handleError(error, "Erro ao buscar logs");
  }
}

export async function deleteLogById(logId: number): Promise<DbResponse<void>> {
  try {
    const { changes } = await db.delete(OrganizationLogsTable).where(eq(OrganizationLogsTable.id, logId));
    const isValid = changes > 0 ? true : false;
    const message = isValid ? "Log excluído com sucesso" : "Log não encontrado";
    return createResponse(isValid, message);
  } catch (error) {
    return handleError(error, "Erro ao excluir log");
  }
}

export async function deleteAllLogs(): Promise<DbResponse<void>> {
  try {
    const { changes } = await db.delete(OrganizationLogsTable);
    const isValid = changes > 0 ? true : false;
    const message = isValid ? "Logs excluídos com sucesso" : "Logs não encontrados";
    return createResponse<void>(isValid, message);
  } catch (error) {
    return handleError(error, "Erro ao excluir logs");
  }
}
