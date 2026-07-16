import { Router } from "express"
import { z } from "zod"

import type { ListProvidersUseCase } from "../../../../application/use-cases/provider/list-providers.use-case"
import type { ValidateProviderConnectionUseCase } from "../../../../application/use-cases/provider/validate-provider-connection.use-case"
import type { ListProviderModelsUseCase } from "../../../../application/use-cases/provider/list-provider-models.use-case"

const ProviderIdSchema = z.enum(["ollama", "openai-compatible"])

export const buildProviderRouter = (deps: {
  listProviders: ListProvidersUseCase
  validateProviderConnection: ValidateProviderConnectionUseCase
  listProviderModels: ListProviderModelsUseCase
}): Router => {
  const router = Router()

  router.get("/providers", (_req, res, next) => {
    try {
      const result = deps.listProviders.execute()
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/providers/:id/status", async (req, res, next) => {
    try {
      const idResult = ProviderIdSchema.safeParse(req.params.id)
      if (!idResult.success) {
        res.status(404).json({
          error: {
            code: "PROVIDER_NOT_FOUND",
            message: `Unknown provider id: ${req.params.id}`,
          },
        })
        return
      }
      const result = await deps.validateProviderConnection.execute(
        idResult.data,
      )
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/providers/:id/models", async (req, res, next) => {
    try {
      const idResult = ProviderIdSchema.safeParse(req.params.id)
      if (!idResult.success) {
        res.status(404).json({
          error: {
            code: "PROVIDER_NOT_FOUND",
            message: `Unknown provider id: ${req.params.id}`,
          },
        })
        return
      }
      const result = await deps.listProviderModels.execute(idResult.data)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
