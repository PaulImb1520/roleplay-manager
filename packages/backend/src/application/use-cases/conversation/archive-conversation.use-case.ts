import type { ConversationDetail } from "@workspace/shared/types/conversation"
import type { MessageDTO } from "@workspace/shared/types/message"

import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import {
  ConversationNotFoundError,
  ConversationArchivedError,
  ConversationAlreadyActiveError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Message } from "../../../domain/entities/message.entity"

export class ArchiveConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(id: string, action: "archive" | "unarchive"): Promise<ConversationDetail> {
    const convWithMessages = await this.conversationRepository.findByIdWithMessages(id)

    if (!convWithMessages) {
      throw new ConversationNotFoundError(id)
    }

    let { conversation } = convWithMessages

    if (action === "archive") {
      if (conversation.status === "archived") {
        throw new ConversationArchivedError(id)
      }
      conversation = conversation.archive()
    } else {
      if (conversation.status === "active") {
        throw new ConversationAlreadyActiveError(id)
      }
      conversation = conversation.unarchive()
    }

    await this.conversationRepository.update(conversation)

    const version = await this.characterRepository.findVersionById(conversation.versionId)
    const characterId = version?.characterId ?? ""
    const result = characterId ? await this.characterRepository.findById(characterId) : null

    return {
      id: conversation.id,
      characterId,
      characterName: result?.currentVersion.name ?? version?.name ?? "Unknown",
      characterProfileImage: result?.currentVersion.profileImage ?? "",
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
    alternativesCursor: m.alternativesCursor,
    createdAt: m.createdAt.toISOString(),
    editedAt: m.editedAt?.toISOString() ?? null,
  }
}
