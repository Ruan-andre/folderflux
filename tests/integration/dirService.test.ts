import { describe, it, expect, afterEach } from "vitest";
import path from "path";
import * as fs from "fs";
import {
  getSingleDirInfo,
  getDirsInfo,
  getDirSize,
  populateDirSizes,
  deleteDir,
  moveDir,
  copyDir,
} from "~/src/main/services/system/dirService";
import { makeTmpTree, cleanupTmpTrees, ls, exists } from "../helpers/tmpTree";

afterEach(() => cleanupTmpTrees());

describe("getSingleDirInfo", () => {
  it("retorna contagem de itens e flag de vazio", async () => {
    const root = makeTmpTree({
      cheia: { "a.txt": "a", "b.txt": "b", sub: {} },
      vazia: {},
    });

    const cheia = await getSingleDirInfo(path.join(root, "cheia"));
    expect(cheia!.name).toBe("cheia");
    expect(cheia!.parentDirectory).toBe(root);
    expect(cheia!.itemCount).toBe(3);
    expect(cheia!.isEmpty).toBe(false);
    // `size` é preenchido sob demanda por populateDirSizes.
    expect(cheia!.size).toBe(0);

    const vazia = await getSingleDirInfo(path.join(root, "vazia"));
    expect(vazia!.itemCount).toBe(0);
    expect(vazia!.isEmpty).toBe(true);
  });

  it("retorna null para arquivo e para caminho inexistente", async () => {
    const root = makeTmpTree({ "a.txt": "a" });
    expect(await getSingleDirInfo(path.join(root, "a.txt"))).toBeNull();
    expect(await getSingleDirInfo(path.join(root, "fantasma"))).toBeNull();
  });
});

describe("getDirsInfo", () => {
  it("lista apenas subpastas diretas, ignorando arquivos e netos", async () => {
    const root = makeTmpTree({
      "solto.txt": "x",
      fotos: { "1.jpg": "a", neta: {} },
      docs: {},
    });

    const dirs = await getDirsInfo(root);
    expect(dirs.map((d) => d.name).sort()).toEqual(["docs", "fotos"]);
    expect(dirs.find((d) => d.name === "fotos")!.itemCount).toBe(2);
    expect(dirs.find((d) => d.name === "docs")!.isEmpty).toBe(true);
  });

  it("retorna lista vazia (sem lançar) para caminho inexistente", async () => {
    const root = makeTmpTree({});
    await expect(getDirsInfo(path.join(root, "fantasma"))).resolves.toEqual([]);
  });
});

describe("getDirSize / populateDirSizes", () => {
  it("soma recursivamente o tamanho dos arquivos", async () => {
    const root = makeTmpTree({ alvo: { "a.bin": 1000, sub: { "b.bin": 500 } } });
    expect(await getDirSize(path.join(root, "alvo"))).toBe(1500);
  });

  it("percorre a árvore inteira, sem limite de profundidade", async () => {
    // Antes havia um MAX_SIZE_DEPTH = 10: uma árvore mais profunda devolvia um
    // total menor que o real, sem nenhum aviso.
    const root = makeTmpTree({});
    let cursor = path.join(root, "alvo");
    fs.mkdirSync(cursor);
    for (let level = 0; level < 25; level++) {
      cursor = path.join(cursor, `n${level}`);
      fs.mkdirSync(cursor);
      fs.writeFileSync(path.join(cursor, "f.bin"), Buffer.alloc(100));
    }

    expect(await getDirSize(path.join(root, "alvo"))).toBe(25 * 100);
  });

  it("não conta o mesmo arquivo duas vezes quando há hardlink", async () => {
    const root = makeTmpTree({ alvo: { "original.bin": 1000 } });
    fs.linkSync(path.join(root, "alvo", "original.bin"), path.join(root, "alvo", "copia.bin"));

    // Duas entradas de diretório, um único bloco de dados em disco.
    expect(await getDirSize(path.join(root, "alvo"))).toBe(1000);
  });

  it("não entra em laço infinito com link simbólico circular", async () => {
    const root = makeTmpTree({ alvo: { "a.bin": 500, sub: {} } });
    fs.symlinkSync(path.join(root, "alvo"), path.join(root, "alvo", "sub", "loop"), "dir");

    expect(await getDirSize(path.join(root, "alvo"))).toBe(500);
  });

  it("populateDirSizes preenche o campo size in-place", async () => {
    const root = makeTmpTree({ a: { "x.bin": 100 }, b: { "y.bin": 250 } });
    const dirs = await getDirsInfo(root);
    expect(dirs.every((d) => d.size === 0)).toBe(true);

    await populateDirSizes(dirs);

    expect(dirs.find((d) => d.name === "a")!.size).toBe(100);
    expect(dirs.find((d) => d.name === "b")!.size).toBe(250);
  });
});

