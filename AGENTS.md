# AGENTS.md — FolderFlux

Instruções para agentes de IA (Claude Code, Codex, Cursor, Copilot) e para quem
está entrando no projeto agora. **Leia antes de escrever código.**

---

## 1. O que é o FolderFlux

Aplicativo desktop (Windows/Linux) que organiza arquivos e pastas
automaticamente, com base em regras definidas pelo usuário.

O usuário monta **regras** (condições + uma ação), agrupa regras e pastas em
**perfis**, e o app monitora essas pastas em tempo real. Quando algo aparece na
pasta, o motor avalia as regras e executa a ação: mover, copiar, renomear ou
excluir.

> **Isto é um app que apaga e move arquivos do usuário.** Um bug aqui não gera
> uma tela feia: gera perda de dados. Toda mudança em `ruleEngine`, `fileService`
> ou `dirService` exige teste automatizado. Não há exceção para "mudança pequena".

---

## 2. Stack

| Camada        | Tecnologia                                          |
| ------------- | --------------------------------------------------- |
| Shell         | Electron 35 (`electron-vite`)                       |
| Frontend      | React 19 + TypeScript + Material-UI (MUI) + Zustand |
| Backend       | Node.js no processo main                            |
| Banco         | SQLite (`better-sqlite3`) via Drizzle ORM           |
| Monitoramento | `chokidar`                                          |
| Testes        | Vitest                                              |
| Onboarding    | Shepherd.js                                         |
| Pacotes       | **PNPM** (não use npm/yarn)                         |
| Release       | release-please + electron-builder (GitHub Actions)  |

---

## 3. Estrutura

```
src/
  main/                      Processo principal do Electron
    core/
      folderMonitorService   Watcher chokidar + debounce + despacho por perfil
      ruleEngine             Orquestra a execução: varre, casa, executa, loga
      rules/conditions       Avaliação de condições (puro, sem I/O)
      rules/actions          Handlers de move/copy/rename/delete
      rules/runLogs          Acumula o resultado da execução e persiste
      organizationService    Organização sob demanda (menu, atalho, tour)
    services/
      domain/                Acesso ao banco (rule, profile, folder, settings, logs)
      system/                Filesystem (fileService, dirService, fsErrors)
      tts/                   Piper TTS (narração do tour)
    handlers/                Registro dos canais IPC (ipcMain.handle)
    workers/                 Tarefas pesadas fora da thread principal
  preload/index.ts           Ponte contextIsolation -> window.api
  renderer/src/              App React (views, components, hooks, store)
  db/                        schema Drizzle, migrations, seeds
  shared/                    Tipos e funções usados por main E renderer
    rules/fieldCatalog       Campos e operadores válidos — fonte única
tests/
  unit/                      Lógica pura
  integration/               Filesystem real em tmpdir
  helpers/                   Fábricas e utilidades de teste
```

**Regra de ouro da estrutura:** se um tipo cruza a fronteira IPC, ele mora em
`src/shared/types/`. Nunca duplique o tipo dos dois lados.

---

## 4. O fluxo principal (leia isto antes de mexer no motor)

```
chokidar (add / addDir)
   └─> FolderMonitorService.handleFileEvent / handleDirEvent
         └─> process("files" | "folders")      debounce de 2s, filas SEPARADAS
               └─> handleFiles / handleFolders  resolve quais perfis cobrem o caminho
                     └─> RuleEngine.process({ db, rules, folderPaths, specificPaths })
                           ├─ findMatchingItems()   varre ou usa specificPaths
                           ├─ matchFiles / matchDirs -> rules/conditions
                           ├─ executeAction()        -> rules/actions
                           ├─ recordResults()        classifica sucesso/erro
                           └─ RunLogs.persist()      grava e emite "log-added"
                                 └─> mainProcessEmitter -> IPC -> logStore (renderer)
```

Pontos que já causaram bug e precisam continuar valendo:

- **Filas de arquivo e de pasta têm timers de debounce independentes.** Um timer
  compartilhado fazia um evento de pasta cancelar o lote de arquivos pendente.
- **`specificPaths` é processamento incremental.** Quando informado, só aqueles
  caminhos são avaliados — exceto se o caminho for uma das `folderPaths`, o que
  dispara varredura completa daquela pasta.
- **`matchDirs` ignora as pastas de destino das próprias regras**
  (`reservedFolderNames`). Sem isso o motor move a pasta de saída para dentro
  dela mesma na varredura seguinte.
- **O tamanho de pasta é caro** (`getDirSize` é recursivo). Só é calculado quando
  alguma regra usa `fileSize` ou quando a pasta vai ser excluída (para o log de
  limpeza reportar o espaço liberado corretamente).
