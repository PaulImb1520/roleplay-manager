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
import { CharacterNotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

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

    const now = new Date()
    const conversationId = randomUUIDv7()
    const defaultConfig: DefaultProviderConfig =
      await this.getDefaultProvider.execute()

    const conversation = Conversation.create({
      id: conversationId,
      versionId: result.currentVersion.id,
      title: null,
      status: "active",
      model: defaultConfig.model,
      provider: defaultConfig.provider,
      providerInstanceId: defaultConfig.providerInstanceId,
      recentMessageCount: 15,
      summaryFrequency: 15,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
      createdAt: now,
      updatedAt: now,
    })

    const greeting = Message.create({
      id: randomUUIDv7(),
      conversationId,
      role: "assistant",
      content: result.currentVersion.greeting,
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
      characterName: result.currentVersion.name,
      characterProfileImage: result.currentVersion.profileImage,
      title: conversation.title,
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
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: [toMessageDTO(greeting)],
    }
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
