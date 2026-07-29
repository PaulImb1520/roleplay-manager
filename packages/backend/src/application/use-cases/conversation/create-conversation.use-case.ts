import { v7 as randomUUIDv7 } from "uuid"

import type { ConversationDetail, CreateConversationInput } from "@workspace/shared/types/conversation"
import type { MessageDTO } from "@workspace/shared/types/message"
import type { DefaultProviderConfig } from "@workspace/shared/types/provider"

import { Conversation } from "../../../domain/entities/conversation.entity"
import { Message } from "../../../domain/entities/message.entity"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { GetDefaultProviderUseCase } from "../provider/get-default-provider.use-case"
import {
  CharacterNotFoundError,
  CharacterVersionNotFoundError,
  InvalidVersionForCharacterError,
} from "../../../domain/errors"

export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly getDefaultProvider: GetDefaultProviderUseCase,
  ) {}

  async execute(input: CreateConversationInput): Promise<ConversationDetail> {
    const result = await this.characterRepository.findById(input.characterId)

    if (!result) {
      throw new CharacterNotFoundError(input.characterId)
    }

    const version = input.versionId
      ? await this.resolveVersion(input.versionId, result.character.id)
      : result.currentVersion

    const now = new Date()
    const conversationId = randomUUIDv7()
    const defaultConfig: DefaultProviderConfig =
      await this.getDefaultProvider.execute()

    const conversation = Conversation.create({
      id: conversationId,
      versionId: version.id,
      title: null,
      titleSource: null,
      status: "active",
      model: defaultConfig.model,
      provider: defaultConfig.provider,
      providerInstanceId: defaultConfig.providerInstanceId,
      recentMessageCount: 10,
      summaryFrequency: 20,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      memoryProposalMode: "auto",
      createdAt: now,
      updatedAt: now,
    })

    const greeting = Message.create({
      id: randomUUIDv7(),
      conversationId,
      role: "assistant",
      content: version.greeting,
      position: 0,
      alternatives: [],
      alternativesCursor: 0,
      createdAt: now,
      editedAt: null,
    })

    await this.conversationRepository.create(conversation)
    await this.messageRepository.create(greeting)

    return {
      id: conversation.id,
      characterId: result.character.id,
      characterName: version.name,
      characterProfileImage: version.profileImage,
      title: conversation.title,
      titleSource: conversation.titleSource,
      status: conversation.status,
      model: conversation.model,
      provider: conversation.provider,
      providerInstanceId: conversation.providerInstanceId,
      recentMessageCount: conversation.recentMessageCount,
      summaryFrequency: conversation.summaryFrequency,
      temperature: conversation.temperature,
      maxTokens: conversation.maxTokens,
      topP: conversation.topP,
      frequencyPenalty: conversation.frequencyPenalty,
      presencePenalty: conversation.presencePenalty,
      stopSequences: conversation.stopSequences,
      memoryProposalMode: conversation.memoryProposalMode,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: [toMessageDTO(greeting)],
    }
  }

  private async resolveVersion(
    versionId: string,
    characterId: string,
  ) {
    const version = await this.characterRepository.findVersionById(versionId)
    if (!version) {
      throw new CharacterVersionNotFoundError(versionId)
    }
    if (version.characterId !== characterId) {
      throw new InvalidVersionForCharacterError(versionId, characterId)
    }
    return version
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
