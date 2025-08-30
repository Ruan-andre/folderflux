// Em src/main/index.ts
import { ipcMain } from "electron";
import path from "path";
import { Worker } from "worker_threads";
import { getDbPath } from "../../../db";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import { mainProcessEmitter } from "../../emitter/mainProcessEmitter";

export function runTaskInWorker(
  task: string,
  payload?: { rules?: FullRule[]; profiles?: FullProfile[]; paths?: string[] }
): Promise<DbResponse> {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, "taskWorker.js");
    const dbPath = getDbPath();

    const worker = new Worker(workerPath, { workerData: { dbPath } });

    worker.on("message", (response) => {
      if (response?.type === "progress" && response?.task === "log-added") {
        mainProcessEmitter.emit("log-added", response.data);
        return;
      }
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
      worker.terminate();
    });

    worker.on("error", (error) => {
      reject(error);
      worker.terminate();
    });

    // Envia a tarefa e os dados para o worker
    worker.postMessage({ task, payload });
  });
}

export function registerWorkerHandlers() {
  ipcMain.handle("worker:deleteAllLogs", () => {
    return runTaskInWorker("deleteAllLogs");
  });

  ipcMain.handle("worker:processAll", () => {
    return runTaskInWorker("processAll");
  });

  ipcMain.handle("worker:defaultOrganization", (_e, paths) => {
    return runTaskInWorker("defaultOrganization", { paths });
  });

  ipcMain.handle("worker:organizeWithSelectedRules", (_e, rules, paths) => {
    return runTaskInWorker("organizeWithSelectedRules", { rules, paths });
  });

  ipcMain.handle("worker:organizeWithSelectedProfiles", (_e, profiles, paths) => {
    return runTaskInWorker("organizeWithSelectedProfiles", { profiles, paths });
  });
}
