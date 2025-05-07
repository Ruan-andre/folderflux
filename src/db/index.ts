import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import fs from "fs";

const dbPath =
  process.platform === "darwin"
    ? path.join(app.getPath("appData"), "tidyflux.db")
    : path.join(app.getPath("userData"), "tidyflux.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite);

interface SqliteTable {
  name: string;
  type: "table" | "index" | "view";
  tbl_name?: string;
  sql?: string;
}

export async function runMigrations() {
  const migrationsDir = path.join(__dirname, "db/migrations");

  debugger;

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
