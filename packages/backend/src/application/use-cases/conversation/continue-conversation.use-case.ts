import { v7 as randomUUIDv7 } from "uuid"

import type { MessageDTO } from "@workspace/shared/types/message"
import type { DefaultProviderConfig, ProviderId } from "@workspace/shared/types/provider"

import { Message } from "../../../domain/entities/message.entity"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { PromptContextBuilder } from "../../../domain/ports/prompt-context-builder"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { GetDefaultProviderUseCase } from "../provider/get-default-provider.use-case"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export interface ContinueConversationInput {
  conversationId: string
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

export type ContinueConversationEvent =
  | StreamChunkEvent
  | StreamDoneEvent
  | StreamErrorEvent

export class ContinueConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly promptContextBuilder: PromptContextBuilder,
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: Logger,
    private readonly getDefaultProvider: GetDefaultProviderUseCase,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async *execute(
    input: ContinueConversationInput,
  ): AsyncGenerator<ContinueConversationEvent> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId,
    )
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId)
    }
    if (conversation.status === "archived") {
      throw new ConversationArchivedError(input.conversationId)
    }

    const allMessages = await this.messageRepository.findByConversationId(
      input.conversationId,
    )
    const nextPosition = allMessages.length

    const lastAssistantIndex = allMessages.length - 1
    const lastMsg = lastAssistantIndex >= 0 ? allMessages[lastAssistantIndex] : null
    if (lastMsg?.role === "assistant" && lastMsg.alternatives.length > 0) {
      const accepted = lastMsg.accept()
      await this.messageRepository.update(accepted)
    }

    const version = await this.characterRepository.findVersionById(
      conversation.versionId,
    )
    if (!version) {
      yield {
        type: "error",
        error: {
          code: "CHARACTER_VERSION_NOT_FOUND",
          message: `Character version '${conversation.versionId}' not found.`,
        },
      }
      return
    }

    const characterResult = await this.characterRepository.findById(
      version.characterId,
    )
    if (!characterResult) {
      yield {
        type: "error",
        error: {
          code: "CHARACTER_NOT_FOUND",
          message: `Character '${version.characterId}' not found.`,
        },
      }
      return
    }

    const context = await this.promptContextBuilder.build({
      characterVersion: characterResult.currentVersion,
      messages: allMessages,
      recentMessageCount: conversation.recentMessageCount,
    })

    let providerId = conversation.provider as ProviderId | null
    let providerInstanceId = conversation.providerInstanceId
    let resolvedModel = conversation.model
    if (!providerId) {
      const defaultConfig: DefaultProviderConfig =
        await this.getDefaultProvider.execute()
      providerId = defaultConfig.provider
      providerInstanceId = defaultConfig.providerInstanceId
      resolvedModel ??= defaultConfig.model
    }
    if (!providerId) {
      yield {
        type: "error",
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message: "No se ha configurado un proveedor por defecto.",
        },
      }
      return
    }

    let adapter = null
    if (providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(
        providerInstanceId,
      )
      if (instance) {
        adapter = this.providerRegistry.createAdapter(instance)
      }
    }
    if (!adapter) {
      adapter = await this.providerRegistry.getAdapter(providerId)
    }
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

    const model = resolvedModel ?? undefined
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
      this.logger.error("Continue streaming failed", error as Error, {
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
      position: nextPosition,
      alternatives: [],
      alternativesCursor: 0,
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
    alternativesCursor: m.alternativesCursor,
    createdAt: m.createdAt.toISOString(),
    editedAt: m.editedAt?.toISOString() ?? null,
  }
}
