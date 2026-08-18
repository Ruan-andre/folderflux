import { describe, it, expect } from "vitest";
import {
  conditionEvaluators,
  evaluateCondition,
  evaluateConditionTree,
  conditionTreeUsesField,
} from "~/src/main/core/rules/conditions";
import { FIELD_CATALOG, TargetType } from "~/src/shared/rules/fieldCatalog";
import type FileInfo from "~/src/shared/types/FileInfo";
import type DirInfo from "~/src/shared/types/DirInfo";
import { condition, group } from "../helpers/ruleFactory";

const MB = 1024 * 1024;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const file = (over: Partial<FileInfo> = {}): FileInfo => ({
  name: "relatorio",
  nameWithExtension: "relatorio.pdf",
  extension: ".pdf",
  size: 2 * MB,
  ctime: daysAgo(10),
  mtime: daysAgo(5),
  fullPath: "/tmp/relatorio.pdf",
  parentDirectory: "/tmp",
  ...over,
});

const dir = (over: Partial<DirInfo> = {}): DirInfo => ({
  name: "Downloads",
  fullPath: "/tmp/Downloads",
  parentDirectory: "/tmp",
  size: 10 * MB,
  itemCount: 12,
  isEmpty: false,
  ctime: daysAgo(30),
  mtime: daysAgo(2),
  ...over,
});

const matchFile = (f: FileInfo, ...args: Parameters<typeof condition>) =>
  evaluateCondition(f, condition(...args), false);

const matchDir = (d: DirInfo, ...args: Parameters<typeof condition>) =>
  evaluateCondition(d, condition(...args), true);

describe("paridade entre o catálogo da UI e o motor", () => {
  const pairs = (Object.keys(FIELD_CATALOG) as TargetType[]).flatMap((targetType) =>
    Object.entries(FIELD_CATALOG[targetType]).flatMap(([field, spec]) =>
      spec.operators.map((operator) => ({ targetType, field, operator }))
    )
  );

  it.each(pairs)("$targetType: o motor implementa $field + $operator", ({ field, operator }) => {
    // Quando a UI oferece um par que o motor não implementa, a regra nunca
    // casa — em silêncio, sem erro e sem log. Este teste trava essa divergência.
    expect(conditionEvaluators[field]?.[operator]).toBeTypeOf("function");
  });
});

describe("condições de nome e extensão", () => {
  it("compara o nome sem a extensão, ignorando maiúsculas", () => {
    expect(matchFile(file(), "fileName", "contains", "RELAT")).toBe(true);
    expect(matchFile(file(), "fileName", "equals", "relatorio")).toBe(true);
    expect(matchFile(file(), "fileName", "startsWith", "rel")).toBe(true);
    expect(matchFile(file(), "fileName", "endsWith", "rio")).toBe(true);
    expect(matchFile(file(), "fileName", "notContains", "nota")).toBe(true);
    // "pdf" está na extensão, não no nome.
    expect(matchFile(file(), "fileName", "contains", "pdf")).toBe(false);
  });

  it("aceita a extensão com ou sem o ponto", () => {
    expect(matchFile(file(), "fileExtension", "equals", "pdf")).toBe(true);
    expect(matchFile(file(), "fileExtension", "equals", ".PDF")).toBe(true);
    expect(matchFile(file(), "fileExtension", "equals", "txt")).toBe(false);
  });

  it("suporta notEquals na extensão", () => {
    // A UI oferecia "não é igual a" e o motor não implementava: a condição
    // retornava sempre false e a regra nunca disparava.
    expect(matchFile(file(), "fileExtension", "notEquals", "txt")).toBe(true);
    expect(matchFile(file(), "fileExtension", "notEquals", "pdf")).toBe(false);
  });
});

describe("condições de tamanho", () => {
  it("interpreta o valor informado em MB", () => {
    expect(matchFile(file({ size: 3 * MB }), "fileSize", "higherThan", "2")).toBe(true);
    expect(matchFile(file({ size: 1 * MB }), "fileSize", "higherThan", "2")).toBe(false);
    expect(matchFile(file({ size: 1 * MB }), "fileSize", "lowerThan", "2")).toBe(true);
    expect(matchFile(file({ size: 5 * MB }), "fileSize", "isBetween", "4", "6")).toBe(true);
    expect(matchFile(file({ size: 7 * MB }), "fileSize", "isBetween", "4", "6")).toBe(false);
    expect(matchFile(file({ size: 2 * MB }), "fileSize", "equals", "2")).toBe(true);
  });
});