- `targetType` é lido como `r.targetType ?? "file"` para tolerar regras gravadas
  antes da coluna existir.

---

## 5. Tratamento de erro no filesystem — inegociável

`src/main/services/system/fsErrors.ts` classifica os erros. A política é:

| Situação                                    | O que fazer                   |
| ------------------------------------------- | ----------------------------- |
| `EPERM` / `EACCES` (item protegido pelo SO) | Ignorar em silêncio, seguir   |
| `ENOENT` / `ENOTDIR` durante varredura      | Ignorar, o item sumiu no meio |
| **Qualquer outro erro**                     | **Propagar (`throw`)**        |

Motivo: o `RuleEngine` usa `Promise.allSettled` e classifica o resultado. Uma
operação que **falha em silêncio vira sucesso no log** — o usuário vê "3 arquivos
movidos" ou "12 MB liberados" quando nada aconteceu.

Nunca escreva `catch { }` vazio, nem `return mensagemDeErro` em vez de `throw`,
nem `.catch(() => {})` numa operação de escrita.

---

---

## 6. Campos e operadores: uma fonte só

`src/shared/rules/fieldCatalog.ts` define quais campos existem e quais
operadores cada um aceita. O renderer monta os selects a partir dele e o
`RuleEngine` implementa exatamente esses pares.

Quando os dois divergem — a UI oferece um operador que o motor não implementa —
`evaluateCondition` não encontra o avaliador e devolve `false`. **A regra
simplesmente nunca casa: sem erro, sem log, sem sintoma.** Foi assim que
`fileExtension + notEquals` e `fileSize + equals` ficaram quebrados sem ninguém
perceber.

Ao mexer em campos ou operadores: altere o catálogo **e** `rules/conditions.ts`
na mesma mudança. O teste `tests/unit/conditions.test.ts` falha se um par do
catálogo não tiver avaliador.

Nunca mude a semântica de um operador já em uso sem migração: as regras estão
gravadas no banco do usuário. Um `fileSize` que passe de MB para KB reinterpreta
silenciosamente todas as regras existentes por um fator de 1024.

---

## 7. Comandos

```bash
pnpm install            # instala (roda electron-builder install-app-deps)
pnpm dev                # desenvolvimento com hot reload
pnpm checkall           # formatação + lint + typecheck + testes (rode antes do PR)
pnpm test               # Vitest, uma passada
pnpm test:watch         # Vitest em watch
pnpm test:coverage      # cobertura (v8)
pnpm lint               # ESLint
pnpm typecheck          # tsc --noEmit
pnpm format             # Prettier (config em .prettierrc, printWidth 110)
pnpm format:check       # Prettier sem escrever (usado no checkall e no CI)
pnpm migrate:generate   # gera migration a partir do schema
pnpm build:win          # build de produção Windows
pnpm build:linux        # build de produção Linux
```

Antes de abrir PR: `pnpm checkall`. O CI roda exatamente as mesmas checagens e
bloqueia tanto a geração de versão quanto a publicação do instalador se falhar.

---

## 8. Como fazer as coisas

### Adicionar uma função de backend acessível ao frontend

1. Função no service correspondente (`src/main/services/domain/` ou `system/`).
2. Canal IPC em `src/main/handlers/` (`ipcMain.handle`).
3. Expor no `src/preload/index.ts` (`window.api`).
4. Tipos do payload em `src/shared/types/`.

### Alterar o banco

1. Editar o schema em `src/db/schema/`.
2. `pnpm migrate:generate`.
3. **Revisar o SQL gerado antes de commitar.** O drizzle-kit reconstrói a tabela
   inteira (create/copy/drop/rename) para várias alterações. No SQLite,
   `text(N)` **não** impõe limite de tamanho — mudar `text(150)` para `text(200)`
   gera uma reconstrução de tabela que não muda absolutamente nada em runtime.
   O limite real vem do `maxLength` do input no renderer.
4. Se a coluna for nova e usada pelo `RuleEngine`, trate o valor legado com
   `?? valorPadrao`.
5. Propagar a coluna nova em **todos** os caminhos de `ruleService`:
   `getAllRules`, `getRuleById`, `getSystemRules`, `updateRule` e
   `duplicateRule`. Esquecer o `updateRule` já causou um bug em que a edição
   salvava em silêncio o valor errado.

### Adicionar um campo de condição de regra

1. `src/shared/types/Field.ts`
2. `src/db/schema/conditionsTree.ts` (enum da coluna) + migration
3. `RuleEngine.conditionEvaluators` + `getFileValue` / `getDirValue`
4. `ConditionInput` (`fileFieldConfig` ou `dirFieldConfig`) no renderer
5. Teste em `tests/integration/ruleEngine.test.ts`

