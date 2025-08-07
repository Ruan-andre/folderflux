import { db } from "../../db";
import { createResponse, handleError, toggleColumnStatus } from "../../db/functions";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import {
  FolderSchema,
  FolderTable,
  NewProfile,
  ProfileFoldersTable,
  ProfileRulesTable,
  ProfileSchema,
  ProfileTable,
  RuleSchema,
  RuleTable,
} from "../../db/schema";
import { and, count, eq, inArray, like } from "drizzle-orm";
import { buildTreeFromDb } from "./ruleService";
import { FullRule } from "~/src/shared/types/RuleWithDetails";

export async function createFullProfile(data: FullProfile): Promise<DbResponse<FullProfile>> {
  const { folders, rules } = data;
  const newProfileData: NewProfile = data;
  const exists = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.name, newProfileData.name),
  });

  if (exists) {
    return createResponse(false, "Já existe um perfil com este nome");
  }

  try {
    const fullProfile = await db.transaction(async (tx) => {
      const [insertedProfile] = await tx.insert(ProfileTable).values(newProfileData).returning();

      const rulesWithProfileId = rules.map((r) => ({ ruleId: r.id!, profileId: insertedProfile.id }));
      const folderWithProfileId = folders.map((f) => ({ folderId: f.id!, profileId: insertedProfile.id }));

      let associatedRules: RuleSchema[] = [];
      let associatedFolders: FolderSchema[] = [];

      if (rulesWithProfileId.length > 0) {
        await tx.insert(ProfileRulesTable).values(rulesWithProfileId);
        associatedRules = await tx
          .select()
          .from(RuleTable)
          .where(
            inArray(
              RuleTable.id,
              rulesWithProfileId.map((x) => x.ruleId)
            )
          );
      }

      if (folderWithProfileId.length > 0) {
        await tx.insert(ProfileFoldersTable).values(folderWithProfileId);
        associatedFolders = await tx
          .select()
          .from(FolderTable)
          .where(
            inArray(
              FolderTable.id,
              folderWithProfileId.map((x) => x.folderId)
            )
          );
      }

      return {
        ...insertedProfile,
        folders: associatedFolders,
        rules: associatedRules,
      };
    });

    return createResponse(true, "Perfil criado com sucesso!", fullProfile);
  } catch (e) {
    return createResponse(false, `Erro ao criar perfil! ${e}`);
  }
}

export async function getAllProfiles(): Promise<DbResponse<FullProfile[]>> {
  const profilesWithRelations = await db.query.ProfileTable.findMany({
    with: {
      profileFolders: {
        with: {
          folder: true,
        },
      },
      profileRules: {
        with: {
          rule: true,
        },
      },
    },
  });

  const fullProfiles = profilesWithRelations.map((p) => ({
    ...p,
    folders: p.profileFolders.map((pf) => pf.folder),
    rules: p.profileRules.map((pr) => pr.rule),
  }));

  return createResponse(true, "Sucesso ao buscar perfis", fullProfiles);
}

export async function deleteProfile(profileId: number): Promise<DbResponse> {
  try {
    const deleted = await db.delete(ProfileTable).where(eq(ProfileTable.id, profileId)).returning();
    if (deleted.length > 0) {
      return createResponse(true, "Perfil excluído!");
    } else {
      return createResponse(false, "Erro ao excluir o perfil!");
    }
  } catch (_error) {
    return handleError(_error, "Erro ao excluir perfil");
  }
}

export async function duplicateProfile(profileToDuplicate: FullProfile): Promise<DbResponse<FullProfile>> {
  const newProfile = {
    ...profileToDuplicate,
    id: undefined,
    name: await getNewProfileName(profileToDuplicate.name),
  };
  return createFullProfile(newProfile);
}

export async function toggleProfileStatus(profileId: number): Promise<DbResponse> {
  return await toggleColumnStatus(ProfileTable, profileId);
}

