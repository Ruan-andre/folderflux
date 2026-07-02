import { DbResponse } from "@/shared/types/DbResponse";
import { AffectedFilesTable, AffectedFilesTableSchema, OrganizationLogsTable } from "../../../db/schema";
import { LogMetadata, ReportStatsFilters, CleanupMetadata } from "@/shared/types/LogMetaDataType";
import { createResponse, handleError } from "../../../db/functions";
import { desc } from "drizzle-orm/sql/expressions/select";
import { eq, lt, gte, lte, and, or, like, inArray } from "drizzle-orm/sql/expressions/conditions";
import { SQL } from "drizzle-orm";
import { DbOrTx } from "@/db";
import { count } from "drizzle-orm/sql/functions/aggregate";
import { parseLocalDate, formatMonthLabel } from "@/shared/functions/dateUtils";

export async function saveLog(
  dbInstance: DbOrTx,
  log: LogMetadata,
  fromTour?: boolean
): Promise<LogMetadata> {
  const { id, metadata, files, createdAt } = await dbInstance.transaction((tx) => {
    const files = log.files;
    delete log.files;

    const logToInsert = {
      type: log.type,
      metadata: log,
      fromTour: fromTour ?? false,
    };

    const insertedLog = tx.insert(OrganizationLogsTable).values(logToInsert).returning().get();

    let returningFiles: AffectedFilesTableSchema[] = [];
    if (files && files.length > 0) {
      const filesToInsert = files.map((file) => ({
        logId: insertedLog.id,
        currentValue: file.currentValue,
        newValue: file.newValue,
        reason: file.reason,
      }));

      returningFiles = tx.insert(AffectedFilesTable).values(filesToInsert).returning().all();
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

export function buildFiltersCondition(dbInstance: DbOrTx, filters?: ReportStatsFilters): SQL<unknown>[] {
  const conditions: SQL<unknown>[] = [];
  if (filters) {
    if (filters.startDate) {
      conditions.push(gte(OrganizationLogsTable.createdAt, parseLocalDate(filters.startDate, 0, 0, 0, 0)));
    }
    if (filters.endDate) {
      conditions.push(lte(OrganizationLogsTable.createdAt, parseLocalDate(filters.endDate, 23, 59, 59, 999)));
    }
    if (filters.type) {
      conditions.push(eq(OrganizationLogsTable.type, filters.type));
    }
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const term = `%${filters.searchTerm.trim()}%`;

      const matchingLogsSubquery = dbInstance
        .select({ logId: AffectedFilesTable.logId })
        .from(AffectedFilesTable)
        .where(
          or(
            like(AffectedFilesTable.currentValue, term),
            like(AffectedFilesTable.newValue, term)
          )
        );

      conditions.push(
        or(
          like(OrganizationLogsTable.metadata, term),
          inArray(OrganizationLogsTable.id, matchingLogsSubquery)
        ) as SQL<unknown>
      );
    }
  }
  return conditions;
}

export async function getLogs(dbInstance: DbOrTx, lastId?: number, filters?: ReportStatsFilters): Promise<DbResponse<LogMetadata[]>> {
  try {
    const conditions = buildFiltersCondition(dbInstance, filters);
    if (lastId) conditions.push(lt(OrganizationLogsTable.id, lastId));

    const response = await dbInstance.query.OrganizationLogsTable.findMany({
      orderBy: desc(OrganizationLogsTable.id),
      where: conditions.length > 0 ? and(...conditions) : undefined,
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
          return { ...baseLog, type: r.type };
        case "cleanup":
          return {
            ...baseLog,
            type: r.type,
            spaceFreedMB: "spaceFreedMB" in r.metadata ? (r.metadata.spaceFreedMB as number) : 0,
          };
        case "error":
          return { ...baseLog, type: r.type };
        default:
          throw new Error(`Tipo de log desconhecido: ${r.type}`);
      }
    });

    return createResponse(true, "Sucesso aos buscar logs", logs);
  } catch (error) {
    return handleError(error, "Erro ao buscar logs");
  }
}


export async function getReportStats(dbInstance: DbOrTx, filters?: ReportStatsFilters) {
  try {
    const conditions = buildFiltersCondition(dbInstance, filters);

    const filteredLogs = await dbInstance.query.OrganizationLogsTable.findMany({
      orderBy: desc(OrganizationLogsTable.id),
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    let totalOrganized = 0;
    let totalCleaned = 0;
    let totalSpaceFreedMB = 0;
    let totalErrors = 0;

    const chartDataMap = new Map();
    const now = new Date();

    for (let i = 2; i >= 0; i--) {
      const dateKey = new Date(now.getFullYear(), now.getMonth() - i, 1).getTime();
      chartDataMap.set(dateKey, {
        date: formatMonthLabel(dateKey),
        Organizados: 0,
        Excluidos: 0,
        Falhas: 0,
      });
    }

    filteredLogs.forEach((r) => {
      const metadata = r.metadata as Omit<LogMetadata, "files">;
      const filesAffected = metadata.filesAffected || 0;

      if (metadata.type === "organization") {
        totalOrganized += filesAffected;
      } else if (metadata.type === "cleanup") {
        totalCleaned += filesAffected;
        totalSpaceFreedMB += (metadata as Omit<CleanupMetadata, "files">).spaceFreedMB;
      } else if (metadata.type === "error") {
        totalErrors++;
      }

      if (r.createdAt) {
        const logMonthStart = new Date(new Date(r.createdAt).getFullYear(), new Date(r.createdAt).getMonth(), 1).getTime();

        if (!chartDataMap.has(logMonthStart)) {
          chartDataMap.set(logMonthStart, {
            date: formatMonthLabel(logMonthStart),
            Organizados: 0,
            Excluidos: 0,
            Falhas: 0,
          });
        }

        const entry = chartDataMap.get(logMonthStart);
        if (metadata.type === "organization") {
          entry.Organizados += filesAffected;
        } else if (metadata.type === "cleanup") {
          entry.Excluidos += filesAffected;
        } else if (metadata.type === "error") {
          entry.Falhas += 1;
        }
      }
    });

    const chartData = Array.from(chartDataMap.entries())
      .sort(([timeA], [timeB]) => timeA - timeB)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([_, val]) => val);

    return createResponse(true, "Stats carregadas", {
      totalOrganized,
      totalCleaned,
      totalSpaceFreedMB: totalSpaceFreedMB.toFixed(2),
      totalErrors,
      chartData,
    });
  } catch (error) {
    return handleError(error, "Erro ao buscar stats do relatório");
  }
}


export async function deleteLogById(dbInstance: DbOrTx, logId: number): Promise<DbResponse<void>> {
  try {
    const { changes } = await dbInstance
      .delete(OrganizationLogsTable)
      .where(eq(OrganizationLogsTable.id, logId));
    const isValid = changes > 0 ? true : false;
    const message = isValid ? "Log excluído com sucesso" : "Log não encontrado";
    return createResponse(isValid, message);
  } catch (error) {
    return handleError(error, "Erro ao excluir log");
  }
}

export async function deleteLogsFromTour(dbInstance: DbOrTx) {
  await dbInstance.delete(OrganizationLogsTable).where(eq(OrganizationLogsTable.fromTour, true));
}

export async function deleteAllLogs(dbInstance: DbOrTx): Promise<DbResponse<void>> {
  try {
    const { changes } = await dbInstance.delete(OrganizationLogsTable);
    const isValid = changes > 0 ? true : false;
    const message = isValid ? "Logs excluídos com sucesso" : "Logs não encontrados";
    return createResponse<void>(isValid, message);
  } catch (error) {
    return handleError(error, "Erro ao excluir logs");
  }
}

export async function getLogsFromTourCount(dbInstance: DbOrTx) {
  return (
    await dbInstance
      .select({ count: count() })
      .from(OrganizationLogsTable)
      .where(eq(OrganizationLogsTable.fromTour, true))
  )[0].count;
}
