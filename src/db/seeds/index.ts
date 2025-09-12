import { createFullProfile, getSystemProfilesCount } from "../../main/services/domain/profileService";
import { createFullRule, getSystemRules, getSystemRulesCount } from "../../main/services/domain/ruleService";
import { createSettings, getSystemSettingsCount } from "../../main/services/domain/settingsService";
import { allRuleSeeds } from "./rulesSeeds";
import { profileSeed_allRules } from "./profilesSeeds";
import { settingSeed } from "./settingsSeed";
import { DbOrTx } from "..";

const systemRulesCount = allRuleSeeds.length;
const systemProfilesCount = 1;
const systemSettingsCount = settingSeed.length;

export async function seedDatabase(db: DbOrTx) {
  if ((await getSystemRulesCount(db)) < systemRulesCount) await seedRules(db);

  if ((await getSystemProfilesCount(db)) < systemProfilesCount) await seedProfiles(db);

  if ((await getSystemSettingsCount(db)) < systemSettingsCount) await seedSettings(db);
}

async function seedRules(db: DbOrTx) {
  for (const rule of allRuleSeeds.reverse()) {
    try {
      await createFullRule(db, rule);
    } catch (error) {
      // só mostra no console por enquanto e continua a criação da regra
      console.error(error);
      continue;
    }
  }
}

async function seedProfiles(db: DbOrTx) {
  try {
    const systemRules = await getSystemRules(db);
    profileSeed_allRules.rules = systemRules;

    await createFullProfile(db, profileSeed_allRules);
  } catch (error) {
    // só mostra no console por enquanto e continua a criação do perfil
    console.error(error);
  }
}
function seedSettings(db: DbOrTx) {
  createSettings(db, settingSeed);
}
