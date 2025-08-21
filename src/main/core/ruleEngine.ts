// src/main/core/RuleEngine.ts
import path from "path";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import FileInfo from "~/src/shared/types/FileInfo";
import { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";
import { copyFile, deleteFile, getFilesInfo, moveFile } from "../services/fileService";
import {
  OrganizationMetadata,
  CleanupMetadata,
  ErrorMetadata,
  LogMetadata,
  LogTypes,
} from "~/src/shared/types/LogMetaDataType";
import { saveLog } from "../services/organizationLogsService";
import { createResponse } from "../../db/functions";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { mainProcessEmitter } from "../emitter/mainProcessEmitter";
import { getAllProfiles } from "../services/profileService";

type FileValue = string | number | Date | null;
type EvaluatorFunc = (
  fileValue: FileValue,
  conditionValue: string,
  conditionValue2?: string | null
) => boolean;
type ActionFunc = (file: FileInfo, actionValue: string) => Promise<void | string>;

export default class RuleEngine {
  // --- CONFIGURAÇÕES ESTÁTICAS E PRIVADAS ---
  private static readonly conditionEvaluators: Record<string, Record<string, EvaluatorFunc>> = {
    fileName: {
      contains: (fileValue, value) => String(fileValue).toLowerCase().includes(value.toLowerCase()),
      notContains: (fileValue, value) => !String(fileValue).toLowerCase().includes(value.toLowerCase()),
      startsWith: (fileValue, value) => String(fileValue).toLowerCase().startsWith(value.toLowerCase()),
      endsWith: (fileValue, value) => String(fileValue).toLowerCase().endsWith(value.toLowerCase()),
      equals: (fileValue, value) => String(fileValue).toLowerCase() === value.toLowerCase(),
    },
    fileExtension: {
      equals: (fileValue, value) => String(fileValue).toLowerCase() === value.toLowerCase().replace(".", ""),
      notContains: (fileValue, value) =>
        String(fileValue).toLowerCase() !== value.toLowerCase().replace(".", ""),
    },
    modifiedDate: {
      isBetween: (fileValue, value, value2) => {
        if (!value || !value2) return false;
        const fileDate = new Date(fileValue as string | number | Date);
        return fileDate >= new Date(value) && fileDate <= new Date(value2);
      },
    },
    fileSize: {
      isBetween: (fileValue, value, value2) => {
        if (!value || !value2) return false;
        const fileSizeMB = Number(fileValue) / (1024 * 1024);
        return fileSizeMB >= parseFloat(value) && fileSizeMB <= parseFloat(value2);
      },
    },
  };

  private static readonly actionHandlers: Record<string, ActionFunc> = {
    move: async (file, destinationFolder) => {
      const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
      await moveFile(file.fullPath, newPath);
      return newPath;
    },
    copy: async (file, destinationFolder) => {
      const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
      await copyFile(file.fullPath, newPath);
      return newPath;
    },
    delete: async (file) => {
      await deleteFile(file.fullPath);
    },
    rename: async (file, newName) => {
      const newPath = path.join(file.parentDirectory, `${newName}${file.extension}`);
      await moveFile(file.fullPath, newPath);
      return newPath;
    },
  };

  private rules: FullRule[];
  private folderPaths: string[];
  private profileName?: string;
  private logs: ReturnType<typeof this.initiateLogs>;
  private operationsToExecute: { file: FileInfo; rule: FullRule }[] = [];

  public static async process(
    rules: FullRule[],
    folderPaths: string[],
    profileName?: string
  ): Promise<DbResponse<number>> {
    const engineInstance = new RuleEngine(rules, folderPaths, profileName);
    return await engineInstance.run();
  }

  public static async processAll(): Promise<DbResponse<number>> {
    try {
      const profiles = (await getAllProfiles()).items;

      if (!profiles || profiles.length === 0) {
        return createResponse(true, "Nenhum perfil encontrado.", 0);
      }

      const results = await Promise.all(
        profiles.map(async (p) => {
          const { name, rules, folders } = p;
          const engineInstance = new RuleEngine(
            rules,
            folders.map((f) => f.fullPath),
            name
          );
          return engineInstance.run();
        })
      );

      const atLeastOne = results.find((r) => r.items && r.items > 0)?.items ?? 0;
      const successMessage =
        atLeastOne > 0
          ? "Sucesso ao processar todos os perfis"
          : "Nenhum arquivo correspondeu a nenhuma regra.";

      return createResponse(true, successMessage, atLeastOne);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return createResponse(false, `Erro ao processar perfis.`, 0);
    }
  }

  // O construtor é privado para forçar o uso do método estático `process`.
  private constructor(rules: FullRule[], folderPaths: string[], profileName?: string) {
    this.rules = rules;
    this.folderPaths = folderPaths;
    this.profileName = profileName;
    this.logs = this.initiateLogs(profileName);
  }

  private async run(): Promise<DbResponse<number>> {
    // 1. Encontrar todos os arquivos que correspondem às regras
    await this.findMatchingFiles();

    if (this.operationsToExecute.length === 0) {
      return createResponse(true, "Nenhum arquivo correspondeu a nenhuma regra.", 0);
    }

    const results = await Promise.allSettled(
      this.operationsToExecute.map((op) => {
        const handler = RuleEngine.actionHandlers[op.rule.action.type];
        if (handler) {
          return handler(op.file, op.rule.action.value ?? "");
        }
        return Promise.reject(new Error(`Ação '${op.rule.action.type}' não reconhecida.`));
      })
    );

    this.processResults(results);

    this.saveLogs();

    console.log("Processamento concluído.");
    return createResponse(true, "Processamento finalizado. Verifique os logs para detalhes.", 1);
  }

  private async findMatchingFiles(): Promise<void> {
    for (const folderPath of this.folderPaths) {
      try {
        const files = await getFilesInfo(folderPath);
        if (files) {
          for (const file of files) {
            const matchingRule = this.rules.find((rule) =>
              this.evaluateConditionTree(file, rule.conditionsTree)
            );
            if (matchingRule) {
              this.operationsToExecute.push({ file, rule: matchingRule });
            }
          }
        }
      } catch (error) {
        this.logs.error.files?.push({ currentValue: folderPath, reason: error as PromiseRejectedResult });
      }
    }
  }

  private processResults(results: PromiseSettledResult<void | string>[]): void {
    results.forEach((result, index) => {
      const { file, rule } = this.operationsToExecute[index];
      const { organization, cleanup, error } = this.logs;

      if (result.status === "fulfilled") {
        if (rule.action.type === "delete" && cleanup.files) {
          cleanup.files.push({ currentValue: file.fullPath });
          cleanup.spaceFreedMB += file.size;
        } else if (organization.files) {
          organization.files.push({ currentValue: file.fullPath, newValue: result.value! });
        }
      } else {
        if (error.files) {
          error.files.push({ currentValue: file.fullPath, reason: result.reason });
        }
        console.error(`Falha ao processar '${file.nameWithExtension}':`, result.reason);
      }
    });
  }

  // --- MÉTODOS AUXILIARES PRIVADOS (antigas funções) ---

  private evaluateConditionTree(file: FileInfo, group: IConditionGroup): boolean {
    const results: boolean[] = group.children.map((child) => {
      if (child.type === "group") {
        return this.evaluateConditionTree(file, child);
      }
      return this.evaluateCondition(file, child);
    });

    if (results.length === 0) return true;
    return group.operator === "OR" ? results.some(Boolean) : results.every(Boolean);
  }

  private evaluateCondition(file: FileInfo, condition: ICondition): boolean {
    const evaluator = RuleEngine.conditionEvaluators[condition.field]?.[condition.fieldOperator];
    const fileValue = this.getFileValue(file, condition.field);
    if (evaluator && fileValue !== null) {
      return evaluator(fileValue, condition.value, condition.value2);
    }
    return false;
  }

  private getFileValue(file: FileInfo, field: ICondition["field"]): FileValue {
    switch (field) {
      case "fileName":
        return file.name;
      case "fileExtension":
        return file.extension.replace(".", "");
      case "fileSize":
        return file.size;
      case "modifiedDate":
        return file.mtime;
      default:
        return null;
    }
  }

  private isPlural(length: number): string {
    return length > 1 ? "s" : "";
  }

  private async saveLogs(): Promise<void> {
    const { organization, cleanup, error } = this.logs;
    const promises: { type: LogTypes; promise: Promise<LogMetadata> }[] = [];

    if (organization.files && organization.files.length > 0) {
      organization.filesAffected = organization.files.length;
      organization.description = `${organization.filesAffected} arquivos movidos, copiados ou renomeados ${organization.description}`;
      promises.push({ type: "organization", promise: saveLog(organization) });
    }
    if (cleanup.files && cleanup.files.length > 0) {
      cleanup.filesAffected = cleanup.files.length;
      cleanup.spaceFreedMB = parseFloat((cleanup.spaceFreedMB / (1024 * 1024)).toFixed(2));
      cleanup.description = `${cleanup.filesAffected} ${cleanup.description} (${cleanup.spaceFreedMB} MB liberados)`;
      promises.push({ type: "cleanup", promise: saveLog(cleanup) });
    }
    if (error.files && error.files.length > 0) {
      error.description += ` (${error.files.length} arquivo${this.isPlural(error.files.length)})`;
      promises.push({ type: "error", promise: saveLog(error) });
    }

    if (promises.length === 0) return;

    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const successfulLogs: Partial<Record<LogTypes, LogMetadata>> = {};

    results.forEach((result, index) => {
      const { type } = promises[index];
      if (result.status === "fulfilled") {
        successfulLogs[type] = result.value;
      } else {
        console.error(`Falha ao salvar log [${type}]:`, result.reason);
      }
    });

    if (Object.keys(successfulLogs).length > 0) {
      mainProcessEmitter.emit("log-added", Object.values(successfulLogs));
    }
  }

  private initiateLogs(profileName?: string) {
    const profileDesc = profileName ? ` utilizando o perfil "${profileName}"` : "";
    return {
      organization: {
        id: 0,
        type: "organization",
        title: `Arquivos organizados`,
        description: `${profileDesc}`,
        files: [],
        filesAffected: 0,
      } as OrganizationMetadata,
      cleanup: {
        id: 0,
        type: "cleanup",
        title: "Limpeza realizada",
        description: `arquivos deletados${profileDesc}`,
        files: [],
        spaceFreedMB: 0,
        filesAffected: 0,
      } as CleanupMetadata,
      error: {
        id: 0,
        type: "error",
        title: "Erros na Organização",
        description: `Falha ao processar${profileDesc}`,
        files: [],
        filesAffected: 0,
        RejectedResult: undefined,
      } as ErrorMetadata,
    };
  }
}
