import { Router } from "express"
import { z } from "zod"

import type { CreateConversationUseCase } from "../../../../application/use-cases/conversation/create-conversation.use-case"
import type { GetConversationUseCase } from "../../../../application/use-cases/conversation/get-conversation.use-case"
import type { ListConversationsUseCase } from "../../../../application/use-cases/conversation/list-conversations.use-case"
import type { ArchiveConversationUseCase } from "../../../../application/use-cases/conversation/archive-conversation.use-case"

const CreateConversationSchema = z.object({
  characterId: z.string().min(1, "characterId is required"),
})

export const buildConversationRouter = (deps: {
  createConversation: CreateConversationUseCase
  getConversation: GetConversationUseCase
  listConversations: ListConversationsUseCase
  archiveConversation: ArchiveConversationUseCase
}): Router => {
  const router = Router()

  router.post("/conversations", async (req, res, next) => {
    try {
      const input = CreateConversationSchema.parse(req.body)
      const result = await deps.createConversation.execute(input)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/conversations", async (req, res, next) => {
    try {
      const status = req.query.status as string | undefined
      const validStatus = status === "active" || status === "archived" ? status : undefined
      const result = await deps.listConversations.execute(validStatus)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get("/conversations/:id", async (req, res, next) => {
    try {
      const result = await deps.getConversation.execute(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post("/conversations/:id/archive", async (req, res, next) => {
    try {
      const result = await deps.archiveConversation.execute(req.params.id, "archive")
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post("/conversations/:id/unarchive", async (req, res, next) => {
    try {
      const result = await deps.archiveConversation.execute(req.params.id, "unarchive")
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
