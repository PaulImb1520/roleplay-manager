import type {
  ConversationDetail,
  ConversationSettingsUpdate,
} from "@workspace/shared/types/conversation"
import type { MessageDTO } from "@workspace/shared/types/message"
import type { ProviderId } from "@workspace/shared/types/provider"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { Logger } from "../../../domain/ports/logger.port"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { Message } from "../../../domain/entities/message.entity"
import {
  ConversationNotFoundError,
  ConversationArchivedError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import { DomainError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

const VALID_PROVIDERS: ProviderId[] = ["ollama", "openai-compatible"]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export class UpdateConversationSettingsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly providerRegistry: ProviderRegistry,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    conversationId: string,
    input: ConversationSettingsUpdate,
  ): Promise<ConversationDetail> {
    const conv = await this.conversationRepository.findById(conversationId)
    if (!conv) {
      throw new ConversationNotFoundError(conversationId)
    }
    if (conv.status === "archived") {
      throw new ConversationArchivedError(conversationId)
    }

    if (input.provider !== undefined) {
      if (!VALID_PROVIDERS.includes(input.provider as ProviderId)) {
        throw new DomainError(
          "INVALID_PROVIDER",
          `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}`,
        )
      }

      if (input.provider === "openai-compatible") {
        if (!input.providerInstanceId) {
          throw new DomainError(
            "PROVIDER_INSTANCE_REQUIRED",
            "An instance ID is required for openai-compatible providers.",
          )
        }
        const instance = await this.providerInstanceRepository.findById(
          input.providerInstanceId,
        )
        if (!instance) {
          throw new DomainError(
            "PROVIDER_INSTANCE_NOT_FOUND",
            `Provider instance '${input.providerInstanceId}' not found.`,
          )
        }

        if (input.force !== true) {
          try {
            const adapter = this.providerRegistry.createAdapter(instance)
            const status = await adapter.validateConnection()
            if (status !== "available") {
              throw new DomainError(
                "PROVIDER_NOT_AVAILABLE",
                `Provider '${instance.name}' is not available. Use force: true to save anyway.`,
              )
            }
          } catch (error) {
            if (error instanceof DomainError) throw error
            throw new DomainError(
              "PROVIDER_NOT_AVAILABLE",
              `Provider '${instance.name}' is not available. Use force: true to save anyway.`,
            )
          }
        }
      } else if (input.provider === "ollama") {
        if (input.force !== true) {
          try {
            const adapter = await this.providerRegistry.getAdapter("ollama")
            if (adapter) {
              const status = await adapter.validateConnection()
              if (status !== "available") {
                this.logger.warn("Ollama is not available but saving anyway (no force required for built-in)")
              }
            }
          } catch {
            this.logger.warn("Ollama connection check failed but saving anyway")
          }
        }
      }
    }

    if (input.temperature !== undefined) {
      input.temperature = clamp(input.temperature, 0, 2)
    }
    if (input.topP !== undefined) {
      input.topP = clamp(input.topP, 0, 1)
    }
    if (input.frequencyPenalty !== undefined) {
      input.frequencyPenalty = clamp(input.frequencyPenalty, -2, 2)
    }
    if (input.presencePenalty !== undefined) {
      input.presencePenalty = clamp(input.presencePenalty, -2, 2)
    }
    if (input.maxTokens !== undefined) {
      input.maxTokens = Math.max(1, input.maxTokens)
    }
    if (input.recentMessageCount !== undefined) {
      input.recentMessageCount = Math.max(1, input.recentMessageCount)
    }
    if (input.summaryFrequency !== undefined) {
      input.summaryFrequency = Math.max(1, input.summaryFrequency)
    }

    const updated = await this.conversationRepository.updateSettings(
      conversationId,
      input,
    )

    const version = await this.characterRepository.findVersionById(
      updated.versionId,
    )
    const characterId = version?.characterId ?? ""
    const result = characterId
      ? await this.characterRepository.findById(characterId)
      : null

    return {
      id: updated.id,
      characterId,
      characterName: result?.currentVersion.name ?? version?.name ?? "Unknown",
      characterProfileImage: result?.currentVersion.profileImage ?? "",
      title: updated.title,
      status: updated.status,
      model: updated.model,
      provider: updated.provider,
      providerInstanceId: updated.providerInstanceId,
      recentMessageCount: updated.recentMessageCount,
      summaryFrequency: updated.summaryFrequency,
      temperature: updated.temperature,
      maxTokens: updated.maxTokens,
      topP: updated.topP,
      frequencyPenalty: updated.frequencyPenalty,
      presencePenalty: updated.presencePenalty,
      stopSequences: updated.stopSequences,
      memoryProposalMode: updated.memoryProposalMode,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      messages: [],
    }
  }
}
