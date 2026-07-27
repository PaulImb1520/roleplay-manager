import { eq } from "drizzle-orm"

import type { HealthRepository } from "../../../../../domain/ports/health.repository"
import type { Database } from "../../../../config/database"
import { settings } from "../schema"

export class DrizzleHealthRepository implements HealthRepository {
  constructor(private readonly db: Database) {}

  async checkConnection(): Promise<"reachable" | "unreachable"> {
    try {
      const rows = await this.db
        .select()
        .from(settings)
        .where(eq(settings.key, "__healthcheck__"))
      if (rows.length >= 0) {
        return "reachable"
      }
      return "unreachable"
    } catch {
      return "unreachable"
    }
  }
}
