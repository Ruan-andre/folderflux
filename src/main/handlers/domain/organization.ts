import { ipcMain } from "electron";
import { defaultOrganization, organizeWithSelectedRules } from "../../core/quickOrganization";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { deleteAllLogs, deleteLogById, getLogs } from "../../services/organizationLogsService";
import RuleEngine from "../../core/ruleEngine";

export function registerOrganizationHandlers() {
  ipcMain.handle("default-organization", async (_e, paths: string[]) => {
    return await defaultOrganization(paths);
  });

  ipcMain.handle("organize-all", async () => {
    return await RuleEngine.processAll();
  });

  ipcMain.handle("organize-with-selected-rules", async (_e, rules: FullRule[], paths: string[]) => {
    return await organizeWithSelectedRules(rules, paths);
  });

  ipcMain.handle("get-logs", async (_e, lastId?: number) => {
    return await getLogs(lastId);
  });

  ipcMain.handle("delete-log-by-id", async (_e, id: number) => {
    return await deleteLogById(id);
  });

  ipcMain.handle("delete-all-logs", async () => {
    return await deleteAllLogs();
  });
}
