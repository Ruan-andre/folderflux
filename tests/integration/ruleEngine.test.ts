import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import path from "path";

// O RuleEngine toca o banco apenas para gravar logs e (em processAll) ler perfis.
// Mockamos só essas duas fronteiras; o filesystem é real, em tmpdir isolado.
const saveLog = vi.fn(async (_db: unknown, metadata: unknown) => metadata);
vi.mock("@/main/services/domain/organizationLogsService", () => ({
  saveLog: (db: unknown, metadata: unknown) => saveLog(db, metadata),
}));
vi.mock("@/main/services/domain/profileService", () => ({
  getAllProfiles: vi.fn(async () => ({ status: true, message: "", items: [] })),
}));

import RuleEngine from "~/src/main/core/ruleEngine";
import type { DbOrTx } from "~/src/db";
import type { LogMetadata, CleanupMetadata } from "~/src/shared/types/LogMetaDataType";
import { makeTmpTree, cleanupTmpTrees, ls, exists, setMtimeDaysAgo } from "../helpers/tmpTree";
import { makeRule, group, condition } from "../helpers/ruleFactory";

const db = {} as DbOrTx;

const logsByType = (type: LogMetadata["type"]) =>
  saveLog.mock.calls.map((c) => c[1] as LogMetadata).filter((m) => m.type === type);

beforeEach(() => saveLog.mockClear());
afterEach(() => cleanupTmpTrees());

