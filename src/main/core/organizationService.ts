import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { getSystemProfile } from "../services/profileService";
import RuleEngine from "./ruleEngine";
import { db } from "../../db";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";

export async function defaultOrganization(paths: string[]) {
  const defaultProfile = await getSystemProfile(db);
  if (defaultProfile) {
    const rules: FullRule[] = defaultProfile.rules.filter((r) => r.isActive) as FullRule[];
    return paths.length > 0 ? RuleEngine.process(db, rules, paths, defaultProfile.name) : 0;
  } else throw "Perfil padrão não encontrado";
}

export async function organizeWithSelectedRules(rules: FullRule[], paths: string[]) {
  if (rules.length > 0 && paths.length > 0) {
    return await RuleEngine.process(db, rules, paths);
  }
  return 0;
}

export async function organizeWithSelectedProfiles(profiles: FullProfile[], paths: string[]) {
  if (profiles.length > 0 && paths.length > 0) {
    let response = 0;
    for (const profile of profiles) {
      const rules = profile.rules.filter((r) => r.isActive);
      response += (await RuleEngine.process(db, rules, paths, profile.name))?.items ?? 0;
    }
    return response;
  }
  return 0;
}
