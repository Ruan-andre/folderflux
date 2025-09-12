import { DbResponse } from "~/src/shared/types/DbResponse";
import { FolderSchema, FolderTable, NewFolder } from "../../../db/schema";
import { createResponse } from "../../../db/functions";
import { eq } from "drizzle-orm";
import { FullFolder } from "~/src/shared/types/FolderWithDetails";
import { DbOrTx } from "~/src/db";

export async function getAllFolders(db: DbOrTx): Promise<FolderSchema[]> {
  return await db.query.FolderTable.findMany();
}

export async function addFolders(db: DbOrTx, folders: NewFolder[]): Promise<DbResponse> {
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

export async function deleteFolder(db: DbOrTx, folderId: number) {
  await db.delete(FolderTable).where(eq(FolderTable.id, folderId));
}

export async function deleteFoldersFromTour(db: DbOrTx) {
  await db.delete(FolderTable).where(eq(FolderTable.fromTour, true));
}

export async function updateFolder(db: DbOrTx, folder: FolderSchema) {
  await db
    .update(FolderTable)
    .set({ name: folder.name, fullPath: folder.fullPath })
    .where(eq(FolderTable.id, folder.id));
}

export async function getFolderById(db: DbOrTx, folderId: number): Promise<DbResponse<FullFolder>> {
  const folder = await db.query.FolderTable.findFirst({
    where: eq(FolderTable.id, folderId),
    with: { profileFolders: { with: { profile: true } } },
  });

  if (folder) {
    const { id, fullPath, name, profileFolders, fromTour } = folder;
    const fullFolder: FullFolder = {
      id,
      fullPath,
      name,
      profiles: profileFolders.map((p) => p.profile),
      fromTour,
    };
    return createResponse(true, "Pasta encontrada com sucesso!", fullFolder);
  } else {
    return createResponse(false, "Pasta não encontrada");
  }
}
