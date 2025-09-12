import type { Config } from "drizzle-kit";
import path from "path";

export default {
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: path.resolve(__dirname, "./src/db/database.db"),
  },
  verbose: true,
  strict: true,
} satisfies Config;
