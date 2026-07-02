interface BaseLogMetadata {
  id: number;
  title: string;
  description: string;
  files?: {
    currentValue: string;
    newValue?: string | null;
    reason?: PromiseRejectedResult | null;
  }[];
  filesAffected: number;
  createdAt?: Date;
}

interface OrganizationMetadata extends BaseLogMetadata {
  type: "organization";
}

interface CleanupMetadata extends BaseLogMetadata {
  type: "cleanup";
  spaceFreedMB: number;
}

interface ErrorMetadata extends BaseLogMetadata {
  type: "error";
}

type LogTypes = "organization" | "cleanup" | "error";

export interface ReportStatsFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  type?: LogTypes;
}

export interface ReportStats {
  totalOrganized: number;
  totalCleaned: number;
  totalSpaceFreedMB: string;
  totalErrors: number;
  chartData: {
    date: string;
    Organizados: number;
    Excluidos: number;
    Falhas: number;
  }[];
}

export type LogMetadata = OrganizationMetadata | CleanupMetadata | ErrorMetadata;
export type { OrganizationMetadata, CleanupMetadata, ErrorMetadata, LogTypes };
