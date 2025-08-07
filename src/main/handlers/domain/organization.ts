import { ipcMain } from "electron";
import { defaultOrganization, organizeWithSelectedRules } from "../../core/quickOrganization";
import { FullRule } from "~/src/shared/types/RuleWithDetails";

export function registerOrganizationHandlers() {
  ipcMain.handle("default-organization", async (_e, paths: string[]) => {
    return await defaultOrganization(paths);
  });

  ipcMain.handle("organize-with-selected-rules", async (_e, rules: FullRule[], paths: string[]) => {
    return await organizeWithSelectedRules(rules, paths);
  });
}
