import { createResponse, handleError, toggleColumnStatus } from "../../db/functions";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullProfile, NewFullProfile } from "~/src/shared/types/ProfileWithDetails";
import {
  FolderTable,
  NewProfile,
  ProfileFoldersTable,
  ProfileRulesTable,
  ProfileSchema,
  ProfileTable,
  RuleTable,
} from "../../db/schema";
import { and, count, eq, inArray, like } from "drizzle-orm";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { buildTreeFromDb } from "./ruleService";
import { DbOrTx } from "~/src/db";

export async function createFullProfile(db: DbOrTx, data: NewFullProfile): Promise<DbResponse<FullProfile>> {
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
      const foldersWithProfileId = folders.map((f) => ({ folderId: f.id!, profileId: insertedProfile.id }));

      if (rulesWithProfileId.length > 0) {
        await tx.insert(ProfileRulesTable).values(rulesWithProfileId);
      }

      if (foldersWithProfileId.length > 0) {
        await tx.insert(ProfileFoldersTable).values(foldersWithProfileId);
      }

      const associatedFolders = await tx
        .select()
        .from(FolderTable)
        .where(
          inArray(
            FolderTable.id,
            folders.map((f) => f.id!)
          )
        );

      const associatedRules: FullRule[] = await Promise.all(
        rules.map(async (r) => {
          const rule = await db.query.RuleTable.findFirst({
            where: eq(RuleTable.id, r.id!),
            with: { conditionsTree: true, action: true },
          });

          return {
            ...rule!,
            conditionsTree: buildTreeFromDb(
              rule!.conditionsTree,
              rule!.conditionsTree.find((c) => c.parentGroupId === null)?.id
            ),
            action: rule!.action!,
          };
        })
      );

      const { id, name, description, iconId, isActive, isSystem } = insertedProfile;

      return {
        id,
        name,
        description,
        iconId,
        isActive,
        isSystem,
        folders: associatedFolders,
        rules: associatedRules,
      };
    });

    return createResponse(true, "Perfil criado com sucesso!", fullProfile);
  } catch (e) {
    return createResponse(false, `Erro ao criar perfil! ${e}`);
  }
}

export async function getAllProfiles(db: DbOrTx): Promise<DbResponse<FullProfile[]>> {
  const profilesWithRelations = await db.query.ProfileTable.findMany({
    with: {
      profileFolders: { with: { folder: true } },
      profileRules: { with: { rule: { with: { conditionsTree: true, action: true } } } },
    },
  });

  const fullProfiles: FullProfile[] = profilesWithRelations.map((p) => {
    const fullRules: FullRule[] = p.profileRules.map((pr) => ({
      ...pr.rule,
      conditionsTree: buildTreeFromDb(
        pr.rule.conditionsTree,
        pr.rule.conditionsTree.find((c) => c.parentGroupId === null)?.id
      ),
      action: pr.rule.action!,
    }));

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      iconId: p.iconId,
      isActive: p.isActive,
      isSystem: p.isSystem,
      folders: p.profileFolders.map((pf) => pf.folder),
      rules: fullRules,
    };
  });

  return createResponse(true, "Sucesso ao buscar perfis", fullProfiles);
}

export async function getProfileById(db: DbOrTx, profileId: number): Promise<DbResponse<FullProfile>> {
  const profile = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.id, profileId),
    with: {
      profileRules: { with: { rule: { with: { conditionsTree: true, action: true } } } },
      profileFolders: { with: { folder: true } },
    },
  });
  if (profile) {
    const { id, name, description, iconId, isActive, isSystem, profileFolders, profileRules } = profile;
    const fullRules: FullRule[] = profileRules.map((pr) => ({
      ...pr.rule,
      conditionsTree: buildTreeFromDb(
        pr.rule.conditionsTree,
        pr.rule.conditionsTree.find((c) => c.parentGroupId === null)?.id
      ),
      action: pr.rule.action!,
    }));
    const fullProfile = {
      id,
      name,
      description,
      iconId,
      isActive,
      isSystem,
      folders: profileFolders.map((pf) => pf.folder),
      rules: fullRules,
    };
    return createResponse(true, "Sucesso ao buscar o perfil.", fullProfile);
  } else {
    return createResponse(false, "Perfil não encontrado");
  }
}