describe("moveDir", () => {
  it("move a pasta com todo o conteúdo, criando o destino", async () => {
    const root = makeTmpTree({ origem: { "a.txt": "a", sub: { "b.txt": "b" } } });
    const dest = path.join(root, "Arquivo Morto", "origem");

    await moveDir(path.join(root, "origem"), dest);

    expect(exists(root, "origem")).toBe(false);
    expect(fs.readFileSync(path.join(dest, "sub", "b.txt"), "utf8")).toBe("b");
  });

  it("rejeita quando já existe pasta no destino", async () => {
    const root = makeTmpTree({ origem: { "a.txt": "a" }, Destino: { origem: { "velho.txt": "v" } } });

    await expect(
      moveDir(path.join(root, "origem"), path.join(root, "Destino", "origem"))
    ).rejects.toBeTruthy();

    expect(ls(path.join(root, "Destino", "origem"))).toEqual(["velho.txt"]);
    expect(exists(root, "origem")).toBe(true);
  });

  it("rejeita quando a origem não existe", async () => {
    const root = makeTmpTree({});
    await expect(
      moveDir(path.join(root, "fantasma"), path.join(root, "Destino", "fantasma"))
    ).rejects.toBeTruthy();
  });
});

describe("copyDir", () => {
  it("copia recursivamente mantendo a origem", async () => {
    const root = makeTmpTree({ origem: { sub: { "b.txt": "b" } } });
    const dest = path.join(root, "Backup", "origem");

    await copyDir(path.join(root, "origem"), dest);

    expect(exists(root, "origem", "sub", "b.txt")).toBe(true);
    expect(fs.readFileSync(path.join(dest, "sub", "b.txt"), "utf8")).toBe("b");
  });

  it("rejeita quando já existe pasta no destino", async () => {
    const root = makeTmpTree({ origem: {}, Backup: { origem: {} } });
    await expect(
      copyDir(path.join(root, "origem"), path.join(root, "Backup", "origem"))
    ).rejects.toBeTruthy();
  });
});

describe("deleteDir", () => {
  it("remove a pasta e todo o conteúdo", async () => {
    const root = makeTmpTree({ alvo: { "a.txt": "a", sub: { "b.txt": "b" } } });
    await deleteDir(path.join(root, "alvo"));
    expect(ls(root)).toEqual([]);
  });

  it("é no-op quando a pasta já não existe", async () => {
    const root = makeTmpTree({});
    await expect(deleteDir(path.join(root, "fantasma"))).resolves.toBeUndefined();
  });
});

describe("limpeza de pasta de destino em falha", () => {
  it("não deixa pasta de destino órfã quando o move falha", async () => {
    const root = makeTmpTree({});

    await expect(
      moveDir(path.join(root, "inexistente"), path.join(root, "Novo Destino", "inexistente"))
    ).rejects.toBeTruthy();

    // A pasta criada só para receber a operação é removida quando ela falha.
    expect(exists(root, "Novo Destino")).toBe(false);
  });

  it("preserva pasta de destino que já existia antes da falha", async () => {
    const root = makeTmpTree({ "Destino Antigo": {} });

    await expect(
      moveDir(path.join(root, "inexistente"), path.join(root, "Destino Antigo", "inexistente"))
    ).rejects.toBeTruthy();

    expect(exists(root, "Destino Antigo")).toBe(true);
  });
});
