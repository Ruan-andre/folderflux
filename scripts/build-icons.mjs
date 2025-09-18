// Gera coleções mínimas do Iconify contendo apenas os ícones usados no renderer
// Procura por ocorrências "prefix:name" em src/renderer/src e filtra os JSONs das coleções em node_modules/@iconify-json
// Saída: src/renderer/src/icons/generated/<prefix>.json

import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const RENDERER_SRC = path.join(ROOT, "src", "renderer", "src");
const OUT_DIR = path.join(RENDERER_SRC, "icons", ".generated");

// Prefixos conhecidos que DEVEM ser incluídos se encontrados
// Dica: se faltar um pacote @iconify-json/<prefix>, o script ignora e avisa
const KNOWN_PREFIXES = new Set([
  "mdi",
  "noto",
  "noto-v1",
  "vscode-icons",
  "fluent-color",
  "fluent-emoji-flat",
  "logos",
  "eva",
  "line-md",
  "icon-park",
  "material-icon-theme",
  "simple-icons",
  "ic",
  "streamline-ultimate-color",
]);

// Alguns prefixos não têm pacote no npm; eles são tratados via mapeamento no componente Icon
const UNSUPPORTED_PREFIXES = new Set([
  "fluent-emoji",
  "flat-color-icons",
  "emojione-v1",
  "streamline-plump-color",
  "gala",
  "nimbus",
  "HH",
  "window",
]);

const ICON_REGEX = /["'`]([a-z0-9-]+):([a-z0-9-]+(?:-[a-z0-9-]+)*)["'`]/gi;

async function readAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? readAllFiles(res) : res;
    })
  );
  return files.flat();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

async function main() {
  const allFiles = await readAllFiles(RENDERER_SRC);
  const textFiles = allFiles.filter((p) => /\.(ts|tsx|js|jsx|json|md)$/.test(p));
  const usedByPrefix = new Map(); // prefix -> Set(names)

  for (const file of textFiles) {
    const content = await fs.readFile(file, "utf8");
    let m;
    while ((m = ICON_REGEX.exec(content))) {
      const prefix = m[1];
      const name = m[2];
      if (UNSUPPORTED_PREFIXES.has(prefix)) continue; // será tratado pelo wrapper de ícones
      if (!KNOWN_PREFIXES.has(prefix)) continue; // ignora prefixo desconhecido
      if (!usedByPrefix.has(prefix)) usedByPrefix.set(prefix, new Set());
      usedByPrefix.get(prefix).add(name);
    }
  }

  await ensureDir(OUT_DIR);

  const results = [];
  for (const [prefix, names] of usedByPrefix.entries()) {
    const pkgPath = path.join(ROOT, "node_modules", "@iconify-json", prefix, "icons.json");
    let raw;
    try {
      raw = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    } catch (e) {
      console.log(`[build-icons] Pacote não encontrado para prefixo '${prefix}': @iconify-json/${prefix}`);
      continue;
    }

    const icons = {};
    for (const name of names) {
      if (raw.icons && raw.icons[name]) {
        icons[name] = raw.icons[name];
      }
    }
    const out = {
      prefix: raw.prefix || prefix,
      icons,
      aliases: {},
      width: raw.width,
      height: raw.height,
      // manter meta mínima
    };
    const outFile = path.join(OUT_DIR, `${prefix}.json`);
    await fs.writeFile(outFile, JSON.stringify(out));
    results.push({ prefix, count: Object.keys(icons).length });
  }

  if (results.length) {
    console.log(`[build-icons] Geradas ${results.length} coleções mínimas em .generated:`);
    for (const r of results) console.log(` - ${r.prefix}: ${r.count} ícones`);
  } else {
    console.log("[build-icons] Nenhuma coleção gerada (nenhum ícone encontrado ou pacotes ausentes)");
  }
}

main().catch((err) => {
  console.error("[build-icons] Falha:", err);
  process.exit(1);
});
