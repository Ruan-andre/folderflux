import { createFullProfile, getSystemProfilesCount } from "../../main/services/profileService";
import { createFullRule, getSystemRules, getSystemRulesCount } from "../../main/services/ruleService";
import { createSettings, getSystemSettingsCount } from "../../main/services/settingsService";
import { allRuleSeeds } from "./rulesSeeds";
import { profileSeed_allRules } from "./profilesSeeds";
import { settingSeed } from "./settingsSeed";

const systemRulesCount = 10;
const systemProfilesCount = 1;
const systemSettingsCount = 4;

export async function seedDatabase() {
  if ((await getSystemRulesCount()) < systemRulesCount) await seedRules();

  if ((await getSystemProfilesCount()) < systemProfilesCount) await seedProfiles();

  if ((await getSystemSettingsCount()) < systemSettingsCount) await seedSettings();
}

async function seedRules() {
  for (const element of allRuleSeeds) {
    try {
      await createFullRule(element);
    } catch (error) {
      // só mostra no console por enquanto e continua a criação da regra
      console.error(error);
      continue;
    }
  }
}

async function seedProfiles() {
  try {
    const systemRules = await getSystemRules();
    profileSeed_allRules.rules = systemRules;

    await createFullProfile(profileSeed_allRules);
  } catch (error) {
    // só mostra no console por enquanto e continua a criação da regra
    console.error(error);
  }
}
function seedSettings() {
  createSettings(settingSeed);
}
