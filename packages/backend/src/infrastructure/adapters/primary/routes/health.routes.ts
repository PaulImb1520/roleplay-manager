import { Router } from "express"

import type { HealthCheckUseCase } from "../../../../application/use-cases/health/health-check.use-case"

export const buildHealthRouter = (
  healthCheck: HealthCheckUseCase,
): Router => {
  const router = Router()

  router.get("/health", async (_req, res, next) => {
    try {
      const result = await healthCheck.execute()
      const status = result.status === "ok" ? 200 : 503
      res.status(status).json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