export async function updateProfile(data: FullProfile): Promise<DbResponse> {
  const { rules: updatedRules, folders: updatedFolders } = data;
  const { id, name, description, iconId } = data as ProfileSchema;
  const existentProfileData = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.id, data.id as number),
    with: {
      profileFolders: {
        with: {
          folder: true,
        },
      },
      profileRules: {
        with: {
          rule: true,
        },
      },
    },
  });

  if (!existentProfileData) return createResponse(false, "Perfil não encontrado!");

  try {
    const response = await db.transaction(async (tx): Promise<DbResponse> => {
      const updatedProfile = await tx
        .update(ProfileTable)
        .set({ name, description, iconId })
        .where(eq(ProfileTable.id, id));

      const currentRulesIds = existentProfileData.profileRules.map((r) => r.rule.id);
      const currentFoldersIds = existentProfileData.profileFolders.map((r) => r.folder.id);
      const updatedRulesIds = updatedRules.map((r) => r.id as number);
      const updatedFoldersIds = updatedFolders.map((f) => f.id as number);

      const rulesIdsToDelete = currentRulesIds.filter((id) => !updatedRulesIds.includes(id));
      const foldersIdsToDelete = currentFoldersIds.filter((id) => !updatedFoldersIds.includes(id));
      const rulesIdsToAdd = updatedRulesIds.filter((id) => !currentRulesIds.includes(id));
      const foldersIdsToAdd = updatedFoldersIds.filter((id) => !currentFoldersIds.includes(id));

      if (rulesIdsToDelete.length > 0) {
        await tx
          .delete(ProfileRulesTable)
          .where(
            and(
              eq(ProfileRulesTable.profileId, existentProfileData.id),
              inArray(ProfileRulesTable.ruleId, rulesIdsToDelete)
            )
          );
      }
      if (foldersIdsToDelete.length > 0) {
        await tx
          .delete(ProfileFoldersTable)
          .where(
            and(
              eq(ProfileFoldersTable.profileId, existentProfileData.id),
              inArray(ProfileFoldersTable.folderId, foldersIdsToDelete)
            )
          );
      }
      if (rulesIdsToAdd.length > 0) {
        await tx.insert(ProfileRulesTable).values(rulesIdsToAdd.map((r) => ({ ruleId: r, profileId: id })));
      }
      if (foldersIdsToAdd.length > 0) {
        await tx
          .insert(ProfileFoldersTable)
          .values(foldersIdsToAdd.map((f) => ({ folderId: f, profileId: id })));
      }
      if (updatedProfile.changes > 0) return createResponse(true, "Perfil atualizado com sucesso!");
      else return createResponse(false, "Erro ao atualizar perfil");
    });
    return response;
  } catch (error) {
    return handleError(error, "Erro ao atualizar perfil");
  }
}

export async function getSystemProfile(): Promise<FullProfile | null> {
  const defaultProfile = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.isSystem, true),
    with: {
      profileFolders: {
        with: {
          folder: true,
        },
      },
      profileRules: {
        with: {
          rule: {
            with: { conditionGroups: { with: { childGroups: true, childConditions: true } }, action: true },
          },
        },
      },
    },
  });

  if (defaultProfile) {
    const fullRules: FullRule[] = defaultProfile.profileRules.map((pr) => {
      const ruleData = pr.rule;
      const tree = buildTreeFromDb(
        ruleData.conditionGroups,
        ruleData.conditionGroups.flatMap((g) => g.childConditions)
      );
      return {
        ...ruleData,
        action: ruleData.action!,
        conditionsTree: tree,
      };
    });
    const fullProfile: FullProfile = {
      ...defaultProfile,
      folders: defaultProfile.profileFolders.map((f) => f.folder),
      rules: fullRules,
    };
    return fullProfile;
  }
  return null;
}
export async function getSystemProfilesCount(): Promise<number> {
  return (await db.select({ count: count() }).from(ProfileTable).where(eq(ProfileTable.isSystem, true)))[0]
    .count;
}

// Internal functions
async function getNewProfileName(existentProfileName: string): Promise<string> {
  const existentProfile = await db
    .select()
    .from(ProfileTable)
    .where(like(ProfileTable.name, `%${existentProfileName}%`));
  const newName = `${existentProfile[0].name} (${existentProfile.length > 1 ? existentProfile.length + 1 : 2})`;
  return newName;
}
