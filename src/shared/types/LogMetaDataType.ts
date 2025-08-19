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

export type LogMetadata = OrganizationMetadata | CleanupMetadata | ErrorMetadata;
export type { OrganizationMetadata, CleanupMetadata, ErrorMetadata };
