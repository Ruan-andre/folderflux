# Copilot Instructions — FolderFlux

> **A fonte de verdade é o [`AGENTS.md`](../AGENTS.md) na raiz do repositório.**
> Leia aquele arquivo antes de sugerir código. Este arquivo é só um resumo, para
> não repetir conteúdo e acabar divergindo (foi o que aconteceu antes).

## Resumo de 30 segundos

FolderFlux é um app Electron que **move, copia, renomeia e exclui arquivos e
pastas do usuário** automaticamente, a partir de regras configuráveis agrupadas
em perfis.

- **Frontend:** React 19 + TypeScript + MUI + Zustand (`src/renderer/`)
- **Backend:** Electron main + SQLite via Drizzle ORM (`src/main/`, `src/db/`)
- **Compartilhado:** `src/shared/` — todo tipo que cruza o IPC mora aqui
- **Testes:** Vitest em `tests/` (`pnpm test`)
- **Gerenciador:** PNPM

## Regras que não se negociam

1. **Nunca engula erro de filesystem.** Só `EPERM`/`EACCES`/`ENOENT` são
   ignoráveis (ver `src/main/services/system/fsErrors.ts`). Qualquer outro erro
   precisa de `throw` — o `RuleEngine` classifica falha silenciosa como sucesso e
   o usuário vê "N arquivos organizados" sem que nada tenha acontecido.
2. **Toda alteração em `ruleEngine.ts`, `rules/`, `fileService.ts` ou
   `dirService.ts` precisa de teste.** O app apaga arquivos de verdade.
3. **Textos de interface, logs e comentários em pt-BR.**
4. **Coluna nova no banco** = propagar em `getAllRules`, `getRuleById`,
   `getSystemRules`, `updateRule` **e** `duplicateRule`.
5. **Nada de `fs.*Sync`** em caminho quente do processo main — trava a UI.
6. **`any` só com `eslint-disable` e justificativa escrita.**
7. **Comentário só para o "porquê".** Nada de docblock que repete o nome da
   função nem de `@param`/`@returns` que repetem a assinatura. Comentário
   inline só quando um leitor competente perguntaria "por que assim?".
8. **Campo ou operador de regra** = mudar `src/shared/rules/fieldCatalog.ts` e
   `src/main/core/rules/conditions.ts` juntos. Se divergirem, a regra nunca casa
   e não há erro nenhum para investigar.
9. **Conventional Commits** (`feat:`, `fix:`, `chore:`) — o release-please
   depende disso para gerar versão e CHANGELOG.

## Comandos

```bash
pnpm dev                # desenvolvimento
pnpm checkall           # formatação + lint + typecheck + testes
pnpm test               # Vitest
pnpm migrate:generate   # após editar src/db/schema/
pnpm build:win | build:linux
```

## Padrão para expor backend ao frontend

`src/main/services/…` → `ipcMain.handle` em `src/main/handlers/…` →
`window.api` em `src/preload/index.ts` → tipos em `src/shared/types/`.

Handlers IPC nunca ficam soltos no `src/main/index.ts`: cada domínio tem seu
`register*Handlers()` dentro de `src/main/handlers/`.

## Onde olhar primeiro

| Preciso mexer em…              | Arquivo                                               |
| ------------------------------ | ----------------------------------------------------- |
| Como uma regra casa com o item | `src/main/core/rules/conditions.ts`                   |
| Ações de move/copy/rename/del  | `src/main/core/rules/actions.ts`                      |
| Orquestração da execução       | `src/main/core/ruleEngine.ts`                         |
| Campos/operadores disponíveis  | `src/shared/rules/fieldCatalog.ts`                    |
| Quando o motor é disparado     | `src/main/core/folderMonitorService.ts`               |
| Operações de arquivo/pasta     | `src/main/services/system/{file,dir}Service.ts`       |
| Formulário de regra            | `src/renderer/src/components/RulePopup/`              |
| Campos de condição na UI       | `src/renderer/src/components/ConditionInput/`         |
| Relatórios e logs              | `src/main/services/domain/organizationLogsService.ts` |