describe("condições de data", () => {
  it("higherThan/lowerThan comparam em dias de idade", () => {
    expect(matchFile(file({ mtime: daysAgo(40) }), "modifiedDate", "higherThan", "30")).toBe(true);
    expect(matchFile(file({ mtime: daysAgo(10) }), "modifiedDate", "higherThan", "30")).toBe(false);
    expect(matchFile(file({ mtime: daysAgo(10) }), "modifiedDate", "lowerThan", "30")).toBe(true);
  });

  it("equals compara o dia do calendário, não o timestamp exato", () => {
    // O item tem data E hora; o usuário informa só a data. Comparar o
    // timestamp exato fazia o operador nunca casar com nada.
    const meioDia = new Date(2026, 2, 15, 12, 34, 56);
    expect(matchFile(file({ ctime: meioDia }), "creationDate", "equals", "2026-03-15")).toBe(true);
    expect(matchFile(file({ ctime: meioDia }), "creationDate", "equals", "2026-03-16")).toBe(false);
  });

  it("isBetween usa o intervalo informado", () => {
    const data = new Date(2026, 2, 15);
    expect(matchFile(file({ ctime: data }), "creationDate", "isBetween", "2026-03-01", "2026-03-31")).toBe(
      true
    );
    expect(matchFile(file({ ctime: data }), "creationDate", "isBetween", "2026-04-01", "2026-04-30")).toBe(
      false
    );
  });
});

describe("condições exclusivas de diretório", () => {
  it("itemCount aceita todos os operadores numéricos", () => {
    expect(matchDir(dir({ itemCount: 12 }), "itemCount", "higherThan", "10")).toBe(true);
    expect(matchDir(dir({ itemCount: 12 }), "itemCount", "lowerThan", "10")).toBe(false);
    expect(matchDir(dir({ itemCount: 12 }), "itemCount", "equals", "12")).toBe(true);
    expect(matchDir(dir({ itemCount: 12 }), "itemCount", "isBetween", "10", "20")).toBe(true);
  });

  it("isEmpty compara com o valor booleano em texto", () => {
    expect(matchDir(dir({ isEmpty: true }), "isEmpty", "equals", "true")).toBe(true);
    expect(matchDir(dir({ isEmpty: true }), "isEmpty", "equals", "false")).toBe(false);
    expect(matchDir(dir({ isEmpty: false }), "isEmpty", "equals", "false")).toBe(true);
  });

  it("campos que não existem no alvo nunca casam", () => {
    expect(matchDir(dir(), "fileExtension", "equals", "pdf")).toBe(false);
    expect(matchFile(file(), "itemCount", "higherThan", "0")).toBe(false);
    expect(matchFile(file(), "isEmpty", "equals", "true")).toBe(false);
  });
});

describe("árvore de condições", () => {
  it("grupo vazio casa com tudo", () => {
    expect(evaluateConditionTree(file(), group("AND", []), false)).toBe(true);
  });

  it("AND exige todas e OR exige ao menos uma", () => {
    const tree = group("AND", [
      condition("fileName", "startsWith", "relat"),
      group("OR", [condition("fileExtension", "equals", "doc"), condition("fileExtension", "equals", "pdf")]),
    ]);

    expect(evaluateConditionTree(file(), tree, false)).toBe(true);
    expect(evaluateConditionTree(file({ name: "outro" }), tree, false)).toBe(false);
  });
});

describe("conditionTreeUsesField", () => {
  it("encontra o campo em grupos aninhados", () => {
    const tree = group("AND", [
      condition("fileName", "contains", "x"),
      group("OR", [condition("fileSize", "higherThan", "1")]),
    ]);

    expect(conditionTreeUsesField(tree, "fileSize")).toBe(true);
    expect(conditionTreeUsesField(tree, "itemCount")).toBe(false);
  });
});
