import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI, electronAPI } from "@electron-toolkit/preload";
import { RuleProps } from "../renderer/src/types/RulesProps";
import { NewRule } from "../db/schema";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: typeof api;
  }
}

// Custom APIs for renderer
const api = {
  getAllRules: async (): Promise<RuleProps[]> => {
    return await ipcRenderer.invoke("fetch-all-rules");
  },
  insertNewRule: async (rule: NewRule): Promise<boolean> => {
    return await ipcRenderer.invoke("add-new-rule", rule);
  },
  deleteRule: async (idRule: number) => await ipcRenderer.invoke("delete-rule", idRule),
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
