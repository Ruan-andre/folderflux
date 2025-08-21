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
} from "../../services/profileService";
import { handleError } from "../../../db/functions";

export function registerProfileHandlers() {
  ipcMain.handle("get-all-profiles-with-details", async (): Promise<DbResponse<FullProfile[]>> => {
    try {
      return await getAllProfiles();
    } catch (e) {
      return handleError(e, "Erro ao buscar perfis");
    }
  });

  ipcMain.handle("get-profile-by-id", async (_e, profileId): Promise<DbResponse<FullProfile>> => {
    try {
      return await getProfileById(profileId);
    } catch (e) {
      return handleError(e, "Erro ao buscar perfil");
    }
  });

  ipcMain.handle("get-count-profiles-with-folder", async (_e, folderId): Promise<number> => {
    try {
      return await getCountProfilesWithFolder(folderId);
    } catch (e) {
      throw handleError(e, "Erro ao buscar perfil");
    }
  });

  ipcMain.handle("create-full-profile", async (_e, data) => {
    try {
      return await createFullProfile(data);
    } catch (e) {
      return handleError(e, "Erro ao adicionar perfil");
    }
  });

  ipcMain.handle("delete-profile", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await deleteProfile(profileId);
    } catch (e) {
      return handleError(e, "Erro ao excluir perfil");
    }
  });

  ipcMain.handle("duplicate-profile", async (_e, profile): Promise<DbResponse<FullProfile>> => {
    try {
      return await duplicateProfile(profile);
    } catch (e) {
      return handleError(e, "Erro ao duplicar perfil");
    }
  });

  ipcMain.handle("toggle-profile-status", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await toggleProfileStatus(profileId);
    } catch (e) {
      return handleError(e, "Erro ao alterar status do perfil");
    }
  });

  ipcMain.handle("update-profile", async (_e, data): Promise<DbResponse> => {
    try {
      return await updateProfile(data);
    } catch (e) {
      return handleError(e, "Erro ao atualizar perfil");
    }
  });
}
