import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from "electron";
import { ElectronAPI, electronAPI } from "@electron-toolkit/preload";
import { FolderSchema, NewFolder, SettingsSchema } from "../db/schema";
import { IConditionGroup } from "../shared/types/ConditionsType";
import { DbResponse } from "../shared/types/DbResponse";
import { FullProfile, NewFullProfile } from "../shared/types/ProfileWithDetails";
import { FullRule, NewFullRulePayload } from "../shared/types/RuleWithDetails";
import { PathStats } from "../shared/types/pathStatsType";
import { LogMetadata } from "../shared/types/LogMetaDataType";
import { FullFolder } from "../shared/types/FolderWithDetails";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}

// Custom APIs for renderer
const api = {
  onFileDrop: (file: File[]) => {
    return file.map((f) => webUtils.getPathForFile(f));
  },
  getStatsForPaths: (paths: string[]): Promise<PathStats[]> => ipcRenderer.invoke("fs:get-stats", paths),
  onLogAdded: (callback: (log: LogMetadata | LogMetadata[]) => void) => {
    const listener = (event: IpcRendererEvent, log: LogMetadata | LogMetadata[]) => callback(log);
    ipcRenderer.on("log-added", listener);

    return () => {
      ipcRenderer.removeListener("log-added", listener);
    };
  },

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

    updateRule: (rule: FullRule): Promise<DbResponse> => ipcRenderer.invoke("update-rule", rule),

    toggleActive: (idRule: number): Promise<DbResponse> => ipcRenderer.invoke("toggle-active", idRule),
  },
  profile: {
    getAllProfiles: (): Promise<DbResponse<FullProfile[]>> =>
      ipcRenderer.invoke("get-all-profiles-with-details"),

    createFullProfile: (data: NewFullProfile): Promise<DbResponse<FullProfile>> =>
      ipcRenderer.invoke("create-full-profile", data),

    getProfileById: (profileId: number): Promise<DbResponse<FullProfile>> =>
      ipcRenderer.invoke("get-profile-by-id", profileId),

    getProfilesActiveInactiveCount: (): Promise<string> =>
      ipcRenderer.invoke("get-profiles-active-inactive-count"),

    getCountProfilesWithFolder: (folderId: number): Promise<number> =>
      ipcRenderer.invoke("get-count-profiles-with-folder", folderId),

    deleteProfile: (profileId: number): Promise<DbResponse> =>
      ipcRenderer.invoke("delete-profile", profileId),

    duplicateProfile: (profile: FullProfile): Promise<DbResponse<FullProfile>> =>
      ipcRenderer.invoke("duplicate-profile", profile),

    toggleStatus: (id: number): Promise<DbResponse> => ipcRenderer.invoke("toggle-profile-status", id),

    updateProfile: (data: FullProfile): Promise<DbResponse> => ipcRenderer.invoke("update-profile", data),
  },
  folder: {
    getAllFolders: (): Promise<DbResponse<FolderSchema[]>> => ipcRenderer.invoke("get-all-folders"),

    getFolderById: (folderId: number): Promise<DbResponse<FullFolder>> =>
      ipcRenderer.invoke("get-folder-by-id", folderId),

    addFolders: (folders: NewFolder[]): Promise<DbResponse> => ipcRenderer.invoke("add-folders", folders),
    deleteFolder: (folderId: number): Promise<DbResponse> => ipcRenderer.invoke("delete-folder", folderId),
    updateFolder: (folder: FolderSchema): Promise<DbResponse> => ipcRenderer.invoke("update-folder", folder),
  },
  settings: {
    getSettings: async (): Promise<SettingsSchema[]> => ipcRenderer.invoke("get-settings"),
    toggleSettingActive: async (id: number, type?: SettingsSchema["type"]): Promise<void> =>
      ipcRenderer.invoke("toggle-setting-active", id, type),
  },
  dialog: {
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke("select-directory"),
    selectMultipleDirectories: (isTutorialPath?: boolean): Promise<string[] | null> =>
      ipcRenderer.invoke("select-multiple-directories", isTutorialPath),
  },
  organization: {
    organizeAll: async (): Promise<DbResponse<number>> => await ipcRenderer.invoke("worker:processAll"),
    defaultOrganization: async (paths: string[]): Promise<DbResponse<number>> =>
      ipcRenderer.invoke("worker:defaultOrganization", paths),
    organizeWithSelectedRules: async (rules: FullRule[], paths: string[]): Promise<DbResponse<number>> =>
      ipcRenderer.invoke("worker:organizeWithSelectedRules", rules, paths),
    organizeWithSelectedProfiles: async (
      profiles: FullProfile[],
      paths: string[]
    ): Promise<DbResponse<number>> =>
      ipcRenderer.invoke("worker:organizeWithSelectedProfiles", profiles, paths),
    getLogs: async (lastId?: number): Promise<DbResponse<LogMetadata[]>> =>
      ipcRenderer.invoke("get-logs", lastId),
    deleteLogById: async (logId: number): Promise<DbResponse<void>> =>
      ipcRenderer.invoke("delete-log-by-id", logId),
    deleteAllLogs: async (): Promise<DbResponse<void>> => ipcRenderer.invoke("worker:deleteAllLogs"),
  },
  monitoring: {
    startMonitoring: (folders: string[] | string) => ipcRenderer.invoke("watch", folders),

    startMonitoringProfileFolders: (profileId: number, startVerification: boolean = false) =>
      ipcRenderer.invoke("watch-profile-folders", profileId, startVerification),

    stopMonitoring: (folders: string[] | string) => ipcRenderer.invoke("unwatch", folders),

    stopMonitoringProfileFolders: (profileId: number) =>
      ipcRenderer.invoke("unwatch-profile-folders", profileId),
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