describe("RuleEngine — regras de arquivo", () => {
  it("move arquivos que batem na condição e deixa os demais intactos", async () => {
    const root = makeTmpTree({ "a.pdf": "1", "b.pdf": "2", "c.txt": "3" });

    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(path.join(root, "PDFs"))).toEqual(["a.pdf", "b.pdf"]);
    expect(ls(root)).toEqual(["PDFs", "c.txt"]);
  });

  it("trata regra sem targetType (legado) como regra de arquivo", async () => {
    const root = makeTmpTree({ "a.pdf": "1" });
    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });
    // Simula uma linha antiga do banco, antes da coluna target_type existir.
    delete (rule as Partial<typeof rule>).targetType;

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(exists(root, "PDFs", "a.pdf")).toBe(true);
  });

  it("`fileName` compara o nome SEM a extensão", async () => {
    const root = makeTmpTree({ "backup.zip": "x", "zipado.txt": "y" });
    const rule = makeRule({
      conditions: group("AND", [condition("fileName", "contains", "zip")]),
      action: { type: "move", value: "Encontrados" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    // "backup.zip" tem name = "backup" (não casa); "zipado.txt" tem name = "zipado".
    expect(ls(path.join(root, "Encontrados"))).toEqual(["zipado.txt"]);
    expect(exists(root, "backup.zip")).toBe(true);
  });

  it("renomeia preservando a extensão", async () => {
    const root = makeTmpTree({ "antigo.txt": "x" });
    const rule = makeRule({
      conditions: group("AND", [condition("fileName", "equals", "antigo")]),
      action: { type: "rename", value: "novo" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(root)).toEqual(["novo.txt"]);
  });

  it("aplica AND e OR corretamente em grupos aninhados", async () => {
    const root = makeTmpTree({
      "relatorio.pdf": 1,
      "relatorio.txt": 1,
      "outro.pdf": 1,
    });

    // (nome começa com "relatorio") AND (extensão pdf OR extensão doc)
    const rule = makeRule({
      conditions: group("AND", [
        condition("fileName", "startsWith", "relatorio"),
        group("OR", [
          condition("fileExtension", "equals", "pdf"),
          condition("fileExtension", "equals", "doc"),
        ]),
      ]),
      action: { type: "move", value: "Selecionados" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(path.join(root, "Selecionados"))).toEqual(["relatorio.pdf"]);
  });

  it("filtra por tamanho em MB", async () => {
    const root = makeTmpTree({ "grande.bin": 3 * 1024 * 1024, "pequeno.bin": 1024 });
    const rule = makeRule({
      conditions: group("AND", [condition("fileSize", "higherThan", "2")]),
      action: { type: "move", value: "Pesados" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(path.join(root, "Pesados"))).toEqual(["grande.bin"]);
    expect(exists(root, "pequeno.bin")).toBe(true);
  });

  it("filtra por data de modificação em dias", async () => {
    const root = makeTmpTree({ "velho.log": "x", "novo.log": "y" });
    setMtimeDaysAgo(path.join(root, "velho.log"), 40);

    const rule = makeRule({
      conditions: group("AND", [condition("modifiedDate", "higherThan", "30")]),
      action: { type: "delete" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(root)).toEqual(["novo.log"]);
  });

  it("aplica a primeira regra que casar, na ordem recebida", async () => {
    const root = makeTmpTree({ "a.pdf": "1" });
    const primeira = makeRule({
      name: "primeira",
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "Primeira" },
    });
    const segunda = makeRule({
      name: "segunda",
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "Segunda" },
    });

    await RuleEngine.process({ db, rules: [primeira, segunda], folderPaths: [root] });

    expect(exists(root, "Primeira", "a.pdf")).toBe(true);
    expect(exists(root, "Segunda")).toBe(false);
  });

  it("não faz nada quando nenhum item corresponde", async () => {
    const root = makeTmpTree({ "a.txt": "1" });
    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "delete" },
    });

    const res = await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(res.items).toBe(0);
    expect(ls(root)).toEqual(["a.txt"]);
    expect(saveLog).not.toHaveBeenCalled();
  });
});

describe("RuleEngine — regras de pasta", () => {
  it("exclui apenas pastas vazias", async () => {
    const root = makeTmpTree({ vazia: {}, cheia: { "a.txt": "a" }, "solto.txt": "x" });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("isEmpty", "equals", "true")]),
      action: { type: "delete" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(root)).toEqual(["cheia", "solto.txt"]);
  });

  it("filtra pastas por quantidade de itens", async () => {
    const root = makeTmpTree({
      muitos: { a: "1", b: "2", c: "3" },
      poucos: { a: "1" },
    });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("itemCount", "higherThan", "2")]),
      action: { type: "move", value: "Grandes" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(exists(root, "Grandes", "muitos")).toBe(true);
    expect(exists(root, "poucos")).toBe(true);
  });

  it("filtra pastas por tamanho total (calculado sob demanda)", async () => {
    const root = makeTmpTree({
      pesada: { "a.bin": 3 * 1024 * 1024 },
      leve: { "b.bin": 1024 },
    });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("fileSize", "higherThan", "2")]),
      action: { type: "move", value: "Pesadas" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(exists(root, "Pesadas", "pesada")).toBe(true);
    expect(exists(root, "leve")).toBe(true);
  });

  it("regra de pasta não toca em arquivos e regra de arquivo não toca em pastas", async () => {
    const root = makeTmpTree({ "relatorio_tmp.txt": "x", pastatmp: { "dentro.txt": "y" } });

    const regraArquivo = makeRule({
      conditions: group("AND", [condition("fileName", "contains", "tmp")]),
      action: { type: "move", value: "Arquivos" },
    });
    const regraPasta = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("fileName", "contains", "tmp")]),
      action: { type: "move", value: "Pastas" },
    });

    await RuleEngine.process({ db, rules: [regraArquivo, regraPasta], folderPaths: [root] });

    expect(exists(root, "Arquivos", "relatorio_tmp.txt")).toBe(true);
    expect(exists(root, "Pastas", "pastatmp", "dentro.txt")).toBe(true);
  });

  it("contabiliza o espaço liberado ao excluir pastas", async () => {
    const root = makeTmpTree({ alvo: { "a.bin": 2 * 1024 * 1024 } });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("fileName", "equals", "alvo")]),
      action: { type: "delete" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(root)).toEqual([]);
    const cleanup = logsByType("cleanup")[0] as CleanupMetadata;
    expect(cleanup).toBeDefined();
    expect(cleanup.filesAffected).toBe(1);
    // Regressão: o tamanho da pasta só era calculado quando alguma regra usava
    // `fileSize`, então exclusões de pasta reportavam sempre "0.00 MB liberados".
    expect(cleanup.spaceFreedMB).toBeCloseTo(2, 1);
  });

  it("não reprocessa a pasta de destino criada pela própria ação", async () => {
    // Sem essa proteção, a pasta "Arquivo Morto" vira candidata na varredura
    // seguinte e o motor tenta movê-la para dentro dela mesma.
    const root = makeTmpTree({ projeto: { "a.txt": "a" }, "Arquivo Morto": { antigo: {} } });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("itemCount", "higherThan", "0")]),
      action: { type: "move", value: "Arquivo Morto" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(ls(root)).toEqual(["Arquivo Morto"]);
    expect(exists(root, "Arquivo Morto", "projeto", "a.txt")).toBe(true);
    // A própria pasta de destino continua onde estava, não aninhada em si mesma.
    expect(exists(root, "Arquivo Morto", "Arquivo Morto")).toBe(false);
  });

  it("ignora a pasta de destino mesmo quando a regra que a cria é de arquivo", async () => {
    // Regra de arquivo cria "PDFs"; uma regra de pasta genérica não pode
    // engolir essa pasta na varredura seguinte.
    const root = makeTmpTree({ PDFs: { "ja.pdf": "x" }, outra: { "b.txt": "b" } });

    const regraArquivo = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });
    const regraPasta = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("itemCount", "higherThan", "0")]),
      action: { type: "move", value: "Pastas" },
    });

    await RuleEngine.process({ db, rules: [regraArquivo, regraPasta], folderPaths: [root] });

    expect(exists(root, "PDFs", "ja.pdf")).toBe(true);
    expect(exists(root, "Pastas", "outra")).toBe(true);
    expect(exists(root, "Pastas", "PDFs")).toBe(false);
  });
});

