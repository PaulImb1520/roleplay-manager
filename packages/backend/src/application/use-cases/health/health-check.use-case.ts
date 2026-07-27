import type { HealthRepository } from "../../../domain/ports/health.repository"

export interface HealthCheckResult {
  status: "ok" | "degraded"
  uptimeSeconds: number
  database: "reachable" | "unreachable"
  timestamp: string
}

export class HealthCheckUseCase {
  private readonly startedAt = Date.now()

  constructor(
    private readonly healthRepository: HealthRepository,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    const databaseStatus = await this.healthRepository.checkConnection()

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
