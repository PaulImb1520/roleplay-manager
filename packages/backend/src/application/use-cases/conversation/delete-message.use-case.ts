import { Message } from "../../../domain/entities/message.entity"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
  MessageNotFoundError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export interface DeleteMessageInput {
  conversationId: string
  messageId: string
}

export class DeleteMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(input: DeleteMessageInput): Promise<void> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId,
    )
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId)
    }
    if (conversation.status === "archived") {
      throw new ConversationArchivedError(input.conversationId)
    }

    const message = await this.messageRepository.findById(input.messageId)
    if (!message) {
      throw new MessageNotFoundError(input.messageId)
    }

    if (message.position === 0) {
      throw new Error("Cannot delete the first message (greeting)")
    }

    await this.messageRepository.deleteById(input.messageId)

    const remaining = await this.messageRepository.findByConversationId(
      input.conversationId,
    )
    const reordered = remaining
      .sort((a, b) => a.position - b.position)
      .map((m, i) => {
        if (m.position !== i) {
          return Message.create({
            id: m.id,
            conversationId: m.conversationId,
            role: m.role,
            content: m.content,
            position: i,
            alternatives: m.alternatives,
            alternativesCursor: m.alternativesCursor,
            createdAt: m.createdAt,
            editedAt: m.editedAt,
          })
        }
        return m
      })

    for (const msg of reordered) {
      await this.messageRepository.update(msg)
    }
  }
}
