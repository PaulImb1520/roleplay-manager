import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

import { characterVersions } from "./character-versions.schema"

export const characterCards = sqliteTable("character_cards", {
  id: text("id").primaryKey(),
  versionId: text("version_id")
    .notNull()
    .references(() => characterVersions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
})
