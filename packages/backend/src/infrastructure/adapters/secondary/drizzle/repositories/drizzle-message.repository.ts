import { and, eq, gt } from "drizzle-orm"

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
    alternativesCursor: row.alternativesCursor,
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
      alternativesCursor: message.alternativesCursor,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    })

    return message
  }

  async findById(id: string): Promise<Message | null> {
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1)

    if (rows.length === 0) return null
    return toMessage(rows[0])
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

  async update(message: Message): Promise<Message> {
    await this.db
      .update(messages)
      .set({
        content: message.content,
        position: message.position,
        alternatives: message.alternatives,
        alternativesCursor: message.alternativesCursor,
        editedAt: message.editedAt,
      })
      .where(eq(messages.id, message.id))

    return message
  }

  async deleteById(id: string): Promise<void> {
    await this.db
      .delete(messages)
      .where(eq(messages.id, id))
  }

  async deleteAfterPosition(conversationId: string, position: number): Promise<void> {
    await this.db
      .delete(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          gt(messages.position, position),
        ),
      )
  }

  async clearAlternatives(conversationId: string): Promise<void> {
    await this.db
      .update(messages)
      .set({
        alternatives: [],
        alternativesCursor: 0,
      })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.role, "assistant"),
        ),
      )
  }
}
