/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, DbOrTx } from "../../db";
import {
  ActionTable,
  NewAction,
  ConditionTable,
  ConditionGroupTable,
  NewRule,
  RuleTable,
  Action,
  RuleSchema,
} from "../../db/schema";
import { count, eq, like } from "drizzle-orm";
import { DbResponse } from "../../shared/types/DbResponse";
import { createResponse, toggleColumnStatus } from "../../db/functions";
import { FullRule, NewFullRulePayload } from "~/src/shared/types/RuleWithDetails";
import { ICondition, IConditionGroup } from "../../shared/types/ConditionsType";

// --- FUNÇÕES DE LEITURA (READ) ---
export async function getAllRules(): Promise<DbResponse<FullRule[]>> {
  const rulesList = await db.query.RuleTable.findMany({
    with: {
      action: true,
      conditionGroups: { with: { childConditions: true } },
    },
  });

  const fullRules: FullRule[] = rulesList.map((r) => {
    const tree = buildTreeFromDb(
      r.conditionGroups,
      r.conditionGroups.flatMap((g) => g.childConditions)
    );
    return {
      ...r,
      action: r.action!,
      conditionsTree: tree,
    };
  });

  return createResponse(true, "Sucesso ao buscar regras", fullRules);
}

export async function getConditionTree(ruleId: number): Promise<DbResponse<IConditionGroup>> {
  const groups = await db.query.ConditionGroupTable.findMany({
    where: eq(ConditionGroupTable.ruleId, ruleId),
  });
  const groupIds = groups.map((g) => g.id);
  const conditions =
    groupIds.length > 0
      ? await db.query.ConditionTable.findMany({ where: (c, { inArray }) => inArray(c.groupId, groupIds) })
      : [];

  const tree = buildTreeFromDb(groups, conditions);

  return createResponse(true, "Árvore de condições carregada.", tree);
}

export async function getRuleById(id: number, tx: DbOrTx = db): Promise<DbResponse<FullRule>> {
  const ruleData = await tx.query.RuleTable.findFirst({
    where: eq(RuleTable.id, id),
    with: { action: true },
  });

  if (!ruleData) return createResponse(false, "Regra não encontrada");

  const conditionsTreeResponse = await getConditionTree(id);

  const fullRule: FullRule = {
    ...ruleData,
    conditionsTree: conditionsTreeResponse.items!,
    action: ruleData.action!,
  };

  return createResponse(true, "Regra encontrada", fullRule);
}

// --- FUNÇÕES DE ESCRITA (CREATE, UPDATE, DELETE) ---
export async function createFullRule(data: NewFullRulePayload): Promise<DbResponse<FullRule>> {
  const { rule: newRuleData, conditionsTree, action } = data;

  const exists = await db.query.RuleTable.findFirst({ where: eq(RuleTable.name, newRuleData.name) });
  if (exists) return createResponse(false, "Já existe uma regra com este nome");

  return db.transaction(async (tx) => {
    const [insertedRule] = await tx.insert(RuleTable).values(newRuleData).returning();
    await insertConditionTree(tx, conditionsTree, insertedRule.id, null);
    await tx.insert(ActionTable).values({ ...action, ruleId: insertedRule.id });
    const finalResult = await getRuleById(insertedRule.id, tx);
    if (!finalResult.items) throw new Error("Falha ao buscar a regra recém-criada.");
    return createResponse(true, "Regra criada com sucesso!", finalResult.items);
  });
}

async function updateConditionTree(ruleId: number, newTree: IConditionGroup): Promise<DbResponse> {
  return db.transaction(async (tx) => {
    await tx.delete(ConditionGroupTable).where(eq(ConditionGroupTable.ruleId, ruleId));
    await insertConditionTree(tx, newTree, ruleId, null);
    return createResponse(true, "Condições atualizadas com sucesso");
  });
}

