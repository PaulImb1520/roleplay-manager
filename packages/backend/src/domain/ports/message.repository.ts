import type { Message } from "../entities/message.entity"

export interface MessageRepository {
  create(message: Message): Promise<Message>

  findByConversationId(conversationId: string): Promise<Message[]>

  findLastByConversationId(conversationId: string): Promise<Message | null>
}
