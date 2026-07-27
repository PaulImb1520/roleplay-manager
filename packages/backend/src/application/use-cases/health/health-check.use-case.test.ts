import { describe, it, expect } from "vitest"

import { HealthCheckUseCase } from "./health-check.use-case"
import type { HealthRepository } from "../../../domain/ports/health.repository"

describe("HealthCheckUseCase", () => {
  it("devuelve ok cuando la base de datos responde", async () => {
    const healthRepo: HealthRepository = {
      checkConnection: async () => "reachable",
    }

    const useCase = new HealthCheckUseCase(healthRepo)
    const result = await useCase.execute()

    expect(result.status).toBe("ok")
    expect(result.database).toBe("reachable")
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0)
  })

  it("devuelve degraded cuando la base de datos falla", async () => {
    const healthRepo: HealthRepository = {
      checkConnection: async () => "unreachable",
    }

    const useCase = new HealthCheckUseCase(healthRepo)
    const result = await useCase.execute()

    expect(result.status).toBe("degraded")
    expect(result.database).toBe("unreachable")
  })
})
