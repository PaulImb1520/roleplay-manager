import { Router } from "express"
import { z } from "zod"

import type { CreateConversationUseCase } from "../../../../application/use-cases/conversation/create-conversation.use-case"
import type { GetConversationUseCase } from "../../../../application/use-cases/conversation/get-conversation.use-case"
import type { ListConversationsUseCase } from "../../../../application/use-cases/conversation/list-conversations.use-case"
import type { ArchiveConversationUseCase } from "../../../../application/use-cases/conversation/archive-conversation.use-case"
import type { SendMessageUseCase } from "../../../../application/use-cases/conversation/send-message.use-case"

const CreateConversationSchema = z.object({
  characterId: z.string().min(1, "characterId is required"),
})

const SendMessageSchema = z.object({
  content: z.string().min(1, "content is required"),
})

export const buildConversationRouter = (deps: {
  createConversation: CreateConversationUseCase
  getConversation: GetConversationUseCase
  listConversations: ListConversationsUseCase
  archiveConversation: ArchiveConversationUseCase
  sendMessage: SendMessageUseCase
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

  router.post("/conversations/:id/messages", async (req, res, next) => {
    let sseStarted = false
    try {
      const { content } = SendMessageSchema.parse(req.body)

      const generator = deps.sendMessage.execute({
        conversationId: req.params.id,
        content,
      })

      sseStarted = true
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      res.flushHeaders()

      for await (const event of generator) {
        switch (event.type) {
          case "user-message-saved": {
            res.write(`event: saved\ndata: ${JSON.stringify(event.message)}\n\n`)
            break
          }
          case "chunk": {
            res.write(`event: chunk\ndata: ${JSON.stringify({ content: event.content })}\n\n`)
            break
          }
          case "done": {
            res.write(`event: done\ndata: ${JSON.stringify(event.message)}\n\n`)
            break
          }
          case "error": {
            res.write(`event: error\ndata: ${JSON.stringify(event.error)}\n\n`)
            break
          }
        }
      }

      res.end()
    } catch (error) {
      if (sseStarted) {
        res.write(
          `event: error\ndata: ${JSON.stringify({ code: "INTERNAL_ERROR", message: "Unexpected error" })}\n\n`,
        )
        res.end()
      } else {
        next(error)
      }
    }
  })

  return router
}
