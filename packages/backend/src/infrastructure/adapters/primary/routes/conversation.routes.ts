import { Router } from "express"
import { z } from "zod"

import type { CreateConversationUseCase } from "../../../../application/use-cases/conversation/create-conversation.use-case"
import type { GetConversationUseCase } from "../../../../application/use-cases/conversation/get-conversation.use-case"
import type { ListConversationsUseCase } from "../../../../application/use-cases/conversation/list-conversations.use-case"
import type { ArchiveConversationUseCase } from "../../../../application/use-cases/conversation/archive-conversation.use-case"
import type { SendMessageUseCase } from "../../../../application/use-cases/conversation/send-message.use-case"
import type { EditMessageUseCase } from "../../../../application/use-cases/conversation/edit-message.use-case"
import type { DeleteMessageUseCase } from "../../../../application/use-cases/conversation/delete-message.use-case"
import type { RegenerateReplyUseCase } from "../../../../application/use-cases/conversation/regenerate-reply.use-case"
import type { RewindConversationUseCase } from "../../../../application/use-cases/conversation/rewind-conversation.use-case"
import type { ContinueConversationUseCase } from "../../../../application/use-cases/conversation/continue-conversation.use-case"
import type { CycleAlternativeUseCase } from "../../../../application/use-cases/conversation/cycle-alternative.use-case"
import type { UpdateConversationSettingsUseCase } from "../../../../application/use-cases/conversation/update-conversation-settings.use-case"
import { validate } from "../middlewares/validation"

const CreateConversationSchema = z.object({
  characterId: z.string().min(1, "characterId is required"),
})

const SendMessageSchema = z.object({
  content: z.string().min(1, "content is required"),
})

const EditMessageSchema = z.object({
  content: z.string().min(1, "content is required"),
})

const CycleAlternativeSchema = z.object({
  direction: z.enum(["prev", "next"]),
})

const UpdateConversationSettingsSchema = z.object({
  provider: z.enum(["ollama", "openai-compatible"]).optional(),
  providerInstanceId: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  recentMessageCount: z.number().int().min(1).optional(),
  summaryFrequency: z.number().int().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
  force: z.boolean().optional(),
})

export const buildConversationRouter = (deps: {
  createConversation: CreateConversationUseCase
  getConversation: GetConversationUseCase
  listConversations: ListConversationsUseCase
  archiveConversation: ArchiveConversationUseCase
  sendMessage: SendMessageUseCase
  editMessage: EditMessageUseCase
  deleteMessage: DeleteMessageUseCase
  regenerateReply: RegenerateReplyUseCase
  rewindConversation: RewindConversationUseCase
  continueConversation: ContinueConversationUseCase
  cycleAlternative: CycleAlternativeUseCase
  updateConversationSettings: UpdateConversationSettingsUseCase
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
      const { id } = req.params as { id: string }
      const result = await deps.getConversation.execute(id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post("/conversations/:id/archive", async (req, res, next) => {
    try {
      const { id } = req.params as { id: string }
      const result = await deps.archiveConversation.execute(id, "archive")
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post("/conversations/:id/unarchive", async (req, res, next) => {
    try {
      const { id } = req.params as { id: string }
      const result = await deps.archiveConversation.execute(id, "unarchive")
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post("/conversations/:id/messages", async (req, res, next) => {
    let sseStarted = false
    try {
      const { id } = req.params as { id: string }
      const { content } = SendMessageSchema.parse(req.body)

      const generator = deps.sendMessage.execute({
        conversationId: id,
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

  router.patch(
    "/conversations/:id/messages/:messageId",
    validate(EditMessageSchema),
    async (req, res, next) => {
      try {
        const { id, messageId } = req.params as { id: string; messageId: string }
        const { content } = req.body as z.infer<typeof EditMessageSchema>
        const result = await deps.editMessage.execute({
          conversationId: id,
          messageId,
          content,
        })
        res.json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  router.delete(
    "/conversations/:id/messages/:messageId",
    async (req, res, next) => {
      try {
        const { id, messageId } = req.params as { id: string; messageId: string }
        await deps.deleteMessage.execute({
          conversationId: id,
          messageId,
        })
        res.status(204).end()
      } catch (error) {
        next(error)
      }
    },
  )

  router.post(
    "/conversations/:id/messages/:messageId/regenerate",
    async (req, res, next) => {
      let sseStarted = false
      try {
        const { id, messageId } = req.params as { id: string; messageId: string }
        const generator = deps.regenerateReply.execute({
          conversationId: id,
          messageId,
        })

        sseStarted = true
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders()

        for await (const event of generator) {
          switch (event.type) {
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
    },
  )

  router.post(
    "/conversations/:id/rewind",
    async (req, res, next) => {
      try {
        const { id } = req.params as { id: string }
        const { targetMessageId } = z
          .object({ targetMessageId: z.string().min(1) })
          .parse(req.body)
        const result = await deps.rewindConversation.execute({
          conversationId: id,
          targetMessageId,
        })
        res.json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  router.post(
    "/conversations/:id/continue",
    async (req, res, next) => {
      let sseStarted = false
      try {
        const { id } = req.params as { id: string }
        const generator = deps.continueConversation.execute({
          conversationId: id,
        })

        sseStarted = true
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders()

        for await (const event of generator) {
          switch (event.type) {
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
    },
  )

  router.post(
    "/conversations/:id/messages/:messageId/cycle",
    validate(CycleAlternativeSchema),
    async (req, res, next) => {
      try {
        const { id, messageId } = req.params as { id: string; messageId: string }
        const { direction } = req.body as z.infer<typeof CycleAlternativeSchema>
        const result = await deps.cycleAlternative.execute({
          conversationId: id,
          messageId,
          direction,
        })
        res.json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  router.patch(
    "/conversations/:id/settings",
    validate(UpdateConversationSettingsSchema),
    async (req, res, next) => {
      try {
        const { id } = req.params as { id: string }
        const body = req.body as z.infer<typeof UpdateConversationSettingsSchema>
        const result = await deps.updateConversationSettings.execute(
          id,
          body,
        )
        res.json(result)
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
