import { FullRule } from "~/src/shared/types/RuleWithDetails";
import FileInfo from "~/src/shared/types/FileInfo";
import DirInfo from "~/src/shared/types/DirInfo";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { DbOrTx } from "~/src/db";
import { createResponse } from "../../db/functions";
import { getAllProfiles } from "../services/domain/profileService";
import { getFileInfo, getFilesInfo, isDirectory } from "../services/system/fileService";
import { getDirsInfo, getSingleDirInfo, populateDirSizes } from "../services/system/dirService";
import { conditionTreeUsesField, evaluateConditionTree } from "./rules/conditions";
import { destinationFolderNames, executeAction } from "./rules/actions";
import { RunLogs } from "./rules/runLogs";

type OperationEntry = {
  item: FileInfo | DirInfo;
  rule: FullRule;
  isDir: boolean;
};

export type RuleEngineOptions = {
  db: DbOrTx;
  rules: FullRule[];
  folderPaths: string[];
  profileName?: string;
  onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void;
  isTourActive?: boolean;
  specificPaths?: string[];
};

export default class RuleEngine {
  private readonly rules: FullRule[];
  private readonly folderPaths: string[];
  private readonly onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void;
  private readonly specificPaths?: string[];
  private readonly logs: RunLogs;
  private readonly operationsToExecute: OperationEntry[] = [];
  private reservedFolderNamesCache?: Set<string>;

  private constructor(options: Omit<RuleEngineOptions, "db">) {
    this.rules = options.rules;
    this.folderPaths = options.folderPaths;
    this.onLogAdded = options.onLogAdded;
    this.specificPaths = options.specificPaths;
    this.logs = new RunLogs(options.profileName, options.isTourActive);
  }

  public static async process(options: RuleEngineOptions): Promise<DbResponse<number>> {
    const { db, ...rest } = options;
    return await new RuleEngine(rest).run(db);
  }

  public static async processAll(
    db: DbOrTx,
    onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void,
    isTourActive?: boolean
  ): Promise<DbResponse<number>> {
    try {
      const profiles = (await getAllProfiles(db, true)).items;

      if (!profiles || profiles.length === 0) {
        return createResponse(true, "Nenhum perfil encontrado.", 0);
      }
      if (profiles.every((p) => !p.isActive)) {
        return createResponse(true, "Nenhum perfil está ativo.", 0);
      }
      if (profiles.every((p) => p.folders.length === 0)) {
        return createResponse(true, "Não há nenhuma pasta sendo monitorada.", 0);
      }

      const results = await Promise.all(
        profiles.map((p) =>
          new RuleEngine({
            rules: p.rules,
            folderPaths: p.folders.map((f) => f.fullPath),
            profileName: p.name,
            onLogAdded,
            isTourActive,
          }).run(db)
        )
      );

      const atLeastOne = results.find((r) => r.items && r.items > 0)?.items ?? 0;
      const successMessage =
        atLeastOne > 0 ? "Sucesso ao processar todos os perfis" : "Nenhum item correspondeu a nenhuma regra.";

      return createResponse(true, successMessage, atLeastOne);
    } catch (error) {
      console.error("[RuleEngine] Falha em processAll:", error);
      return createResponse(false, "Erro ao processar perfis.", 0);
    }
  }

  private async run(db: DbOrTx): Promise<DbResponse<number>> {
    await this.findMatchingItems();

    if (this.operationsToExecute.length === 0) {
      return createResponse(true, "Nenhum item correspondeu a nenhuma regra.", 0);
    }

    // O tamanho precisa ser medido ANTES da exclusão, senão o log de limpeza
    // reporta sempre "0.00 MB liberados" para pastas.
    await this.measureDirsMarkedForDeletion();

    const results = await Promise.allSettled(
      this.operationsToExecute.map((op) => executeAction(op.item, op.isDir, op.rule.action))
    );

    this.recordResults(results);

    const savedLogs = await this.logs.persist(db);
    if (savedLogs.length > 0 && this.onLogAdded) this.onLogAdded(savedLogs);

    return createResponse(true, "Processamento finalizado. Verifique os logs para detalhes.", 1);
  }

