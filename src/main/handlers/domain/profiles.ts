import { ipcMain } from "electron";
import { DbResponse } from "~/src/renderer/src/types/DbResponse";
import { FullProfile } from "~/src/renderer/src/types/ProfileWithDetails";
import {
  createFullProfile,
  deleteProfile,
  duplicateProfile,
  getAllProfiles,
  getAssociatedRules,
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

  // ✅ NOVO: Handler para buscar regras associadas a um perfil. Faz mais sentido estar aqui.
  ipcMain.handle("get-associated-rules", async (_e, profileId) => {
    try {
      return await getAssociatedRules(profileId);
    } catch (e) {
      return handleError(e, "Erro ao buscar regras do perfil");
    }
  });

  ipcMain.handle("create-full-profile", async (_e, data) => {
    try {
      return await createFullProfile(data);
    } catch (e) {
      return handleError(e, "Erro ao adicionar perfil");
    }
  });

  // ✅ CORRIGIDO: Adicionado try...catch para segurança
  ipcMain.handle("delete-profile", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await deleteProfile(profileId);
    } catch (e) {
      return handleError(e, "Erro ao excluir perfil");
    }
  });

  // ✅ CORRIGIDO: Adicionado try...catch para segurança
  ipcMain.handle("duplicate-profile", async (_e, profile): Promise<DbResponse<FullProfile>> => {
    try {
      return await duplicateProfile(profile);
    } catch (e) {
      return handleError(e, "Erro ao duplicar perfil");
    }
  });

  // ✅ CORRIGIDO: Adicionado try...catch para segurança
  ipcMain.handle("toggle-profile-status", async (_e, profileId): Promise<DbResponse> => {
    try {
      return await toggleProfileStatus(profileId);
    } catch (e) {
      return handleError(e, "Erro ao alterar status do perfil");
    }
  });

  // ✅ CORRIGIDO: Adicionado try...catch para segurança
  ipcMain.handle("update-profile", async (_e, data): Promise<DbResponse> => {
    try {
      return await updateProfile(data);
    } catch (e) {
      return handleError(e, "Erro ao atualizar perfil");
    }
  });
}
