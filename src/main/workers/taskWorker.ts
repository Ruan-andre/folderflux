// Em: src/main/workers/taskWorker.ts

import { parentPort, workerData } from "worker_threads";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";

import { deleteAllLogs } from "../services/organizationLogsService";
import RuleEngine from "../core/ruleEngine";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import {
  defaultOrganization,
  organizeWithSelectedProfiles,
  organizeWithSelectedRules,
} from "../core/organizationService";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";

parentPort?.on(
  "message",
  async (message: {
    task: string;
    payload?: { rules?: FullRule[]; profiles?: FullProfile[]; paths?: string[] };
  }) => {
    const { task /*payload*/ } = message;
    const { dbPath } = workerData;

    const sqlite = new Database(dbPath);
    sqlite.pragma("auto_vacuum = FULL");
    const localDb: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

    try {
      let response;

      // Roteador de tarefas
      const reportLogProgress = (logs: LogMetadata | LogMetadata[]) => {
        parentPort?.postMessage({ type: "progress", task: "log-added", data: logs });
      };
      switch (task) {
        case "defaultOrganization":
          response = await defaultOrganization(localDb, message.payload?.paths || [], reportLogProgress);
          break;
        case "organizeWithSelectedProfiles":
          response = await organizeWithSelectedProfiles(
            localDb,
            message.payload?.profiles ?? [],
            message.payload?.paths ?? [],
            reportLogProgress
          );
          break;
        case "organizeWithSelectedRules":
          response = await organizeWithSelectedRules(
            localDb,
            message.payload?.rules ?? [],
            message.payload?.paths ?? [],
            reportLogProgress
          );
          break;
        case "deleteAllLogs":
          response = await deleteAllLogs(localDb);
          break;

        case "processAll":
          response = await RuleEngine.processAll(localDb, reportLogProgress);
          break;

        // Adicione mais casos para outras tarefas aqui
        // case "outraTarefaPesada":
        //   response = await outraTarefaPesada(localDb, payload);
        //   break;

        default:
          throw new Error(`Tarefa desconhecida no worker: ${task}`);
      }

      parentPort?.postMessage({ success: true, data: response });
    } catch (error) {
      parentPort?.postMessage({ success: false, error: error });
    } finally {
      sqlite.close();
    }
  }
);
