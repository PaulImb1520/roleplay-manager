import type { ConversationDetail } from "@workspace/shared/types/conversation"
import type { MessageDTO } from "@workspace/shared/types/message"

import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { ConversationNotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Message } from "../../../domain/entities/message.entity"

export class GetConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(id: string): Promise<ConversationDetail> {
    const convWithMessages = await this.conversationRepository.findByIdWithMessages(id)

    if (!convWithMessages) {
      throw new ConversationNotFoundError(id)
    }

    const version = await this.characterRepository.findVersionById(convWithMessages.conversation.versionId)
    const characterId = version?.characterId ?? ""
    const result = characterId ? await this.characterRepository.findById(characterId) : null
    const characterName = result?.currentVersion.name ?? version?.name ?? "Unknown"
    const characterProfileImage = result?.currentVersion.profileImage ?? ""

    return {
      id: convWithMessages.conversation.id,
      characterId,
      characterName,
      characterProfileImage,
      title: convWithMessages.conversation.title,
      status: convWithMessages.conversation.status,
      model: convWithMessages.conversation.model,
      provider: convWithMessages.conversation.provider,
      providerInstanceId: convWithMessages.conversation.providerInstanceId,
      recentMessageCount: convWithMessages.conversation.recentMessageCount,
      summaryFrequency: convWithMessages.conversation.summaryFrequency,
      temperature: convWithMessages.conversation.temperature,
      maxTokens: convWithMessages.conversation.maxTokens,
      topP: convWithMessages.conversation.topP,
      frequencyPenalty: convWithMessages.conversation.frequencyPenalty,
      presencePenalty: convWithMessages.conversation.presencePenalty,
      stopSequences: convWithMessages.conversation.stopSequences,
      createdAt: convWithMessages.conversation.createdAt.toISOString(),
      updatedAt: convWithMessages.conversation.updatedAt.toISOString(),
      messages: convWithMessages.messages.map(toMessageDTO),
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
    createdAt: m.createdAt.toISOString(),
    editedAt: m.editedAt?.toISOString() ?? null,
  }
}
