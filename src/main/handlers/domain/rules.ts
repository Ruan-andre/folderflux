import { ipcMain } from "electron";
import {
  getAllRules,
  createFullRule,
  deleteRule,
  updateRule,
  toggleRuleActive,
  duplicateRule,
} from "../../services/domain/ruleService";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { handleError } from "../../../db/functions";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { db } from "../../../db";

export function registerRuleHandlers() {
  ipcMain.handle("get-all-rules-with-details", async (): Promise<DbResponse<FullRule[]>> => {
    try {
      return await getAllRules(db);
    } catch (e) {
      return handleError(e, "Erro ao buscar regras");
    }
  });

  ipcMain.handle("create-full-rule", async (_e, data, isTourActive) => {
    try {
      return await createFullRule(db, data, isTourActive);
    } catch (e) {
      return handleError(e, "Erro ao adicionar regra");
    }
  });

  ipcMain.handle("duplicate-rule", async (_e, ruleId): Promise<DbResponse<FullRule>> => {
    try {
      return await duplicateRule(db, ruleId);
    } catch (e) {
      return handleError(e, "Erro ao duplicar regra");
    }
  });

  ipcMain.handle("delete-rule", async (_e, id) => {
    try {
      return await deleteRule(db, id);
    } catch (e) {
      return handleError(e, "Erro ao excluir regra");
    }
  });

  ipcMain.handle("update-rule", async (_e, ruleUpdated) => {
    try {
      return await updateRule(db, ruleUpdated);
    } catch (e) {
      return handleError(e, "Erro ao atualizar regra");
    }
  });

  ipcMain.handle("toggle-active", async (_e, id) => {
    try {
      return await toggleRuleActive(db, id);
    } catch (e) {
      return handleError(e, "Erro ao alterar status");
    }
  });
}
