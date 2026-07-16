import { eq } from "drizzle-orm"

import type { Database } from "../../../infrastructure/config/database"
import { settings } from "../../../infrastructure/adapters/secondary/drizzle/schema"
import type { Logger } from "../../../domain/ports/logger.port"

export interface HealthCheckResult {
  status: "ok" | "degraded"
  uptimeSeconds: number
  database: "reachable" | "unreachable"
  timestamp: string
}

export class HealthCheckUseCase {
  private readonly startedAt = Date.now()

  constructor(
    private readonly db: Database,
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    let databaseStatus: "reachable" | "unreachable" = "unreachable"
    try {
      // Query trivial: contar filas de `settings`. Si falla, la DB está
      // caída o el esquema no está migrado.
      const rows = await this.db.select().from(settings).where(eq(settings.key, "__healthcheck__"))
      if (rows.length >= 0) {
        databaseStatus = "reachable"
      }
    } catch (error) {
      this.logger.warn("Health check failed to reach database", {
        error: (error as Error).message,
      })
    }

    const status: "ok" | "degraded" =
      databaseStatus === "reachable" ? "ok" : "degraded"

    return {
      status,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    }
  }
}
