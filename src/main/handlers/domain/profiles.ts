import { ipcMain } from "electron";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import {
  createFullProfile,
  deleteProfile,
  duplicateProfile,
  getAllProfiles,
  getCountProfilesWithFolder,
  getProfileById,
  toggleProfileStatus,
  updateProfile,
  getProfilesActiveInactiveCount,
} from "../../services/profileService";
import { handleError } from "../../../db/functions";
import { db } from "../../../db";

export function registerProfileHandlers() {
  ipcMain.handle("get-all-profiles-with-details", async (): Promise<DbResponse<FullProfile[]>> => {
    try {
      return await getAllProfiles(db);
    } catch (e) {
      return handleError(e, "Erro ao buscar perfis");
    }
  });

  ipcMain.handle("get-profile-by-id", async (_e, profileId): Promise<DbResponse<FullProfile>> => {
    try {
      return await getProfileById(db, profileId);
    } catch (e) {
      return handleError(e, "Erro ao buscar perfil");
    }
  });

  ipcMain.handle("get-profiles-active-inactive-count", async (): Promise<string> => {
    try {
      return await getProfilesActiveInactiveCount(db);
    } catch (e) {
      throw handleError(e, "Erro ao buscar informações");
    }
  });

  ipcMain.handle("get-count-profiles-with-folder", async (_e, folderId): Promise<number> => {
    try {
      return await getCountProfilesWithFolder(db, folderId);
    } catch (e) {
      throw handleError(e, "Erro ao buscar perfil");
    }
  });

  ipcMain.handle("create-full-profile", async (_e, data) => {
    try {
      return await createFullProfile(db, data);
    } catch (e) {
      return handleError(e, "Erro ao adicionar perfil");
    }
  });

  ipcMain.handle("delete-profile", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await deleteProfile(db, profileId);
    } catch (e) {
      return handleError(e, "Erro ao excluir perfil");
    }
  });

  ipcMain.handle("duplicate-profile", async (_e, profile): Promise<DbResponse<FullProfile>> => {
    try {
      return await duplicateProfile(db, profile);
    } catch (e) {
      return handleError(e, "Erro ao duplicar perfil");
    }
  });

  ipcMain.handle("toggle-profile-status", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await toggleProfileStatus(db, profileId);
    } catch (e) {
      return handleError(e, "Erro ao alterar status do perfil");
    }
  });

  ipcMain.handle("update-profile", async (_e, data): Promise<DbResponse> => {
    try {
      return await updateProfile(db, data);
    } catch (e) {
      return handleError(e, "Erro ao atualizar perfil");
    }
  });
}
