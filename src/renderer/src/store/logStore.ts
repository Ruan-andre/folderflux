import { create } from "zustand";
import { DbResponse } from "../../../shared/types/DbResponse";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";

type LogState = {
  logs: LogMetadata[];
  getLogs: (lastId?: number) => Promise<number | undefined>;
  deleteLog: (id: number) => Promise<DbResponse<void>>;
  deleteAllLogs: () => Promise<DbResponse<void>>;
  addSavedLogFromBD: (log: LogMetadata | LogMetadata[]) => void;
};

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  getLogs: async (lastId?: number) => {
    const response = await window.api.organization.getLogs(lastId);
    if (response.status && response.items) {
      if (lastId) {
        set((state) => ({
          logs: [...state.logs, ...(response.items ?? [])],
        }));
      } else {
        set({ logs: response.items });
      }
    }
    return response.items?.length;
  },
  deleteLog: async (id: number) => {
    const response = await window.api.organization.deleteLogById(id);
    if (response.status) {
      set((state) => ({ logs: state.logs.filter((log) => log.id !== id) }));
    }
    return response;
  },
  deleteAllLogs: async () => {
    const response = await window.api.organization.deleteAllLogs();
    if (response.status) {
      set({ logs: [] });
    }
    return response;
  },
  addSavedLogFromBD: (log: LogMetadata | LogMetadata[]) => {
    if (Array.isArray(log)) {
      set((state) => ({ logs: [...log, ...state.logs] }));
    } else {
      set((state) => ({ logs: [log, ...state.logs] }));
    }
  },
}));
