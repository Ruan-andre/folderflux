import FileInfo from "~/src/shared/types/FileInfo";
import DirInfo from "~/src/shared/types/DirInfo";
import {
  CleanupMetadata,
  ErrorMetadata,
  LogMetadata,
  LogTypes,
  OrganizationMetadata,
} from "~/src/shared/types/LogMetaDataType";
import { saveLog } from "../../services/domain/organizationLogsService";
import { DbOrTx } from "~/src/db";

const BYTES_IN_MB = 1024 * 1024;

const pluralizeItem = (quantity: number) => (quantity > 1 ? "itens" : "item");

/**
 * Acumula o resultado de uma execução do motor e o persiste como logs de
 * organização, limpeza e erro.
 */
export class RunLogs {
  private readonly organization: OrganizationMetadata;
  private readonly cleanup: CleanupMetadata;
  private readonly error: ErrorMetadata;

  constructor(
    private readonly profileName?: string,
    private readonly isTourActive?: boolean
  ) {
    const profileDesc = profileName ? ` utilizando o perfil "${profileName}"` : "";

    this.organization = {
      id: 0,
      type: "organization",
      title: "Itens organizados",
      description: profileDesc,
      files: [],
      filesAffected: 0,
    };
    this.cleanup = {
      id: 0,
      type: "cleanup",
      title: "Limpeza realizada",
      description: `Itens deletados${profileDesc}`,
      files: [],
      spaceFreedMB: 0,
      filesAffected: 0,
    };
    this.error = {
      id: 0,
      type: "error",
      title: "Erros na Organização",
      description: `Falha ao processar${profileDesc}`,
      files: [],
      filesAffected: 0,
    };
  }

  recordDeletion(item: FileInfo | DirInfo): void {
    this.cleanup.files?.push({ currentValue: item.fullPath });
    this.cleanup.spaceFreedMB += item.size;
  }

  recordOrganization(item: FileInfo | DirInfo, newPath: string): void {
    this.organization.files?.push({ currentValue: item.fullPath, newValue: newPath });
  }

  recordFailure(itemPath: string, reason: unknown): void {
    this.error.files?.push({ currentValue: itemPath, reason: reason as PromiseRejectedResult });
  }

  async persist(db: DbOrTx): Promise<LogMetadata[]> {
    const pending: { type: LogTypes; promise: Promise<LogMetadata> }[] = [];
    const { organization, cleanup, error } = this;

    if (organization.files?.length) {
      organization.filesAffected = organization.files.length;
      const label = pluralizeItem(organization.filesAffected);
      organization.description = `${organization.filesAffected} ${label} organizados ${organization.description}`;
      pending.push({ type: "organization", promise: saveLog(db, organization, this.isTourActive) });
    }

    if (cleanup.files?.length) {
      cleanup.filesAffected = cleanup.files.length;
      cleanup.spaceFreedMB = parseFloat((cleanup.spaceFreedMB / BYTES_IN_MB).toFixed(2));
      cleanup.description = `${cleanup.filesAffected} ${cleanup.description} (${cleanup.spaceFreedMB} MB liberados)`;
      pending.push({ type: "cleanup", promise: saveLog(db, cleanup, this.isTourActive) });
    }

    if (error.files?.length) {
      error.description += ` (${error.files.length} ${pluralizeItem(error.files.length)})`;
      pending.push({ type: "error", promise: saveLog(db, error, this.isTourActive) });
    }

    if (pending.length === 0) return [];

    const results = await Promise.allSettled(pending.map((entry) => entry.promise));
    const saved: LogMetadata[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") saved.push(result.value);
      else console.error(`[RuleEngine] Falha ao salvar log [${pending[index].type}]:`, result.reason);
    });

    return saved;
  }
}