### Adicionar passo no tour

`src/renderer/src/config/tourSteps.ts` + ajustar `store/tourStore.ts`. Os alvos
são `id` estáticos nos componentes — não remova um `id` sem checar o tour.

---

## 9. Testes

- Ficam em `tests/`, **nunca dentro de `src/`**: o `electron.vite.config.ts` copia
  `src/db/**` e `src/shared/**` para o build, e arquivos de teste iriam junto.
- `tests/unit/` — lógica pura, sem I/O.
- `tests/integration/` — filesystem real. Use `makeTmpTree()` de
  `tests/helpers/tmpTree.ts` e `cleanupTmpTrees()` no `afterEach`. Nunca escreva
  fora de `os.tmpdir()`.
- `tests/helpers/ruleFactory.ts` monta `FullRule` com `makeRule`, `group`,
  `condition`.
- Nos testes do `RuleEngine`, só o banco é mockado (`saveLog`, `getAllProfiles`).
  O filesystem é real de propósito: é onde os bugs aparecem.
- Todo bug corrigido ganha um teste de regressão com um comentário curto
  explicando o comportamento antigo.

---

## 10. Comentários e docblocks

**O código explica o "o quê". Comentário só existe para o "porquê".**

Não escreva:

```ts
/** Retorna o tamanho do diretório. */          // o nome já diz
export function getDirSize(...)

// incrementa o contador
count++;

/**
 * @param dirPath O caminho do diretório
 * @returns O tamanho
 */
```

Escreva quando — e só quando — a informação não está no código:

```ts
// lstat não segue links: um symlink conta como link, não como o alvo.

// O tamanho precisa ser medido ANTES da exclusão, senão o log de limpeza
// reporta sempre "0.00 MB liberados" para pastas.
```

Critérios:

- **Docblock:** só quando a função tem um contrato não óbvio (o que o retorno
  significa, um efeito colateral, uma invariante que o chamador precisa manter).
  Uma linha basta. Nada de `@param`/`@returns` repetindo a assinatura.
- **Comentário inline:** só quando um leitor competente perguntaria "por que
  assim?" — decisão contraintuitiva, workaround de plataforma, bug que a linha
  previne. Se o comentário descreve o que a linha faz, apague o comentário.
- **Comentário que vira mentira é pior que comentário nenhum.** Ao mudar a
  linha, mude ou apague o comentário junto.
- Se um trecho precisa de comentário para ser entendido, primeiro tente
  renomear a variável ou extrair uma função. Comentário é a última opção.

## 11. Convenções

- **Todo texto de interface e de log é em pt-BR.** Comentários também.
- TypeScript estrito. `any` só com `eslint-disable` **e** um comentário
  explicando por quê (hoje existe um caso legítimo: `toggleColumnStatus`, que é
  genérico sobre tabelas do Drizzle).
- Erros de filesystem viram mensagem amigável via `friendlyFsError`.
- Prettier com `printWidth: 110` — rode `pnpm format` antes do commit.
- Commits em **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`):
  o release-please gera CHANGELOG e versão a partir deles. Um commit fora do
  padrão não aparece no changelog.
- Ícones vêm do Iconify em modo offline; `src/renderer/src/icons/.generated/` é
  gerado por `pnpm icons:build` e **não** é commitado.

---

## 12. O que NÃO fazer

- Não engolir erro de filesystem (ver seção 5).
- Não escrever comentário/docblock óbvio (ver seção 10).
- Não mudar a semântica de um operador de regra já em uso (ver seção 6).
- Não reintroduzir limite de profundidade em `getDirSize`: um limite devolve um
  número errado em silêncio. A proteção contra árvore infinita é a identidade
  `dev:ino`, não a altura.
- Não chamar `fs.*Sync` no processo main em caminho quente: trava a UI inteira.
  Use `fs.promises`.
- Não criar tipo duplicado entre main e renderer — use `src/shared/types/`.
- Não usar `npm` ou `yarn`; o projeto é PNPM e o lockfile é `pnpm-lock.yaml`.
- Não commitar `out/`, `release/` nem `.generated/`.
- Não editar arquivos em `src/db/migrations/` já aplicados. Gere uma nova.
- Não subir a versão no `package.json` na mão: quem faz isso é o release-please.
- Não escrever teste que toque em pasta real do usuário. Só `os.tmpdir()`.
- Não adicionar dependência de build em `dependencies` — ela vai parar dentro do
  instalador. Ferramentas de build vão em `devDependencies`.
