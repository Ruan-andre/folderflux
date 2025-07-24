import { DbResponse } from "~/src/renderer/src/types/DbResponse";
import { db } from "../../db";
import { FolderSchema, FolderTable, NewFolder } from "../../db/schema";
import { createResponse } from "../../db/functions";
import { eq } from "drizzle-orm";

export async function getAllFolders(): Promise<FolderSchema[]> {
  return await db.query.FolderTable.findMany();
}

export async function addFolders(folders: NewFolder[]): Promise<DbResponse> {
  for (const folder of folders) {
    try {
      await db.insert(FolderTable).values(folder);
    } catch (e) {
      // Não faz nada pois o usuário pode estar tentando inserir uma pasta já inserida anteriormente, desta forma, a inserção das demais pastas continua.
      console.error(e);
      continue;
    }
  }
  return createResponse(true, "Pastas inseridas com sucesso");
}

export async function deleteFolder(folderId: number) {
  await db.delete(FolderTable).where(eq(FolderTable.id, folderId));
}

export async function updateFolder(folder: FolderSchema) {
  await db
    .update(FolderTable)
    .set({ name: folder.name, fullPath: folder.fullPath })
    .where(eq(FolderTable.id, folder.id));
}

export async function getFolderById(folderId: number): Promise<DbResponse<FolderSchema>> {
  const folder = await db.query.FolderTable.findFirst({ where: eq(FolderTable.id, folderId) });

  if (folder) {
    return createResponse(true, "Pasta encontrada com sucesso!", folder);
  } else {
    return createResponse(false, "Pasta não encontrada");
  }
}