  private async findMatchingItems(): Promise<void> {
    // `targetType` é opcional para tolerar regras gravadas antes da coluna existir.
    const fileRules = this.rules.filter((r) => (r.targetType ?? "file") === "file");
    const dirRules = this.rules.filter((r) => r.targetType === "directory");
    if (fileRules.length === 0 && dirRules.length === 0) return;

    if (this.specificPaths && this.specificPaths.length > 0) {
      await this.findInSpecificPaths(fileRules, dirRules);
      return;
    }

    for (const folderPath of this.folderPaths) {
      await this.scanFolder(folderPath, fileRules, dirRules);
    }
  }

  private async findInSpecificPaths(fileRules: FullRule[], dirRules: FullRule[]): Promise<void> {
    const files: FileInfo[] = [];
    const dirs: DirInfo[] = [];

    for (const target of this.specificPaths ?? []) {
      // Caminho é a própria pasta monitorada: faz varredura completa dela.
      if (this.folderPaths.includes(target)) {
        await this.scanFolder(target, fileRules, dirRules);
        continue;
      }

      try {
        if (await isDirectory(target)) {
          if (dirRules.length === 0) continue;
          const dirInfo = await getSingleDirInfo(target);
          if (dirInfo) dirs.push(dirInfo);
        } else {
          if (fileRules.length === 0) continue;
          const fileInfo = await getFileInfo(target);
          if (fileInfo) files.push(fileInfo);
        }
      } catch (error) {
        this.recordInspectionError(target, error);
      }
    }

    this.matchFiles(files, fileRules);
    await this.matchDirs(dirs, dirRules);
  }

  private async scanFolder(folderPath: string, fileRules: FullRule[], dirRules: FullRule[]): Promise<void> {
    try {
      if (fileRules.length > 0) this.matchFiles(await getFilesInfo(folderPath), fileRules);
      if (dirRules.length > 0) await this.matchDirs(await getDirsInfo(folderPath), dirRules);
    } catch (error) {
      this.recordInspectionError(folderPath, error);
    }
  }

  private matchFiles(files: FileInfo[], fileRules: FullRule[]): void {
    if (files.length === 0 || fileRules.length === 0) return;

    for (const file of files) {
      const rule = fileRules.find((r) => evaluateConditionTree(file, r.conditionsTree, false));
      if (rule) this.operationsToExecute.push({ item: file, rule, isDir: false });
    }
  }

  private async matchDirs(dirs: DirInfo[], dirRules: FullRule[]): Promise<void> {
    if (dirs.length === 0 || dirRules.length === 0) return;

    const reserved = this.reservedFolderNames();
    const candidates = dirs.filter((dir) => !reserved.has(dir.name.toLowerCase()));
    if (candidates.length === 0) return;

    const needsSize = dirRules.some((rule) => conditionTreeUsesField(rule.conditionsTree, "fileSize"));
    if (needsSize) await populateDirSizes(candidates);

    for (const dir of candidates) {
      const rule = dirRules.find((r) => evaluateConditionTree(dir, r.conditionsTree, true));
      if (rule) this.operationsToExecute.push({ item: dir, rule, isDir: true });
    }
  }

  /**
   * Pastas de destino criadas pelas próprias ações nunca podem virar candidatas:
   * caso contrário o motor aninha a saída dentro dela mesma a cada varredura.
   */
  private reservedFolderNames(): Set<string> {
    this.reservedFolderNamesCache ??= destinationFolderNames(this.rules.map((rule) => rule.action));
    return this.reservedFolderNamesCache;
  }

  private async measureDirsMarkedForDeletion(): Promise<void> {
    const dirs = this.operationsToExecute
      .filter((op) => op.isDir && op.rule.action.type === "delete" && op.item.size === 0)
      .map((op) => op.item as DirInfo);

    if (dirs.length > 0) await populateDirSizes(dirs);
  }

  private recordInspectionError(target: string, reason: unknown): void {
    console.error(`[RuleEngine] Falha ao inspecionar '${target}':`, reason);
    this.logs.recordFailure(target, reason);
  }

  private recordResults(results: PromiseSettledResult<void | string>[]): void {
    results.forEach((result, index) => {
      const { item, rule, isDir } = this.operationsToExecute[index];

      if (result.status === "fulfilled") {
        if (rule.action.type === "delete") this.logs.recordDeletion(item);
        else this.logs.recordOrganization(item, result.value!);
        return;
      }

      this.logs.recordFailure(item.fullPath, result.reason);
      const label = isDir ? (item as DirInfo).name : (item as FileInfo).nameWithExtension;
      console.error(`[RuleEngine] Falha ao processar '${label}':`, result.reason);
    });
  }
}
