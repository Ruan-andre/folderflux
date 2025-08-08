import { db, DbOrTx } from "../../db";
import {
  RuleTable,
  ConditionsTreeTable,
  ActionTable,
  ConditionTreeSchema,
  NewRule,
  NewAction,
  ActionSchema,
  RuleSchema,
} from "../../db/schema";
import { count, eq, like } from "drizzle-orm";
import { DbResponse } from "~/src/shared/types/DbResponse";
import { FullRule, NewFullRulePayload } from "@/shared/types/RuleWithDetails";
import { IConditionGroup, ICondition } from "@/shared/types/ConditionsType";
import { createResponse, toggleColumnStatus } from "@/db/functions";
// --- LEITURA ---

export async function getAllRules(): Promise<DbResponse<FullRule[]>> {
  const rulesList = await db.query.RuleTable.findMany({
    with: {
      action: true,
      conditionsTree: true,
    },
  });

  const fullRules: FullRule[] = rulesList.map((rule) => ({
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
  }));

  return createResponse(true, "Regras carregadas com sucesso", fullRules);
}

export async function getRuleById(ruleId: number, tx: DbOrTx = db): Promise<DbResponse<FullRule>> {
  const rule = await tx.query.RuleTable.findFirst({
    where: eq(RuleTable.id, ruleId),
    with: {
      action: true,
      conditionsTree: true,
    },
  });

  if (!rule) return createResponse(false, "Regra não encontrada");

  const { id, name, description, isActive, isSystem, conditionsTree } = rule;
  const fullRule: FullRule = {
    id,
    name,
    description,
    isActive,
    isSystem,
    action: rule.action!,
    conditionsTree: buildTreeFromDb(conditionsTree),
  };

  return createResponse(true, "Regra encontrada", fullRule);
}

// --- CRIAÇÃO / ATUALIZAÇÃO / EXCLUSÃO ---

export async function createFullRule(data: NewFullRulePayload): Promise<DbResponse<FullRule>> {
  const { rule, action, conditionsTree } = data;

  const exists = await db.query.RuleTable.findFirst({
    where: eq(RuleTable.name, rule.name),
  });
  if (exists) return createResponse(false, "Já existe uma regra com este nome");

  return db.transaction(async (tx) => {
    const [insertedRule] = await tx.insert(RuleTable).values(rule).returning();
    await insertConditionTree(tx, conditionsTree, insertedRule.id, null);
    await tx.insert(ActionTable).values({ ...action, ruleId: insertedRule.id });
    return await getRuleById(insertedRule.id, tx);
  });
}

export async function updateRule(ruleUpdated: FullRule): Promise<DbResponse> {
  await db
    .update(RuleTable)
    .set({
      name: ruleUpdated.name,
      description: ruleUpdated.description,
      isActive: ruleUpdated.isActive,
    })
    .where(eq(RuleTable.id, ruleUpdated.id));

  await updateConditionTree(ruleUpdated.id, ruleUpdated.conditionsTree);
  await updateActionRule(ruleUpdated.action);

  return createResponse(true, "Regra atualizada com sucesso");
}

export async function deleteRule(id: number): Promise<DbResponse> {
  await db.delete(RuleTable).where(eq(RuleTable.id, id));
  return createResponse(true, "Regra excluída");
}

export async function duplicateRule(ruleIdToDuplicate: number): Promise<DbResponse<FullRule>> {
  const originalRuleResponse = await getRuleById(ruleIdToDuplicate);
  if (!originalRuleResponse.status || !originalRuleResponse.items) {
    return createResponse(false, "Regra original não encontrada");
  }

  const original = originalRuleResponse.items;
  const newRuleName = await getNewRuleName(original.name);

  const newRulePayload: NewRule = {
    name: newRuleName,
    description: original.description,
    isSystem: original.isSystem,
    isActive: false,
  };

  const newActionPayload: NewAction = {
    ruleId: 0, // será sobrescrito no insert
    type: original.action.type,
    value: original.action.value ?? undefined,
  };

  return await createFullRule({
    rule: newRulePayload,
    action: newActionPayload,
    conditionsTree: original.conditionsTree,
  });
}

// --- STATUS / SISTEMA ---

export async function toggleRuleActive(id: number): Promise<DbResponse> {
  return toggleColumnStatus(RuleTable, id);
}

export async function getSystemRules(): Promise<RuleSchema[]> {
  const rules = await db.query.RuleTable.findMany({
    where: eq(RuleTable.isSystem, true),
    with: { action: true, conditionsTree: true },
  });

  return rules;
}

export async function getSystemRulesCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(RuleTable).where(eq(RuleTable.isSystem, true));

  return result[0].count;
}

// --- BUILD TREE ---

export function buildTreeFromDb(nodes: ConditionTreeSchema[], explicitRootId?: number): IConditionGroup {
  if (!nodes || nodes.length === 0) {
    return { id: "root", type: "group", operator: "AND", children: [], displayOrder: 1 };
  }

  const findDefaultRoot = (): ConditionTreeSchema | undefined => {
    const rootGroup = nodes.filter((n) => n.parentGroupId === null && n.type === "group");
    if (rootGroup.length === 0) {
      return nodes.find((n) => n.type === "group");
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

// --- INSERT TREE ---

async function insertConditionTree(
  tx: DbOrTx,
  group: IConditionGroup,
  ruleId: number,
  parentId: number | null
): Promise<void> {
  const [insertedGroup] = await tx
    .insert(ConditionsTreeTable)
    .values({
      type: "group",
      operator: group.operator,
      ruleId,
      parentGroupId: parentId,
      displayOrder: group.displayOrder,
    })
    .returning({ id: ConditionsTreeTable.id });

  for (const child of group.children) {
    if (child.type === "group") {
      await insertConditionTree(tx, child, ruleId, insertedGroup.id);
    } else {
      await tx.insert(ConditionsTreeTable).values({
        type: "condition",
        field: child.field,
        fieldOperator: child.fieldOperator,
        value: child.value,
        value2: child.value2,
        ruleId,
        parentGroupId: insertedGroup.id,
        displayOrder: child.displayOrder,
      });
    }
  }
}

async function updateConditionTree(ruleId: number, newTree: IConditionGroup): Promise<void> {
  await db.delete(ConditionsTreeTable).where(eq(ConditionsTreeTable.ruleId, ruleId));
  await insertConditionTree(db, newTree, ruleId, null);
}

async function updateActionRule(action: ActionSchema): Promise<void> {
  await db
    .update(ActionTable)
    .set({ type: action.type, value: action.value })
    .where(eq(ActionTable.ruleId, action.ruleId));
}

async function getNewRuleName(existentRuleName: string): Promise<string> {
  const baseName = existentRuleName.replace(/\s\(\d+\)$/, "").trim();
  const existentRules = await db.query.RuleTable.findMany({
    where: like(RuleTable.name, `${baseName}%`),
  });
  return `${baseName} (${existentRules.length + 1})`;
}
