import { defineConfig } from "drizzle-kit"

const databasePath = process.env.DATABASE_PATH ?? "./data/roleplay.db"

export default defineConfig({
  schema: "./src/infrastructure/adapters/secondary/drizzle/schema/index.ts",
  out: "./src/infrastructure/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databasePath,
  },
  verbose: true,
  strict: true,
})