export async function duplicateRule(ruleIdToDuplicate: number): Promise<DbResponse<FullRule>> {
  const originalRuleResponse = await getRuleById(ruleIdToDuplicate);
  if (!originalRuleResponse.status || !originalRuleResponse.items) {
    throw new Error("Regra original para duplicação não encontrada.");
  }
  const originalRule = originalRuleResponse.items;
  const newRuleName = await getNewRuleName(originalRule.name);

  const newRulePayload: NewRule = {
    name: newRuleName,
    description: originalRule.description,
    isActive: false,
    isSystem: originalRule.isSystem,
  };
  const newActionPayload: NewAction = {
    ruleId: originalRule.id!,
    type: originalRule.action.type,
    value: originalRule.action.value ?? undefined,
  };

  return createFullRule({
    rule: newRulePayload,
    conditionsTree: originalRule.conditionsTree as IConditionGroup,
    action: newActionPayload,
  });
}

export async function deleteRule(id: number): Promise<DbResponse> {
  await db.delete(RuleTable).where(eq(RuleTable.id, id));
  return createResponse(true, "Regra excluída");
}

export async function updateRule(ruleUpdated: FullRule): Promise<DbResponse> {
  await db
    .update(RuleTable)
    .set({ name: ruleUpdated.name, description: ruleUpdated.description, isActive: ruleUpdated.isActive })
    .where(eq(RuleTable.id, ruleUpdated.id));

  await updateConditionTree(ruleUpdated.id, ruleUpdated.conditionsTree);
  await updateActionRule(ruleUpdated.action);

  return createResponse(true, "Regra atualizada");
}

export async function toggleRuleActive(id: number): Promise<DbResponse> {
  return toggleColumnStatus(RuleTable, id);
}

export async function getSystemRules(): Promise<RuleSchema[]> {
  return await db.query.RuleTable.findMany({ where: eq(RuleTable.isSystem, true) });
}
export async function getSystemRulesCount(): Promise<number> {
  return (await db.select({ count: count() }).from(RuleTable).where(eq(RuleTable.isSystem, true)))[0].count;
}

export function buildTreeFromDb(groups: any[], conditions: any[]): IConditionGroup {
  if (groups.length === 0) {
    return { id: "root", type: "group", operator: "AND", children: [] };
  }

  const groupMap = new Map(
    groups.map((g) => [g.id, { ...g, type: "group", children: [] as (ICondition | IConditionGroup)[] }])
  );
  const root = groups.find((g) => g.parentGroupId === null);

  if (!root) throw new Error("Grupo raiz não encontrado.");

  for (const condition of conditions) {
    groupMap.get(condition.groupId)?.children.push({
      id: condition.id,
      type: "condition",
      field: condition.type,
      operator: condition.typeAction,
      value: condition.value ?? "",
      value2: condition.value2 ?? "",
    });
  }

  for (const group of groups) {
    if (group.parentGroupId) {
      groupMap.get(group.parentGroupId)?.children.push(groupMap.get(group.id)!);
    }
  }
  return groupMap.get(root.id)!;
}
// --- HELPERS INTERNOS ---

/**
 * Função auxiliar recursiva para inserir a árvore de condições no banco.
 */
async function insertConditionTree(
  tx: DbOrTx = db,
  group: IConditionGroup,
  ruleId: number,
  parentId: number | null
): Promise<void> {
  const [insertedGroup] = await tx
    .insert(ConditionGroupTable)
    .values({
      operator: group.operator,
      ruleId,
      parentGroupId: parentId,
    })
    .returning({ id: ConditionGroupTable.id });

  for (const child of group.children) {
    if (child.type === "group") {
      await insertConditionTree(tx, child, ruleId, insertedGroup.id);
    } else {
      await tx.insert(ConditionTable).values({
        type: child.field,
        typeAction: child.operator,
        value: child.value,
        value2: child.value2,
        groupId: insertedGroup.id,
      });
    }
  }
}

/**
 * Constrói uma árvore de condições aninhada a partir de listas planas do banco.
 */

/**
 * Gera um novo nome único para uma regra duplicada (ex: "Nome (2)").
 */
async function getNewRuleName(existentRuleName: string): Promise<string> {
  const baseName = existentRuleName.replace(/\s\(\d+\)$/, "").trim();
  const existentRules = await db.query.RuleTable.findMany({ where: like(RuleTable.name, `${baseName}%`) });
  return `${baseName} (${existentRules.length + 1})`;
}
async function updateActionRule(action: Action): Promise<void> {
  await db
    .update(ActionTable)
    .set({ type: action.type, value: action.value })
    .where(eq(ActionTable.ruleId, action.ruleId));
}
