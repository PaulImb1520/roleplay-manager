import type { ConversationSummary, ConversationStatus } from "@workspace/shared/types/conversation"

import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"

export class ListConversationsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(status?: ConversationStatus): Promise<ConversationSummary[]> {
    const conversations = await this.conversationRepository.list(status)
    const summaries: ConversationSummary[] = []

    for (const conv of conversations) {
      const messages = await this.messageRepository.findByConversationId(conv.id)
      const version = await this.characterRepository.findVersionById(conv.versionId)
      const characterId = version?.characterId ?? ""
      const result = characterId ? await this.characterRepository.findById(characterId) : null

      summaries.push({
        id: conv.id,
        characterName: result?.currentVersion.name ?? version?.name ?? "Unknown",
        characterProfileImage: result?.currentVersion.profileImage ?? "",
        title: conv.title,
        status: conv.status,
        messageCount: messages.length,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })
    }

    return summaries
  }
}
