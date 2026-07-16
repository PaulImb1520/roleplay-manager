import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

import { characterVersions } from "./character-versions.schema"

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  versionId: text("version_id")
    .notNull()
    .references(() => characterVersions.id, { onDelete: "cascade" }),
  title: text("title"),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  model: text("model"),
  provider: text("provider"),
  recentMessageCount: integer("recent_message_count").default(15),
  summaryFrequency: integer("summary_frequency").default(15),
  temperature: real("temperature").default(0.7),
  maxTokens: integer("max_tokens").default(2048),
  topP: real("top_p").default(0.9),
  frequencyPenalty: real("frequency_penalty").default(0),
  presencePenalty: real("presence_penalty").default(0),
  stopSequences: text("stop_sequences", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})
