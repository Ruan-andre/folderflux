import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI, electronAPI } from "@electron-toolkit/preload";
import { Condition, NewCondition, NewRule, Rule } from "../db/schema";
import { DbResponse } from "../renderer/src/types/DbResponse";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}

// Custom APIs for renderer
const api = {
  rule: {
    getAllRules: async (): Promise<DbResponse> => {
      return await ipcRenderer.invoke("fetch-all-rules");
    },
    insertNewRule: async (rule: NewRule): Promise<DbResponse> => {
      return await ipcRenderer.invoke("add-new-rule", rule);
    },
    deleteRule: async (idRule: number): Promise<DbResponse> =>
      await ipcRenderer.invoke("delete-rule", idRule),
    updateRule: async (rule: Rule): Promise<DbResponse> => await ipcRenderer.invoke("update-rule", rule),
    toggleActive: async (idRule: number): Promise<DbResponse> =>
      await ipcRenderer.invoke("toggle-active", idRule),
  },
  condition: {
    getConditions: async (idRule: number): Promise<DbResponse> => {
      return await ipcRenderer.invoke("fetch-conditions", idRule);
    },
    insertNewCondition: async (condition: NewCondition, ruleId: number): Promise<DbResponse> => {
      return await ipcRenderer.invoke("add-new-condition", condition, ruleId);
    },
    deleteCondition: async (idCondition: number): Promise<DbResponse> =>
      await ipcRenderer.invoke("delete-rule", idCondition),
    updateCondition: async (idRule: number, condition: Condition): Promise<DbResponse> =>
      await ipcRenderer.invoke("update-condition", idRule, condition),
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
