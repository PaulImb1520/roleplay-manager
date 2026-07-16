import { eq, inArray } from "drizzle-orm"

import { settings } from "../schema"
import type { Database } from "../../../../config/database"
import type { SettingsRepository } from "../../../../../domain/ports/settings.repository"

export class DrizzleSettingsRepository implements SettingsRepository {
  constructor(private readonly db: Database) {}

  async get(key: string): Promise<string | null> {
    const rows = await this.db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)
    return rows[0]?.value ?? null
  }

  async getMany(keys: string[]): Promise<Record<string, string | null>> {
    if (keys.length === 0) return {}
    const rows = await this.db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, keys))
    const out: Record<string, string | null> = {}
    for (const k of keys) out[k] = null
    for (const r of rows) out[r.key] = r.value
    return out
  }

  async set(key: string, value: string): Promise<void> {
    const now = new Date()
    await this.db
      .insert(settings)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: now },
      })
  }

  async setMany(entries: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(entries).map(([k, v]) => this.set(k, v)),
    )
  }
}
