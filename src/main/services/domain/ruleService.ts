import {
  RuleTable,
  ConditionsTreeTable,
  ActionTable,
  ConditionTreeSchema,
  NewRule,
  NewAction,
  ActionSchema,
} from "../../../db/schema";
import { count, eq, like } from "drizzle-orm";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullRule, NewFullRulePayload } from "@/shared/types/RuleWithDetails";
import { IConditionGroup, ICondition } from "@/shared/types/ConditionsType";
import { createResponse, toggleColumnStatus } from "@/db/functions";
import { DbOrTx } from "../../../db";

// --- LEITURA ---

export async function getAllRules(db: DbOrTx): Promise<DbResponse<FullRule[]>> {
  const rulesList = await db.query.RuleTable.findMany({
    with: {
      action: true,
      conditionsTree: true,
    },
  });

  const fullRules: FullRule[] = rulesList
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      isActive: rule.isActive,
      isSystem: rule.isSystem,
      conditionsTree: buildTreeFromDb(
        rule.conditionsTree,
        rule.conditionsTree.find((r) => r.parentGroupId === null)?.id ?? undefined
      ),
      action: rule.action!,
      fromTour: rule.fromTour,
    }))
    .sort((a, b) => b.id - a.id);

  return createResponse(true, "Regras carregadas com sucesso", fullRules);
}

export async function getRuleById(db: DbOrTx, ruleId: number): Promise<DbResponse<FullRule>> {
  const rule = await db.query.RuleTable.findFirst({
    where: eq(RuleTable.id, ruleId),
    with: {
      action: true,
      conditionsTree: true,
    },
  });

  if (!rule) return createResponse(false, "Regra não encontrada");

  const { id, name, description, isActive, isSystem, conditionsTree, fromTour } = rule;
  const fullRule: FullRule = {
    id,
    name,
    description,
    isActive,
    isSystem,
    action: rule.action!,
    conditionsTree: buildTreeFromDb(
      conditionsTree,
      conditionsTree.find((r) => r.parentGroupId === null)?.id ?? undefined
    ),
    fromTour,
  };

  return createResponse(true, "Regra encontrada", fullRule);
}

// --- CRIAÇÃO / ATUALIZAÇÃO / EXCLUSÃO ---

export async function createFullRule(
  db: DbOrTx,
  data: NewFullRulePayload,
  isTourActive?: boolean
): Promise<DbResponse<FullRule>> {
  const { rule, action, conditionsTree } = data;

  const exists = await db.query.RuleTable.findFirst({
    where: eq(RuleTable.name, rule.name),
  });
  if (exists) {
    if (isTourActive) {
      rule.name = await getNewRuleName(db, rule.name);
    } else return createResponse(false, "Já existe uma regra com este nome");
  }

  const newRuleId = db.transaction((tx) => {
    const insertedRule = tx.insert(RuleTable).values(rule).returning({ id: RuleTable.id }).get();
    tx.insert(ActionTable)
      .values({ ...action, ruleId: insertedRule.id })
      .run();

    insertConditionTreeSync(tx, conditionsTree, insertedRule.id, null);
    return insertedRule.id;
  });

  return getRuleById(db, newRuleId);
}

export async function updateRule(db: DbOrTx, ruleUpdated: FullRule): Promise<DbResponse> {
  await db
    .update(RuleTable)
    .set({
      name: ruleUpdated.name,
      description: ruleUpdated.description,
      isActive: ruleUpdated.isActive,
    })
    .where(eq(RuleTable.id, ruleUpdated.id));

  await updateConditionTree(db, ruleUpdated.id, ruleUpdated.conditionsTree);
  await updateActionRule(db, ruleUpdated.action);

  return createResponse(true, "Regra atualizada com sucesso");
}

export async function deleteRule(db: DbOrTx, id: number): Promise<DbResponse> {
  await db.delete(RuleTable).where(eq(RuleTable.id, id));
  return createResponse(true, "Regra excluída");
}

export async function deleteRulesFromTour(db: DbOrTx) {
  await db.delete(RuleTable).where(eq(RuleTable.fromTour, true));
}

export async function duplicateRule(db: DbOrTx, ruleIdToDuplicate: number): Promise<DbResponse<FullRule>> {
  const originalRuleResponse = await getRuleById(db, ruleIdToDuplicate);
  if (!originalRuleResponse.status || !originalRuleResponse.items) {
    return createResponse(false, "Regra original não encontrada");
  }

  const original = originalRuleResponse.items;
  const newRuleName = await getNewRuleName(db, original.name);

  const newRulePayload: NewRule = {
    name: newRuleName,
    description: original.description,
    isSystem: false,
    isActive: original.isActive,
  };

  const newActionPayload: NewAction = {
    ruleId: 0, // será sobrescrito no insert
    type: original.action.type,
    value: original.action.value ?? undefined,
  };

  return await createFullRule(db, {
    rule: newRulePayload,
    action: newActionPayload,
    conditionsTree: original.conditionsTree,
  });
}

// --- STATUS / SISTEMA ---

export async function toggleRuleActive(db: DbOrTx, id: number): Promise<DbResponse> {
  return toggleColumnStatus(db, RuleTable, id);
}

