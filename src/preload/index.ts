import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI, electronAPI } from "@electron-toolkit/preload";
import { FolderSchema, NewFolder, RuleSchema, SettingsSchema } from "../db/schema";
import { DbResponse } from "../renderer/src/types/DbResponse";
import { FullRule, NewFullRulePayload } from "../renderer/src/types/RuleWithDetails";
import { FullProfile } from "../renderer/src/types/ProfileWithDetails";
import { IConditionGroup } from "../renderer/src/types/ConditionsType";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}

// Custom APIs for renderer
const api = {
  rule: {
    getAllRules: (): Promise<DbResponse<FullRule[]>> => ipcRenderer.invoke("get-all-rules-with-details"),

    getConditionTree: (ruleId: number): Promise<DbResponse<IConditionGroup>> =>
      ipcRenderer.invoke("get-condition-tree", ruleId),

    createFullRule: (data: NewFullRulePayload): Promise<DbResponse<FullRule>> =>
      ipcRenderer.invoke("create-full-rule", data),

    updateConditionTree: (ruleId: number, newTree: IConditionGroup): Promise<DbResponse> =>
      ipcRenderer.invoke("update-condition-tree", ruleId, newTree),

    duplicateRule: (ruleId: number): Promise<DbResponse<FullRule>> =>
      ipcRenderer.invoke("duplicate-rule", ruleId),

    deleteRule: (idRule: number): Promise<DbResponse> => ipcRenderer.invoke("delete-rule", idRule),

    updateRule: (rule: RuleSchema): Promise<DbResponse> => ipcRenderer.invoke("update-rule", rule),

    toggleActive: (idRule: number): Promise<DbResponse> => ipcRenderer.invoke("toggle-active", idRule),
  },
  profile: {
    getAllProfiles: (): Promise<DbResponse<FullProfile[]>> =>
      ipcRenderer.invoke("get-all-profiles-with-details"),

    createFullProfile: (data: FullProfile): Promise<DbResponse<FullProfile>> =>
      ipcRenderer.invoke("create-full-profile", data),

    getAssociatedRules: (profileId: number): Promise<DbResponse<RuleSchema[]>> =>
      ipcRenderer.invoke("get-associated-rules", profileId),

    getMonitoredFolders: (profileId: number): Promise<DbResponse<FolderSchema[]>> =>
      ipcRenderer.invoke("get-associated-folders", profileId),

    deleteProfile: (profileId: number): Promise<DbResponse> =>
      ipcRenderer.invoke("delete-profile", profileId),

    duplicateProfile: (profile: FullProfile): Promise<DbResponse<FullProfile>> =>
      ipcRenderer.invoke("duplicate-profile", profile),

    toggleStatus: (id: number): Promise<DbResponse> => ipcRenderer.invoke("toggle-profile-status", id),

    updateProfile: (data: FullProfile): Promise<DbResponse> => ipcRenderer.invoke("update-profile", data),
  },
  folder: {
    getAllFolders: (): Promise<DbResponse<FolderSchema[]>> => ipcRenderer.invoke("get-all-folders"),

    getFolderById: (folderId: number): Promise<DbResponse<FolderSchema>> =>
      ipcRenderer.invoke("get-folder-by-id", folderId),

    addFolders: (folders: NewFolder[]): Promise<DbResponse> => ipcRenderer.invoke("add-folders", folders),

    deleteFolder: (folderId: number): Promise<DbResponse> => ipcRenderer.invoke("delete-folder", folderId), // Corrigido para retornar DbResponse

    updateFolder: (folder: FolderSchema): Promise<DbResponse> => ipcRenderer.invoke("update-folder", folder), // Corrigido para retornar DbResponse
  },
  settings: {
    getSettings: async (): Promise<SettingsSchema[]> => {
      return ipcRenderer.invoke("get-settings");
    },
  },
  dialog: {
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke("select-directory"),

    selectMultipleDirectories: (): Promise<string[] | null> =>
      ipcRenderer.invoke("select-multiple-directories"),
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
