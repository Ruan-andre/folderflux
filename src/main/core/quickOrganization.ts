import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { getSystemProfile } from "../services/profileService";
import RuleEngine from "./ruleEngine";

export async function defaultOrganization(paths: string[]) {
  const defaultProfile = await getSystemProfile();
  if (defaultProfile) {
    const rules: FullRule[] = defaultProfile.rules.filter((r) => r.isActive) as FullRule[];
    await RuleEngine.process(rules, paths);
  }
}

export async function organizeWithSelectedRules(rules: FullRule[], paths: string[]) {
  await RuleEngine.process(rules, paths);
}
