import { defineConfig } from "vitest/config";
import { resolve } from "path";

const rootDir = __dirname;
const srcDir = resolve(rootDir, "src");

export default defineConfig({
  resolve: {
    // Espelha os aliases do tsconfig.json ("~/*" -> "./*", "@*" -> "./src/*").
    // A ordem importa: "@db/" e "@renderer/" antes de "@/", e nenhum deles pode
    // capturar pacotes com escopo (ex: "@electron-toolkit/utils").
    alias: [
      { find: /^~\//, replacement: `${rootDir}/` },
      { find: /^@db\//, replacement: `${srcDir}/db/` },
      { find: /^@renderer\//, replacement: `${srcDir}/renderer/src/` },
      { find: /^@\//, replacement: `${srcDir}/` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Os testes de integração criam árvores reais em os.tmpdir().
    // Cada teste usa seu próprio diretório, então rodar em paralelo é seguro.
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["src/main/**/*.ts", "src/shared/**/*.ts", "src/renderer/src/functions/**/*.ts"],
      // Entrypoints do Electron e bootstrap do banco não são testáveis sem
      // subir o app inteiro; ficam cobertos pelos testes manuais.
      exclude: ["src/main/index.ts", "src/db/index.ts", "**/*.d.ts"],
    },
  },
});