export async function getSystemRules(db: DbOrTx): Promise<FullRule[]> {
  const rules = await db.query.RuleTable.findMany({
    where: eq(RuleTable.isSystem, true),
    with: { action: true, conditionsTree: true },
  });

  const fullRules: FullRule[] = rules
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      isActive: rule.isActive,
      isSystem: rule.isSystem,
      conditionsTree: buildTreeFromDb(
        rule.conditionsTree,
        rule.conditionsTree.find((r) => r.parentGroupId === null)?.id ?? undefined
      ),
      action: rule.action!,
      fromTour: rule.fromTour,
    }))
    .sort((a, b) => b.id - a.id);

  return fullRules;
}

export async function getSystemRulesCount(db: DbOrTx): Promise<number> {
  const result = await db.select({ count: count() }).from(RuleTable).where(eq(RuleTable.isSystem, true));

  return result[0].count;
}

export function buildTreeFromDb(nodes: ConditionTreeSchema[], explicitRootId?: number): IConditionGroup {
  if (!nodes || nodes.length === 0) {
    return { id: "root", type: "group", operator: "AND", children: [], displayOrder: 1 };
  }

  const findDefaultRoot = (): ConditionTreeSchema | undefined => {
    const rootGroup = nodes.filter((n) => n.parentGroupId === null && n.type === "group");
    if (rootGroup.length === 0) {
      throw "Grupo raiz de condições, não encontrado!";
    }
    return rootGroup.sort((a, b) => {
      const da = a.displayOrder ?? 0;
      const db = b.displayOrder ?? 0;
      if (da !== db) return da - db;
      return (a.id as number) - (b.id as number);
    })[0];
  };

  const rootNode =
    (explicitRootId !== undefined && nodes.find((n) => n.id === explicitRootId && n.type === "group")) ??
    findDefaultRoot();

  if (!rootNode) {
    const children = nodes
      .filter((n) => n.parentGroupId === null)
      .map((n) =>
        n.type === "group"
          ? ({
              id: n.id,
              type: "group",
              operator: (n.operator as "AND" | "OR") ?? "AND",
              children: [],
              displayOrder: n.displayOrder ?? 1,
            } as IConditionGroup)
          : ({
              id: n.id,
              type: "condition",
              field: n.field as ICondition["field"],
              fieldOperator: n.fieldOperator as ICondition["fieldOperator"],
              value: n.value ?? "",
              value2: n.value2 ?? undefined,
              displayOrder: n.displayOrder ?? 1,
            } as ICondition)
      );

    return { id: "root", type: "group", operator: "AND", displayOrder: 1, children };
  }

  const visited = new Set<number>();

  const buildGroup = (groupId: number): IConditionGroup => {
    if (visited.has(groupId)) {
      throw new Error(`Ciclo detectado na árvore de condições no grupo ${groupId}`);
    }
    visited.add(groupId);

    const node = nodes.find((n) => n.id === groupId);
    const operator = node?.operator ?? "AND";
    const displayOrder = node?.displayOrder ?? 1;

    const childrenNodes = nodes.filter((n) => n.parentGroupId === groupId);

    const children = childrenNodes.map((n) => {
      if (n.type === "group") {
        return buildGroup(n.id);
      } else {
        return {
          id: n.id,
          type: "condition",
          field: n.field as ICondition["field"],
          fieldOperator: n.fieldOperator as ICondition["fieldOperator"],
          value: n.value ?? "",
          value2: n.value2 ?? undefined,
          displayOrder: n.displayOrder ?? 1,
        } as ICondition;
      }
    });

    return {
      id: node!.id,
      type: "group",
      operator: operator as "AND" | "OR",
      displayOrder,
      children,
    };
  };
  return buildGroup(rootNode.id);
}

function insertConditionTreeSync(
  tx: DbOrTx,
  group: IConditionGroup,
  ruleId: number,
  parentId: number | null
): void {
  const insertedGroup = tx
    .insert(ConditionsTreeTable)
    .values({
      type: "group",
      operator: group.operator,
      ruleId,
      parentGroupId: parentId,
      displayOrder: group.displayOrder,
    })
    .returning({ id: ConditionsTreeTable.id })
    .get();

  for (const child of group.children) {
    if (child.type === "group") {
      // Chamada recursiva síncrona
      insertConditionTreeSync(tx, child, ruleId, insertedGroup.id);
    } else {
      tx.insert(ConditionsTreeTable)
        .values({
          type: "condition",
          field: child.field,
          fieldOperator: child.fieldOperator,
          value: child.value,
          value2: child.value2,
          ruleId,
          parentGroupId: insertedGroup.id,
          displayOrder: child.displayOrder,
        })
        .run();
    }
  }
}

async function updateConditionTree(db: DbOrTx, ruleId: number, newTree: IConditionGroup): Promise<void> {
  await db.delete(ConditionsTreeTable).where(eq(ConditionsTreeTable.ruleId, ruleId));
  insertConditionTreeSync(db, newTree, ruleId, null);
}

async function updateActionRule(db: DbOrTx, action: ActionSchema): Promise<void> {
  await db
    .update(ActionTable)
    .set({ type: action.type, value: action.value })
    .where(eq(ActionTable.ruleId, action.ruleId));
}

async function getNewRuleName(db: DbOrTx, existentRuleName: string): Promise<string> {
  const baseName = existentRuleName.replace(/\s\(\d+\)$/, "").trim();
  const existentRules = await db.query.RuleTable.findMany({
    where: like(RuleTable.name, `${baseName}%`),
  });
  return `${baseName} (${existentRules.length + 1})`;
}
