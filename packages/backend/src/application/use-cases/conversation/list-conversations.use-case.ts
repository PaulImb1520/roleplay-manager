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

      const lastActivityAt = messages.length > 0
        ? messages.reduce((max, m) => m.createdAt > max ? m.createdAt : max, messages[0].createdAt)
        : conv.updatedAt

      summaries.push({
        id: conv.id,
        characterId: result?.currentVersion.characterId ?? version?.characterId ?? "",
        characterName: result?.currentVersion.name ?? version?.name ?? "Unknown",
        characterProfileImage: result?.currentVersion.profileImage ?? "",
        characterProfileImageAssetId: result?.currentVersion.profileImageAssetId ?? null,
        title: conv.title,
        status: conv.status,
        messageCount: messages.length,
        lastActivityAt: lastActivityAt.toISOString(),
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })
    }

    summaries.sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
    )

    return summaries
  }
}
