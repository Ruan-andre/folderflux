import { describe, it, expect, afterEach } from "vitest";
import path from "path";
import * as fs from "fs";
import {
  getFileInfo,
  getFilesInfo,
  moveFile,
  copyFile,
  deleteFile,
  isDirectory,
  getStats,
} from "~/src/main/services/system/fileService";
import { makeTmpTree, cleanupTmpTrees, ls, exists } from "../helpers/tmpTree";

afterEach(() => cleanupTmpTrees());

describe("getFileInfo", () => {
  it("retorna metadados corretos de um arquivo", async () => {
    const root = makeTmpTree({ "relatorio.pdf": 2048 });
    const info = await getFileInfo(path.join(root, "relatorio.pdf"));

    expect(info).not.toBeNull();
    expect(info!.name).toBe("relatorio");
    expect(info!.nameWithExtension).toBe("relatorio.pdf");
    expect(info!.extension).toBe(".pdf");
    expect(info!.size).toBe(2048);
    expect(info!.parentDirectory).toBe(root);
    expect(info!.ctime).toBeInstanceOf(Date);
  });

  it("retorna null para diretório e para caminho inexistente", async () => {
    const root = makeTmpTree({ pasta: {} });
    expect(await getFileInfo(path.join(root, "pasta"))).toBeNull();
    expect(await getFileInfo(path.join(root, "nao-existe.txt"))).toBeNull();
  });
});

describe("getFilesInfo", () => {
  it("lista apenas arquivos, ignorando subpastas", async () => {
    const root = makeTmpTree({
      "a.txt": "a",
      "b.pdf": "b",
      subpasta: { "c.txt": "c" },
    });

    const files = await getFilesInfo(root);
    expect(files!.map((f) => f.nameWithExtension).sort()).toEqual(["a.txt", "b.pdf"]);
  });

  it("retorna lista vazia para pasta vazia", async () => {
    const root = makeTmpTree({});
    expect(await getFilesInfo(root)).toEqual([]);
  });

  it("retorna lista vazia (sem lançar) para diretório inexistente", async () => {
    const root = makeTmpTree({});
    await expect(getFilesInfo(path.join(root, "fantasma"))).resolves.toEqual([]);
  });
});

describe("moveFile", () => {
  it("move o arquivo criando a pasta de destino", async () => {
    const root = makeTmpTree({ "nota.txt": "conteudo" });
    const dest = path.join(root, "Documentos", "nota.txt");

    await moveFile(path.join(root, "nota.txt"), dest);

    expect(exists(dest)).toBe(true);
    expect(exists(root, "nota.txt")).toBe(false);
    expect(fs.readFileSync(dest, "utf8")).toBe("conteudo");
  });

  it("rejeita quando já existe arquivo no destino (não sobrescreve)", async () => {
    const root = makeTmpTree({ "nota.txt": "novo", Documentos: { "nota.txt": "antigo" } });

    await expect(
      moveFile(path.join(root, "nota.txt"), path.join(root, "Documentos", "nota.txt"))
    ).rejects.toBeTruthy();

    // O arquivo original continua no lugar e o destino não foi sobrescrito.
    expect(fs.readFileSync(path.join(root, "Documentos", "nota.txt"), "utf8")).toBe("antigo");
    expect(exists(root, "nota.txt")).toBe(true);
  });

  it("rejeita quando o arquivo de origem não existe", async () => {
    // Regressão: um move que falha NÃO pode resolver silenciosamente,
    // senão o RuleEngine registra a operação como sucesso no log de organização.
    const root = makeTmpTree({});
    await expect(
      moveFile(path.join(root, "fantasma.txt"), path.join(root, "Destino", "fantasma.txt"))
    ).rejects.toBeTruthy();
  });
});

describe("copyFile", () => {
  it("copia mantendo o original", async () => {
    const root = makeTmpTree({ "foto.png": "bin" });
    const dest = path.join(root, "Backup", "foto.png");

    await copyFile(path.join(root, "foto.png"), dest);

    expect(exists(root, "foto.png")).toBe(true);
    expect(fs.readFileSync(dest, "utf8")).toBe("bin");
  });

  it("rejeita quando já existe arquivo no destino", async () => {
    const root = makeTmpTree({ "foto.png": "novo", Backup: { "foto.png": "antigo" } });
    await expect(
      copyFile(path.join(root, "foto.png"), path.join(root, "Backup", "foto.png"))
    ).rejects.toBeTruthy();
    expect(fs.readFileSync(path.join(root, "Backup", "foto.png"), "utf8")).toBe("antigo");
  });

  it("rejeita quando a origem não existe (em vez de resolver com a mensagem de erro)", async () => {
    // Regressão: `return friendlyFsError(err)` fazia a Promise resolver com a
    // string de erro, que virava o "novo caminho" no log de organização.
    const root = makeTmpTree({});
    await expect(
      copyFile(path.join(root, "fantasma.png"), path.join(root, "Backup", "fantasma.png"))
    ).rejects.toBeTruthy();
  });
});

describe("deleteFile", () => {
  it("remove o arquivo", async () => {
    const root = makeTmpTree({ "lixo.tmp": "x" });
    await deleteFile(path.join(root, "lixo.tmp"));
    expect(ls(root)).toEqual([]);
  });

  it("é no-op quando o arquivo já não existe", async () => {
    const root = makeTmpTree({});
    await expect(deleteFile(path.join(root, "fantasma.tmp"))).resolves.toBeUndefined();
  });

  it("rejeita quando o alvo não é um arquivo simples", async () => {
    // Regressão: todos os erros eram engolidos, então uma exclusão que falhou
    // era contabilizada como espaço liberado no log de limpeza.
    const root = makeTmpTree({ pasta: { "a.txt": "a" } });
    await expect(deleteFile(path.join(root, "pasta"))).rejects.toBeTruthy();
    expect(exists(root, "pasta")).toBe(true);
  });
});

describe("isDirectory / getStats", () => {
  it("isDirectory distingue pasta, arquivo e caminho inexistente", async () => {
    const root = makeTmpTree({ pasta: {}, "arquivo.txt": "x" });
    expect(await isDirectory(path.join(root, "pasta"))).toBe(true);
    expect(await isDirectory(path.join(root, "arquivo.txt"))).toBe(false);
    expect(await isDirectory(path.join(root, "fantasma"))).toBe(false);
  });

  it("getStats classifica cada caminho e ignora os inexistentes", async () => {
    const root = makeTmpTree({ pasta: {}, "arquivo.txt": "x" });
    const stats = await getStats([
      path.join(root, "pasta"),
      path.join(root, "arquivo.txt"),
      path.join(root, "fantasma"),
    ]);

    expect(stats).toHaveLength(2);
    expect(stats.find((s) => s.name === "pasta")!.isDirectory).toBe(true);
    expect(stats.find((s) => s.name === "arquivo.txt")!.isDirectory).toBe(false);
  });
});