describe("RuleEngine — processamento incremental (specificPaths)", () => {
  it("processa apenas os caminhos informados, não a pasta inteira", async () => {
    const root = makeTmpTree({ "novo.pdf": "1", "antigo.pdf": "2" });

    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });

    await RuleEngine.process({
      db,
      rules: [rule],
      folderPaths: [root],
      specificPaths: [path.join(root, "novo.pdf")],
    });

    expect(ls(path.join(root, "PDFs"))).toEqual(["novo.pdf"]);
    expect(exists(root, "antigo.pdf")).toBe(true);
  });

  it("faz varredura completa quando o caminho informado é a própria pasta monitorada", async () => {
    const root = makeTmpTree({ "a.pdf": "1", "b.pdf": "2" });

    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root], specificPaths: [root] });

    expect(ls(path.join(root, "PDFs"))).toEqual(["a.pdf", "b.pdf"]);
  });

  it("processa uma subpasta recém-criada informada em specificPaths", async () => {
    const root = makeTmpTree({ nova: {} });

    const rule = makeRule({
      targetType: "directory",
      conditions: group("AND", [condition("isEmpty", "equals", "true")]),
      action: { type: "delete" },
    });

    await RuleEngine.process({
      db,
      rules: [rule],
      folderPaths: [root],
      specificPaths: [path.join(root, "nova")],
    });

    expect(ls(root)).toEqual([]);
  });
});

describe("RuleEngine — logs", () => {
  it("registra log de organização com a contagem correta", async () => {
    const root = makeTmpTree({ "a.pdf": "1", "b.pdf": "2" });
    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root], profileName: "Perfil Teste" });

    const org = logsByType("organization")[0];
    expect(org.filesAffected).toBe(2);
    expect(org.description).toContain("Perfil Teste");
    expect(org.files).toHaveLength(2);
    expect(org.files![0].newValue).toContain("PDFs");
  });

  it("registra log de erro quando a ação falha", async () => {
    // "b.pdf" já existe no destino: o move deve falhar e virar log de erro,
    // sem contaminar o log de organização.
    const root = makeTmpTree({ "a.pdf": "1", "b.pdf": "2", PDFs: { "b.pdf": "ja-existe" } });
    const rule = makeRule({
      conditions: group("AND", [condition("fileExtension", "equals", "pdf")]),
      action: { type: "move", value: "PDFs" },
    });

    await RuleEngine.process({ db, rules: [rule], folderPaths: [root] });

    expect(logsByType("organization")[0].filesAffected).toBe(1);
    expect(logsByType("error")[0].files).toHaveLength(1);
    expect(exists(root, "b.pdf")).toBe(true);
  });
});
