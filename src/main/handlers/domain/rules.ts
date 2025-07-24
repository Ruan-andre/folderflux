import { ipcMain } from "electron";
import {
  getAllRules,
  createFullRule,
  deleteRule,
  updateRule,
  toggleRuleActive,
  duplicateRule,
  getConditionTree,
} from "../../services/ruleService";
import { DbResponse } from "~/src/renderer/src/types/DbResponse";
import { handleError } from "../../../db/functions";
import { FullRule } from "~/src/renderer/src/types/RuleWithDetails";

export function registerRuleHandlers() {
  ipcMain.handle("get-all-rules-with-details", async (): Promise<DbResponse<FullRule[]>> => {
    try {
      return await getAllRules();
    } catch (e) {
      return handleError(e, "Erro ao buscar regras");
    }
  });

  // ✅ NOVO: Handler para buscar a árvore de condições de uma regra específica
  ipcMain.handle("get-condition-tree", async (_e, ruleId) => {
    try {
      return await getConditionTree(ruleId);
    } catch (e) {
      return handleError(e, "Erro ao buscar árvore de condições");
    }
  });

  ipcMain.handle("create-full-rule", async (_e, data) => {
    try {
      return await createFullRule(data);
    } catch (e) {
      return handleError(e, "Erro ao adicionar regra");
    }
  });

  ipcMain.handle("duplicate-rule", async (_e, ruleId): Promise<DbResponse<FullRule>> => {
    try {
      return await duplicateRule(ruleId);
    } catch (e) {
      return handleError(e, "Erro ao duplicar regra");
    }
  });

  ipcMain.handle("delete-rule", async (_e, id) => {
    try {
      return await deleteRule(id);
    } catch (e) {
      return handleError(e, "Erro ao excluir regra");
    }
  });

  ipcMain.handle("update-rule", async (_e, ruleUpdated) => {
    try {
      return await updateRule(ruleUpdated);
    } catch (e) {
      return handleError(e, "Erro ao atualizar regra");
    }
  });

  ipcMain.handle("toggle-active", async (_e, id) => {
    try {
      return await toggleRuleActive(id);
    } catch (e) {
      return handleError(e, "Erro ao alterar status");
    }
  });
}
