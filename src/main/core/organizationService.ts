import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { getSystemProfile } from "../services/domain/profileService";
import RuleEngine from "./ruleEngine";
import { DbOrTx } from "../../db";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import { createResponse } from "../../db/functions";

export async function defaultOrganization(
  db: DbOrTx,
  paths: string[],
  onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void,
  isTourActive?: boolean
) {
  const defaultProfile = await getSystemProfile(db);

  if (defaultProfile) {
    const rules: FullRule[] = defaultProfile.rules.filter((r) => r.isActive) as FullRule[];

    if (rules.length === 0) {
      return createResponse(false, "Nenhuma regra ativa no perfil padrão.", 0);
    }

    return RuleEngine.process(db, rules, paths, defaultProfile.name, onLogAdded, isTourActive);
  } else throw "Perfil padrão não encontrado";
}

export async function organizeWithSelectedRules(
  db: DbOrTx,
  rules: FullRule[],
  paths: string[],
  onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void
) {
  return await RuleEngine.process(db, rules, paths, undefined, onLogAdded);
}

export async function organizeWithSelectedProfiles(
  db: DbOrTx,
  profiles: FullProfile[],
  paths: string[],
  onLogAdded?: (logs: LogMetadata | LogMetadata[]) => void
) {
  let response;
  for (const profile of profiles) {
    const rules = profile.rules.filter((r) => r.isActive);
    const responseOrganization = await RuleEngine.process(db, rules, paths, profile.name, onLogAdded);
    if (responseOrganization.items && responseOrganization.items > 0 && !response) {
      response = responseOrganization;
    }
  }
  return response;
}
