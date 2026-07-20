import { v7 as randomUUIDv7 } from "uuid"

import type { MessageDTO } from "@workspace/shared/types/message"

import { Message } from "../../../domain/entities/message.entity"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { PromptContextBuilder } from "../../../domain/ports/prompt-context-builder"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { ProviderId } from "@workspace/shared/types/provider"

export interface SendMessageInput {
  conversationId: string
  content: string
}

export interface SendMessageEvents {
  type: "user-message-saved"
  message: MessageDTO
}

export interface StreamChunkEvent {
  type: "chunk"
  content: string
}

export interface StreamDoneEvent {
  type: "done"
  message: MessageDTO
}

export interface StreamErrorEvent {
  type: "error"
  error: { code: string; message: string }
}

export type SendMessageEvent =
  | SendMessageEvents
  | StreamChunkEvent
  | StreamDoneEvent
  | StreamErrorEvent

export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly promptContextBuilder: PromptContextBuilder,
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: Logger,
  ) {}

  async *execute(input: SendMessageInput): AsyncGenerator<SendMessageEvent> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId,
    )
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId)
    }
    if (conversation.status === "archived") {
      throw new ConversationArchivedError(input.conversationId)
    }

    const messages = await this.messageRepository.findByConversationId(
      input.conversationId,
    )
    const nextPosition = messages.length

    const userMessage = Message.create({
      id: randomUUIDv7(),
      conversationId: input.conversationId,
      role: "user",
      content: input.content,
      position: nextPosition,
      alternatives: [],
      createdAt: new Date(),
      editedAt: null,
    })
    await this.messageRepository.create(userMessage)

    yield {
      type: "user-message-saved",
      message: toMessageDTO(userMessage),
    }

    const characterResult = await this.characterRepository.findById(
      conversation.versionId,
    )
    if (!characterResult) {
      yield {
        type: "error",
        error: {
          code: "CHARACTER_VERSION_NOT_FOUND",
          message: `Character version '${conversation.versionId}' not found.`,
        },
      }
      return
    }

    const allMessages = [...messages, userMessage]

    const context = await this.promptContextBuilder.build({
      characterVersion: characterResult.currentVersion,
      messages: allMessages,
      recentMessageCount: conversation.recentMessageCount,
    })

    const providerId = (conversation.provider ?? "ollama") as ProviderId
    const adapter = await this.providerRegistry.getAdapter(providerId)
    if (!adapter) {
      yield {
        type: "error",
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message: `Provider '${providerId}' is not configured.`,
        },
      }
      return
    }

    const model = conversation.model ?? undefined
    let fullContent = ""

    try {
      for await (const chunk of adapter.generateStreaming(context, {
        model,
        temperature: conversation.temperature,
        maxTokens: conversation.maxTokens,
        topP: conversation.topP,
        frequencyPenalty: conversation.frequencyPenalty,
        presencePenalty: conversation.presencePenalty,
        stopSequences: conversation.stopSequences,
      })) {
        fullContent += chunk.content
        yield { type: "chunk", content: chunk.content }
      }
    } catch (error) {
      this.logger.error("Streaming failed", error as Error, {
        conversationId: input.conversationId,
      })
      yield {
        type: "error",
        error: {
          code: "STREAMING_FAILED",
          message: (error as Error).message,
        },
      }
      return
    }

    const assistantMessage = Message.create({
      id: randomUUIDv7(),
      conversationId: input.conversationId,
      role: "assistant",
      content: fullContent,
      position: nextPosition + 1,
      alternatives: [],
      createdAt: new Date(),
      editedAt: null,
    })
    await this.messageRepository.create(assistantMessage)

    yield { type: "done", message: toMessageDTO(assistantMessage) }
  }
}

function toMessageDTO(m: Message): MessageDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    position: m.position,
    alternatives: m.alternatives,
    createdAt: m.createdAt.toISOString(),
    editedAt: m.editedAt?.toISOString() ?? null,
  }
}
