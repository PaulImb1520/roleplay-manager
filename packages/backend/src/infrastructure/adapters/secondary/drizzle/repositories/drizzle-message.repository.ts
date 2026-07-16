import { eq } from "drizzle-orm"

import { Message } from "../../../../../domain/entities/message.entity"
import type { MessageRepository } from "../../../../../domain/ports/message.repository"
import type { Database } from "../../../../config/database"
import { messages } from "../schema"

type MessageRow = typeof messages.$inferSelect

const toMessage = (row: MessageRow): Message =>
  Message.create({
    id: row.id,
    conversationId: row.conversationId,
    role: row.role as "user" | "assistant",
    content: row.content,
    position: row.position,
    alternatives: row.alternatives ?? [],
    createdAt: new Date(row.createdAt),
    editedAt: row.editedAt ? new Date(row.editedAt) : null,
  })

export class DrizzleMessageRepository implements MessageRepository {
  constructor(private readonly db: Database) {}

  async create(message: Message): Promise<Message> {
    await this.db.insert(messages).values({
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      position: message.position,
      alternatives: message.alternatives,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    })

    return message
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.position)

    return rows.map(toMessage)
  }

  async findLastByConversationId(conversationId: string): Promise<Message | null> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.position)
      .limit(1)

    if (rows.length === 0) return null
    return toMessage(rows[0])
  }
}
