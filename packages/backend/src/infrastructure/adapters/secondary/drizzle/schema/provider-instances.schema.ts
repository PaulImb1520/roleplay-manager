import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

export const providerInstances = sqliteTable(
  "provider_instances",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["ollama", "openai-compatible"] })
      .notNull(),
    name: text("name").notNull(),
    url: text("url").notNull().default(""),
    apiKey: text("api_key"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    kindNameUnique: unique("provider_instances_kind_name_unique").on(
      table.kind,
      table.name,
    ),
  }),
)
