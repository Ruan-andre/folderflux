import { eq, sql } from "drizzle-orm";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { DbOrTx } from "..";


export function createResponse<T>(status: boolean, message: string, items?: T): DbResponse<T> {
  return { status, message, items };
}

export function handleError<T>(error: unknown, fallbackMsg: string): DbResponse<T> {
  const e = error as { message: string; code?: string };
  return createResponse(false, `${e?.code ?? ""} - ${e.message ?? fallbackMsg}`);
}

export async function toggleColumnStatus(
  dbInstance: DbOrTx,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  id: number
): Promise<DbResponse> {
  try {
    const updated = await dbInstance
      .update(table)
      .set({ isActive: sql`NOT is_active` })
      .where(eq(table.id, id));

    if (updated.changes > 0) {
      return createResponse(true, "Status atualizado");
    }
    return createResponse(false, "Nada foi atualizado");
  } catch (error) {
    return handleError(error, "Erro ao atualizar status");
  }
}
