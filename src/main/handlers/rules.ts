import { ipcMain } from "electron";
import { db } from "../../db";
import { NewRule, rule } from "../../db/schema";
import { eq } from "drizzle-orm";

export function registerRuleHandlers() {
  ipcMain.handle("fetch-all-rules", async () => {
    try {
      const rules = await db.select().from(rule);
      return rules;
    } catch (error) {
      console.error("Erro ao buscar regras:", error);
      return [];
    }
  });

  ipcMain.handle("add-new-rule", async (event, newRule: NewRule): Promise<boolean> => {
    try {
      await db.insert(rule).values(newRule);
      return true;
    } catch (error) {
      console.error("Erro ao inserir uma nova regra", error);
      return false;
    }
  });

  ipcMain.handle("delete-rule", async (_event, idRule: number) => {
    try {
      await db.delete(rule).where(eq(rule.id, idRule));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  });
  // Ex: para salvar no futuro
  // ipcMain.handle("create-rule", async (_event, newRule) => { ... });
}
