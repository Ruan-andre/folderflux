# FolderFlux

![GitHub release (latest by date)](https://img.shields.io/github/v/release/Ruan-andre/folderflux)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Ruan-andre/folderflux/.github/workflows/publish.yml)
![GitHub last commit](https://img.shields.io/github/last-commit/Ruan-andre/folderflux)

FolderFlux é um aplicativo desktop moderno para organização automática de arquivos, com regras inteligentes e perfis personalizáveis. Desenvolvido com Electron, React, TypeScript, Material-UI e banco de dados SQLite via Drizzle ORM.

## ✨ Funcionalidades

- Organização automática de arquivos por regras inteligentes
- Perfis customizáveis para diferentes cenários de organização
- Interface intuitiva e responsiva (Material-UI)
- Suporte a múltiplos tipos de arquivos e pastas
- Onboarding interativo com Shepherd.js (tour guiado)
- Notificações e diálogos globais
- Totalmente em português brasileiro (pt-BR)

## 📥 Instalação

Você pode baixar a versão mais recente para Windows ou Linux diretamente da nossa [**página oficial**](https://folderflux.com), ou na página de [**release**](https://github.com/Ruan-andre/folderflux/releases).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Material-UI (MUI), Vite
- **Backend:** Electron (Node.js), SQLite, Drizzle ORM
- **Gerenciador de pacotes:** PNPM
- **State Management:** Zustand
- **Onboarding:** Shepherd.js

## 📁 Estrutura do Projeto

- `src/main/` – Processo principal do Electron (serviços, handlers, lógica principal)
- `src/renderer/` – Aplicação React (componentes, hooks, views, stores)
- `src/db/` – Configuração do banco de dados (schema, migrations, seeds)
- `src/shared/` – Tipos e funções utilitárias compartilhadas
- `resources/` – Binários e modelos estáticos (ex: TTS Piper)
- `public/` – Assets estáticos para o frontend

## 🚀 Como rodar o projeto

### 1. Instale as dependências

```bash
pnpm install
```

### 2. Ambiente de desenvolvimento

```bash
pnpm dev
```

### 3. Gerar migrações do banco de dados

```bash
pnpm migrate:generate
```

### 4. Build para produção

```bash
# Windows
pnpm build:win

# Linux
pnpm build:linux
```

## 🏗️ Convenções

- **TypeScript estrito:** Utilize tipos compartilhados em `src/shared/types/` para payloads IPC.
- **Textos em pt-BR:** Toda interface e mensagens são em português brasileiro.
- **IDs de componentes:** Usados para tours guiados (Shepherd.js).
- **Estilo:** Siga os padrões do Material-UI.

## 🖼️ Ícones (offline)

- Usamos **Iconify** em modo offline, gerando coleções mínimas automaticamente em `src/renderer/src/icons/.generated/` via `pnpm icons:build`.
- Esse script roda automaticamente em `predev` e `prebuild` (ver `package.json`).
- A pasta `.generated/` é ignorada pelo Git (gitignored) e não deve ser commitada.
- O registrador `src/renderer/src/icons/registerCollections.ts` carrega todos os JSONs gerados com `import.meta.glob` e registra via `addCollection`.
- Para detalhes operacionais (regex, coleções suportadas, troubleshooting), veja `src/renderer/src/icons/README.md`.

## 👩‍💻 Contribuindo

1. Crie uma branch a partir da `main`
2. Siga os padrões de código e arquitetura existentes
3. Faça commits claros e objetivos
4. Abra um Pull Request detalhado

## 📦 Publicação de nova versão

1. Atualize a versão no `package.json`
2. Crie e envie uma tag anotada:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push && git push --tags
   ```
3. O CI/CD do GitHub Actions cuidará do resto!

---

Desenvolvido com ❤️ por Ruan André.

---
