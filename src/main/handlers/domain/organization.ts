import { ipcMain } from "electron";
import {
  deleteAllLogs,
  deleteLogById,
  getLogs,
  getLogsFromTourCount,
} from "../../services/domain/organizationLogsService";
import { db } from "../../../db";

export function registerOrganizationHandlers() {
  ipcMain.handle("get-logs", async (_e, lastId?: number) => {
    return await getLogs(db, lastId);
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
