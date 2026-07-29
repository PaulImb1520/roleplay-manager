import type { MessageDTO } from "@workspace/shared/types/message"

import { Message } from "../../../domain/entities/message.entity"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MemoryChangeProposalRepository } from "../../../domain/ports/memory-change-proposal.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
} from "../../../domain/errors"

export interface RewindConversationInput {
  conversationId: string
  targetMessageId: string
}

export class RewindConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly memoryChangeProposalRepository: MemoryChangeProposalRepository,
    private readonly summaryRepository: SummaryRepository,
  ) {}

  async execute(
    input: RewindConversationInput,
  ): Promise<{ messages: MessageDTO[] }> {
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
    const targetMessage = allMessages.find(
      (m) => m.id === input.targetMessageId,
    )
    if (!targetMessage) {
      throw new Error("Target message not found")
    }

    // Determine which message IDs will be deleted
    const deletedMessageIds = new Set<string>()
    for (const m of allMessages) {
      if (m.position > targetMessage.position) {
        deletedMessageIds.add(m.id)
      }
    }
    if (targetMessage.role === "user") {
      deletedMessageIds.add(targetMessage.id)
    }

    // Delete summaries whose range intersects with the deleted messages
    const summaries = await this.summaryRepository.findByConversationId(
      input.conversationId,
    )
    const affectedSummaryIds = summaries
      .filter(
        (s) =>
          deletedMessageIds.has(s.firstMessageId) ||
          deletedMessageIds.has(s.lastMessageId),
      )
      .map((s) => s.id)

    if (affectedSummaryIds.length > 0) {
      await this.summaryRepository.deleteByIds(affectedSummaryIds)
    }

    await this.messageRepository.deleteAfterPosition(
      input.conversationId,
      targetMessage.position,
    )

    if (targetMessage.role === "user") {
      await this.messageRepository.deleteById(targetMessage.id)
    }

    await this.memoryChangeProposalRepository.discardPendingByConversationId(
      input.conversationId,
    )

    const remaining = await this.messageRepository.findByConversationId(
      input.conversationId,
    )

    return { messages: remaining.map(toMessageDTO) }
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
