# Ícones (Iconify offline)

Este projeto usa **Iconify** de forma 100% offline. Para manter o bundle enxuto e evitar consultas a CDN, geramos **coleções mínimas** contendo apenas os ícones realmente usados no código.

## Como funciona

- O script `scripts/build-icons.mjs` varre `src/renderer/src/**` em busca de strings no formato `prefix:name` (ex.: `mdi:folder`, `ic:round-check`).
- Para cada `prefix`, o script lê `node_modules/@iconify-json/<prefix>/icons.json` e extrai somente os ícones referenciados.
- Os JSONs mínimos são escritos em `src/renderer/src/icons/.generated/`.
- Em runtime, `src/renderer/src/icons/registerCollections.ts` carrega todos os JSONs de `.generated` via `import.meta.glob` e registra com `addCollection`.

## Gatilhos automáticos

- `pnpm predev` e `pnpm prebuild` executam `pnpm icons:build`, mantendo `.generated/` atualizado antes de `dev`/`build`.
- `.generated/` é **gitignored** e não deve ser commitado.

## Prefixos suportados

- KNOWN_PREFIXES (gerados automaticamente se usados no código):
  - `mdi`, `noto`, `noto-v1`, `vscode-icons`, `fluent-color`, `fluent-emoji-flat`, `logos`,
    `eva`, `line-md`, `icon-park`, `material-icon-theme`, `simple-icons`, `ic`,
    `streamline-ultimate-color`.

- UNSUPPORTED_PREFIXES (não possuem pacote `@iconify-json` oficial):
  - `fluent-emoji`, `flat-color-icons`, `emojione-v1`, `streamline-plump-color`, `gala`, `nimbus`, `HH`, `window`.
  - Estes são tratados por mapeamentos de fallback no componente `src/renderer/src/assets/icons/Icon.tsx` (ex.: `fluent-emoji:file-folder` → `mdi:folder`).

## Dicas e troubleshooting

- "Ícone não aparece":
  1. Verifique se a string `prefix:name` aparece no código (a regex precisa encontrá-la).
  2. Rode `pnpm icons:build` manualmente.
  3. Confirme se existe o pacote `@iconify-json/<prefix>` instalado.
- "Preciso de um logo específico":
  - Se houver em `@iconify-json/logos`, referencie `logos:nome`. Senão, considere usar um SVG local com `SvgIcon`.
- "Quero incluir outro prefixo":
  - Adicione o prefixo à constante `KNOWN_PREFIXES` no `scripts/build-icons.mjs` e instale `@iconify-json/<prefix>`.

## Observações

- Esta abordagem reduz memória e tamanho de bundle em comparação a registrar coleções inteiras.
- Se, no futuro, optar por remover Iconify, uma alternativa simples é usar `@mui/icons-material` (ícones de UI) e SVGs locais para logos/marcas.