export async function getSystemProfile(db: DbOrTx): Promise<FullProfile | null> {
  const defaultProfile = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.isSystem, true),
    with: {
      profileFolders: { with: { folder: true } },
      profileRules: {
        with: {
          rule: { with: { conditionsTree: true, action: true } },
        },
      },
    },
  });

  if (!defaultProfile) return null;

  const fullRules: FullRule[] = defaultProfile.profileRules.map((pr) => ({
    ...pr.rule,
    conditionsTree: buildTreeFromDb(
      pr.rule.conditionsTree,
      pr.rule.conditionsTree.find((c) => c.parentGroupId === null)?.id
    ),
    action: pr.rule.action!,
  }));

  const fullProfile: FullProfile = {
    ...defaultProfile,
    folders: defaultProfile.profileFolders.map((f) => f.folder),
    rules: fullRules,
  };

  return fullProfile;
}

export async function deleteProfile(db: DbOrTx, profileId: number): Promise<DbResponse> {
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

export async function duplicateProfile(
  db: DbOrTx,
  profileToDuplicate: FullProfile
): Promise<DbResponse<FullProfile>> {
  const newProfile: NewFullProfile = {
    ...profileToDuplicate,
    id: undefined,
    name: await getNewProfileName(db, profileToDuplicate.name),
  };
  return createFullProfile(db, newProfile);
}

export async function toggleProfileStatus(db: DbOrTx, profileId: number): Promise<DbResponse> {
  return await toggleColumnStatus(db, ProfileTable, profileId);
}

export async function updateProfile(db: DbOrTx, data: FullProfile): Promise<DbResponse> {
  const { rules: updatedRules, folders: updatedFolders } = data;
  const { id, name, description, iconId } = data as ProfileSchema;

  const existentProfileData = await db.query.ProfileTable.findFirst({
    where: eq(ProfileTable.id, id as number),
    with: {
      profileFolders: { with: { folder: true } },
      profileRules: { with: { rule: true } },
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
            and(eq(ProfileRulesTable.profileId, id), inArray(ProfileRulesTable.ruleId, rulesIdsToDelete))
          );
      }
      if (foldersIdsToDelete.length > 0) {
        await tx
          .delete(ProfileFoldersTable)
          .where(
            and(
              eq(ProfileFoldersTable.profileId, id),
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

export async function getProfilesActiveInactiveCount(db: DbOrTx): Promise<string> {
  const profileStatus = await db.select({ isActive: ProfileTable.isActive }).from(ProfileTable);
  return `${profileStatus.filter((p) => p.isActive).length} ativo(s), ${profileStatus.filter((p) => !p.isActive).length} inativo(s)`;
}

export async function getSystemProfilesCount(db: DbOrTx): Promise<number> {
  return (await db.select({ count: count() }).from(ProfileTable).where(eq(ProfileTable.isSystem, true)))[0]
    .count;
}

export async function getCountProfilesWithFolder(db: DbOrTx, folderId: number) {
  return (
    await db
      .select({ count: count() })
      .from(ProfileFoldersTable)
      .innerJoin(ProfileTable, eq(ProfileTable.id, ProfileFoldersTable.profileId))
      .where(and(eq(ProfileFoldersTable.folderId, folderId), eq(ProfileTable.isActive, true)))
  )[0].count;
}

// Internal helper
async function getNewProfileName(db: DbOrTx, existentProfileName: string): Promise<string> {
  const existentProfile = await db
    .select()
    .from(ProfileTable)
    .where(like(ProfileTable.name, `%${existentProfileName}%`));

  const newName = `${existentProfileName} (${existentProfile.length > 1 ? existentProfile.length + 1 : 2})`;
  return newName;
}
