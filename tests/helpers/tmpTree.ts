import * as fs from "fs";
import * as os from "os";
import path from "path";

/**
 * Descrição declarativa de uma árvore de arquivos/pastas.
 * - string  -> arquivo com aquele conteúdo
 * - number  -> arquivo com N bytes de conteúdo
 * - objeto  -> diretório (recursivo); objeto vazio = pasta vazia
 */
export type TreeSpec = { [name: string]: string | number | TreeSpec };

const createdRoots: string[] = [];

/** Cria a árvore em disco num tmpdir isolado. Exige `cleanupTmpTrees()` no afterEach. */
export function makeTmpTree(spec: TreeSpec = {}, prefix = "folderflux-test-"): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  createdRoots.push(root);
  writeTree(root, spec);
  return root;
}

export function writeTree(dir: string, spec: TreeSpec): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, value] of Object.entries(spec)) {
    const target = path.join(dir, name);
    if (typeof value === "string") {
      fs.writeFileSync(target, value);
    } else if (typeof value === "number") {
      fs.writeFileSync(target, Buffer.alloc(value, 0x61));
    } else {
      writeTree(target, value);
    }
  }
}

export function cleanupTmpTrees(): void {
  while (createdRoots.length > 0) {
    const root = createdRoots.pop()!;
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** Ordenado, para asserts estáveis. */
export function ls(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort();
}

export function exists(...segments: string[]): boolean {
  return fs.existsSync(path.join(...segments));
}

/** Só mtime/atime são ajustáveis; ctime é definido pelo sistema. */
export function setMtimeDaysAgo(target: string, days: number): void {
  const when = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  fs.utimesSync(target, when, when);
}
