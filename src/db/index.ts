import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import fs from "fs";
import * as schema from "../db/schema";

const dbPath =
  process.platform === "darwin"
    ? path.join(app.getPath("appData"), "tidyflux.db")
    : path.join(app.getPath("userData"), "tidyflux.db");

const sqlite = new Database(dbPath);
export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

export type DbInstance = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbOrTx = DbInstance | Transaction;

export async function runMigrations() {
  const migrationsDir = path.join(__dirname, "db/migrations");

  try {
    // Se existirem migrations, aplica elas
    if (fs.existsSync(migrationsDir)) {
      await migrate(db, {
        migrationsFolder: migrationsDir,
        migrationsTable: "drizzle_migrations",
      });
      console.log("Migrations aplicadas com sucesso");
    }
  } catch (error) {
    console.error("Falha crítica nas migrations:", error);
    throw error;
  }
}
