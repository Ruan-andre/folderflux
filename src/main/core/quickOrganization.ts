import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { getSystemProfile } from "../services/profileService";
import RuleEngine from "./ruleEngine";
// import RuleEngine from "./ruleEngine";

export async function defaultOrganization(paths: string[]) {
  const defaultProfile = await getSystemProfile();
  if (defaultProfile) {
    const rules: FullRule[] = defaultProfile.rules.filter((r) => r.isActive) as FullRule[];
    return RuleEngine.process(rules, paths, defaultProfile.name);
  } else throw "Perfil padrão não encontrado";
}

export async function organizeWithSelectedRules(rules: FullRule[], paths: string[]) {
  return await RuleEngine.process(rules, paths);
}
