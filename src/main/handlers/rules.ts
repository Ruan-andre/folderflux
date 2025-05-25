import { ipcMain } from "electron";
import { db } from "../../db";
import { NewRule, Rule, rule } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { DbResponse } from "~/src/renderer/src/types/DbResponse";

const response: DbResponse = {
  message: "",
  status: false,
};

export function registerRuleHandlers() {
  ipcMain.handle("fetch-all-rules", async (): Promise<DbResponse> => {
    try {
      const rules = await db.select().from(rule);
      response.status = true;
      response.message = "Sucesso ao buscar regras";
      response.items = rules;
      return response;
    } catch (error) {
      const e = error as { message: string; code?: string };

      response.status = false;
      response.message = `${e?.code} - ${e.message}`;
      return response;
    }
  });

  ipcMain.handle("add-new-rule", async (event, newRule: NewRule): Promise<DbResponse> => {
    try {
      const existsName = await db
        .select({ count: sql<number>`count(*)` })
        .from(rule)
        .where(eq(rule.name, newRule.name))
        .get();
      if ((existsName?.count ?? 0) > 0) {
        response.message = "Já existe uma regra com este nome";
        response.status = false;
        return response;
      }
      const id = (await db.insert(rule).values(newRule)).lastInsertRowid;
      const insertedRule = await db
        .select()
        .from(rule)
        .where(eq(rule.id, id as number))
        .get();

      if (insertedRule) {
        response.message = "Regra inserida com sucesso";
        response.status = true;
        response.items = [insertedRule!];
        return response;
      }
      throw new Error();
    } catch (error) {
      response.message = "Erro ao inserir uma nova regra: " + error;
      response.status = false;
      return response;
    }
  });

  ipcMain.handle("delete-rule", async (_event, idRule: number): Promise<DbResponse> => {
    try {
      await db.delete(rule).where(eq(rule.id, idRule));
      response.message = "Regra excluída";
      response.status = true;
      return response;
    } catch (error) {
      console.error(error);
      response.status = false;
      return response;
    }
  });

  ipcMain.handle("update-rule", async (_event, ruleUpdated: Rule): Promise<DbResponse> => {
    try {
      const current = await db.select().from(rule).where(eq(rule.id, ruleUpdated.id)).get();
      if (!current) throw new Error("Regra não encontrada");

      await db
        .update(rule)
        .set({
          name: ruleUpdated.name,
          description: ruleUpdated.description,
          extensions: ruleUpdated.extensions,
          isActive: ruleUpdated.isActive,
        })
        .where(eq(rule.id, ruleUpdated.id));
      response.message = "Regra atualizada";
      response.status = true;
      return response;
    } catch (error) {
      console.error(error);
      response.status = false;
      return response;
    }
  });

  ipcMain.handle("toggle-active", async (event, idRule: number): Promise<DbResponse> => {
    try {
      const current = await db.select().from(rule).where(eq(rule.id, idRule)).get();
      if (!current) throw new Error("Regra não encontrada");
      const updated = await db.update(rule).set({ isActive: !current.isActive }).where(eq(rule.id, idRule));
      if (updated.changes > 0) {
        response.message = "Regra atualizada";
        response.status = true;
        return response;
      } else {
        throw new Error("Erro ao ativar/desativar a regra");
      }
    } catch (error) {
      console.error(error);
      response.status = false;
      return response;
    }
  });
}
