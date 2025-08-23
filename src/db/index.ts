import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import fs from "fs";
import * as schema from "./schema"; // caminho ajustado
import { fileURLToPath } from "url";

// Resolve __dirname no ESM (Electron usa ESM no renderer)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o banco (AppData/UserData no Electron)
const dbPath =
  process.platform === "darwin"
    ? path.join(app.getPath("appData"), "FolderFlux.db")
    : path.join(app.getPath("userData"), "FolderFlux.db");

// Garante que a pasta existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Cria conexão SQLite
const sqlite = new Database(dbPath);

// Instância do Drizzle
export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

export type DbInstance = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbOrTx = DbInstance | Transaction;

/**
 * Executa migrations pendentes
 */
export function runMigrations() {
  // Caminho absoluto da pasta de migrations
  const migrationsDir = path.join(__dirname, "/db/migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("Nenhuma pasta de migrations encontrada:", migrationsDir);
    return;
  }

  try {
    migrate(db, {
      migrationsFolder: migrationsDir,
      migrationsTable: "drizzle_migrations", // tabela de controle
    });
    console.log("Migrations aplicadas com sucesso");
  } catch (error) {
    console.error("Falha ao aplicar migrations:", error);
    throw error;
  }
}
