import { ipcMain } from "electron";
import { db } from "../../db";
import { conditionTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { DbResponse } from "~/src/renderer/src/types/DbResponse";

const response: DbResponse = {
  message: "",
  status: false,
};
export function registerConditionHandlers() {
  ipcMain.handle("fetch-conditions", async (event, idRule: number): Promise<DbResponse> => {
    const exist = await db.select().from(conditionTable).where(eq(conditionTable.ruleId, idRule));
    return response;
  });
}
