import { ipcMain } from "electron";
import {
  addFolders,
  deleteFolder,
  getAllFolders,
  getFolderById,
  updateFolder,
} from "../../services/folderService";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FolderSchema } from "../../../db/schema";
import { createResponse, handleError } from "../../../db/functions";
import { FullFolder } from "~/src/shared/types/FolderWithDetails";

export function registerFolderHandlers() {
  ipcMain.handle("get-all-folders", async (): Promise<DbResponse<FolderSchema[]>> => {
    try {
      const folders = await getAllFolders();
      return createResponse(true, "Pastas buscadas com sucesso", folders);
    } catch (e) {
      return handleError(e, "Erro ao buscar pastas");
    }
  });

  ipcMain.handle("add-folders", async (_e, folders): Promise<DbResponse> => {
    try {
      return await addFolders(folders);
    } catch (error) {
      return handleError(error, "Erro ao inserir pastas");
    }
  });

  ipcMain.handle("delete-folder", async (_e, folderId): Promise<DbResponse> => {
    try {
      await deleteFolder(folderId);
      return createResponse(true, "Pasta excluída com sucesso");
    } catch (e) {
      return handleError(e, "Erro ao excluir pasta");
    }
  });

  ipcMain.handle("update-folder", async (_e, folder): Promise<DbResponse> => {
    try {
      await updateFolder(folder);
      return createResponse(true, "Pasta atualizada com sucesso.");
    } catch (e) {
      return handleError(e, "Erro ao atualizar pasta");
    }
  });

  ipcMain.handle("get-folder-by-id", async (_e, folderId): Promise<DbResponse<FullFolder>> => {
    try {
      return await getFolderById(folderId);
    } catch (e) {
      return handleError(e, "Erro ao buscar pasta por ID");
    }
  });
}
