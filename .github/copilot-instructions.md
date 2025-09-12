# Copilot Instructions for FolderFlux

## Project Overview

- **FolderFlux** is an Electron desktop app for automatic file organization using smart rules and customizable profiles.
- **Frontend:** React 19 + TypeScript + Material-UI (MUI), built with Vite.
- **Backend:** Electron (Node.js) with SQLite, managed by the Drizzle ORM.
- **Package Manager:** PNPM.

## Key Directories & Files

- `src/main/`: Electron main process (backend services, IPC handlers, core logic).
- `src/renderer/`: React frontend application (UI components, hooks, stores, views).
- `src/db/`: Database configuration (schema, migrations, seeds).
- `src/shared/`: Shared TypeScript types and utility functions between main and renderer.
- `resources/`: Static binary assets like the `piper` TTS engine and models.
- `public/`: Static assets for the renderer process.
- `electron-builder.yml`: Configuration for packaging the final application.
- `drizzle.config.ts`: Configuration for the Drizzle ORM.

## Architecture & Patterns

- **State Management:** Uses **Zustand** for global state (`src/renderer/src/store/`).
- **IPC Communication:** The renderer communicates with the main process via a preload bridge exposed as `window.api`.
- **Database:** **Drizzle ORM** manages the SQLite database schema and queries.
- **UI:** Built entirely with **Material-UI (MUI)** components and theming.
- **Onboarding:** User tours are handled by **Shepherd.js**, with steps defined in `src/renderer/src/config/tourSteps.ts` and state managed by `tourStore.ts`.
- **Dialogs & Notifications:** Global dialogs (Confirm) and notifications (Snackbar) are managed via React Context.

## Developer Workflow

- **Install Dependencies:**

```bash
pnpm install
```

- **Start Development Mode:** (Hot-reload for renderer and main process)

```bash
pnpm dev
```

- **Generate Database Migrations:**

```bash
pnpm migrate:generate
```

- **Build for Production:**

```bash
# For Windows
pnpm build:win

# For Linux
pnpm build:linux
```

- **Publish a New Release:** (Triggers GitHub Actions CI/CD)
  - Update version in `package.json`.
  - Create and push an annotated git tag (e.g., `git tag -a v1.0.1` and `git push --tags`).

## Project Conventions

- **TypeScript Everywhere:** Strict typing is enforced. Use shared types from `src/shared/types/` for IPC payloads.
- **Brazilian Portuguese:** All user-facing text is in pt-BR.
- **Component IDs:** Many components have static `id` attributes, which are used as targets for the Shepherd.js tour.
- **Styling:** Follows MUI conventions, with custom styled components when necessary.

## Examples

- **To add a new onboarding step:** Edit `src/renderer/src/config/tourSteps.ts` and update the logic in `store/tourStore.ts` if needed.
- **To add a new backend function:**
  1. Add the function in a service file in `src/main/services/`.
  2. Create an IPC handler for it in `src/main/handlers/`.
  3. Expose it to the frontend via the preload script (`src/preload/index.ts`).
- **To add a new DB migration:**
  1. Modify the schema in `src/db/schema/`.
  2. Run `pnpm migrate:generate`.

---

_`For questions, refer to the codebase for existing patterns before creating new ones. The architecture is consistent.`_
