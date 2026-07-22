import type { Message } from "../entities/message.entity"

export interface MessageRepository {
  create(message: Message): Promise<Message>

  findByConversationId(conversationId: string): Promise<Message[]>

  findById(id: string): Promise<Message | null>

  findLastByConversationId(conversationId: string): Promise<Message | null>

  update(message: Message): Promise<Message>

  deleteById(id: string): Promise<void>

  deleteAfterPosition(conversationId: string, position: number): Promise<void>

  clearAlternatives(conversationId: string): Promise<void>
}
