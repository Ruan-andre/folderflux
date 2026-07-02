import { ipcMain } from "electron";
import {
  deleteAllLogs,
  deleteLogById,
  getLogs,
  getLogsFromTourCount,
  getReportStats,
} from "../../services/domain/organizationLogsService";
import { db } from "../../../db";

import { ReportStatsFilters } from "../../../shared/types/LogMetaDataType";

export function registerOrganizationHandlers() {
  ipcMain.handle("get-logs", async (_e, lastId?: number, filters?: ReportStatsFilters) => {
    return await getLogs(db, lastId, filters);
  });

  ipcMain.handle("get-report-stats", async (_e, filters?: ReportStatsFilters) => {
    return await getReportStats(db, filters);
  });

  ipcMain.handle("get-logs-from-tour-count", async () => {
    return await getLogsFromTourCount(db);
  });

  ipcMain.handle("delete-log-by-id", async (_e, id: number) => {
    return await deleteLogById(db, id);
  });

  ipcMain.handle("delete-all-logs", async () => {
    return await deleteAllLogs(db);
  });
}
