import {
  createFullProfile,
  getSystemProfile,
  getSystemProfilesCount,
  updateProfile,
} from "../../main/services/domain/profileService";
import { createFullRule, getSystemRules, updateRule } from "../../main/services/domain/ruleService";
import { createSettings, getSystemSettingsCount } from "../../main/services/domain/settingsService";
import { allRuleSeeds } from "./rulesSeeds";
import { profileSeed_allRules } from "./profilesSeeds";
import { settingSeed } from "./settingsSeed";
import { DbOrTx } from "..";
import { ActionSchema } from "../schema";
import isEqual from "fast-deep-equal";

const systemProfilesCount = 1;
const systemSettingsCount = settingSeed.length;

export async function seedDatabase(db: DbOrTx) {
  await seedRules(db);

  if ((await getSystemProfilesCount(db)) < systemProfilesCount) await seedProfiles(db);

  if ((await getSystemSettingsCount(db)) < systemSettingsCount) await seedSettings(db);
}

async function seedRules(db: DbOrTx) {
  const existentSystemRules = await getSystemRules(db);
  for (const seed of allRuleSeeds.reverse()) {
    try {
      const currentRule = existentSystemRules.find((r) => r.name === seed.rule.name);
      if (!currentRule) {
        await createFullRule(db, seed);
      }
      if (
        currentRule &&
        currentRule.name === seed.rule.name &&
        currentRule.conditionsTree.children.length === seed.conditionsTree.children?.length &&
        currentRule.conditionsTree.operator === seed.conditionsTree.operator &&
        currentRule.conditionsTree.type === seed.conditionsTree.type
      ) {
        continue;
      } else if (currentRule) {
        const { rule, action, conditionsTree } = seed;
        currentRule.description = rule.description ?? "";
        currentRule.action = action as ActionSchema;
        currentRule.conditionsTree = conditionsTree;
        await updateRule(db, currentRule);
      }
    } catch (error) {
      // só mostra no console por enquanto e continua a criação da regra
      console.error(error);
      continue;
    }
  }
}

async function seedProfiles(db: DbOrTx) {
  try {
    const existentSystemProfile = await getSystemProfile(db);
    const systemRules = await getSystemRules(db);
    profileSeed_allRules.rules = systemRules;
    if (!existentSystemProfile) {
      await createFullProfile(db, profileSeed_allRules);
    } else if (
      existentSystemProfile.rules.length !== systemRules.length ||
      !isEqual(existentSystemProfile.rules, systemRules) ||
      existentSystemProfile.name !== profileSeed_allRules.name ||
      existentSystemProfile.description !== profileSeed_allRules.description
    ) {
      existentSystemProfile.name = profileSeed_allRules.name;
      existentSystemProfile.description = profileSeed_allRules.description!;
      existentSystemProfile.rules = systemRules;
      await updateProfile(db, existentSystemProfile);
    }
  } catch (error) {
    // só mostra no console por enquanto e continua a criação do perfil
    console.error(error);
  }
}
async function seedSettings(db: DbOrTx) {
  await createSettings(db, settingSeed);
}
