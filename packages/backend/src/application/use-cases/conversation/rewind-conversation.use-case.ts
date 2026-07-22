import type { MessageDTO } from "@workspace/shared/types/message"

import { Message } from "../../../domain/entities/message.entity"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MemoryChangeProposalRepository } from "../../../domain/ports/memory-change-proposal.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export interface RewindConversationInput {
  conversationId: string
  targetMessageId: string
}

export class RewindConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly memoryChangeProposalRepository: MemoryChangeProposalRepository,
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

    await this.messageRepository.deleteAfterPosition(
      input.conversationId,
      targetMessage.position,
    )

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
