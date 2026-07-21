import { Router } from "express"
import { z } from "zod"

import type { ListProviderInstancesUseCase } from "../../../../application/use-cases/provider/list-provider-instances.use-case"
import type { CreateProviderInstanceUseCase } from "../../../../application/use-cases/provider/create-provider-instance.use-case"
import type { UpdateProviderInstanceUseCase } from "../../../../application/use-cases/provider/update-provider-instance.use-case"
import type { DeleteProviderInstanceUseCase } from "../../../../application/use-cases/provider/delete-provider-instance.use-case"
import type { ValidateProviderInstanceUseCase } from "../../../../application/use-cases/provider/validate-provider-instance.use-case"
import { validate } from "../middlewares/validation"

const CreateInstanceSchema = z.object({
  kind: z.enum(["ollama", "openai-compatible"]),
  name: z.string().trim().min(1, "Name is required"),
  url: z.string().optional().default(""),
  apiKey: z.string().optional(),
})

const UpdateInstanceSchema = z.object({
  name: z.string().trim().min(1).optional(),
  url: z.string().optional(),
  apiKey: z.string().optional(),
})

export const buildProviderInstanceRouter = (deps: {
  listProviderInstances: ListProviderInstancesUseCase
  createProviderInstance: CreateProviderInstanceUseCase
  updateProviderInstance: UpdateProviderInstanceUseCase
  deleteProviderInstance: DeleteProviderInstanceUseCase
  validateProviderInstance: ValidateProviderInstanceUseCase
}): Router => {
  const router = Router()

  router.get("/provider-instances", async (_req, res, next) => {
    try {
      const result = await deps.listProviderInstances.execute()
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post(
    "/provider-instances",
    validate(CreateInstanceSchema),
    async (req, res, next) => {
      try {
        const body = req.body as z.infer<typeof CreateInstanceSchema>
        const result = await deps.createProviderInstance.execute(body)
        res.status(201).json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  router.patch(
    "/provider-instances/:id",
    validate(UpdateInstanceSchema),
    async (req, res, next) => {
      try {
        const id = req.params.id as string
        const result = await deps.updateProviderInstance.execute(
          id,
          req.body as z.infer<typeof UpdateInstanceSchema>,
        )
        res.json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete("/provider-instances/:id", async (req, res, next) => {
    try {
      const id = req.params.id as string
      await deps.deleteProviderInstance.execute(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  router.get("/provider-instances/:id/status", async (req, res, next) => {
    try {
      const id = req.params.id as string
      const result = await deps.validateProviderInstance.execute(id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
