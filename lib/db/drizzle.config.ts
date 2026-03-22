import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
