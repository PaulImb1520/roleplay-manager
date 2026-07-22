import { eq } from "drizzle-orm"

import { Conversation } from "../../../../../domain/entities/conversation.entity"
import { Message } from "../../../../../domain/entities/message.entity"
import type {
  ConversationRepository,
  ConversationWithMessages,
} from "../../../../../domain/ports/conversation.repository"
import type { Database } from "../../../../config/database"
import type {
  ConversationSettingsUpdate,
  ConversationStatus,
} from "@workspace/shared/types/conversation"
import { conversations, messages } from "../schema"

type ConversationRow = typeof conversations.$inferSelect
type MessageRow = typeof messages.$inferSelect

const toConversation = (row: ConversationRow): Conversation =>
  Conversation.create({
    id: row.id,
    versionId: row.versionId,
    title: row.title ?? null,
    status: row.status as ConversationStatus,
    model: row.model ?? null,
    provider: row.provider ?? null,
    providerInstanceId: row.providerInstanceId ?? null,
    recentMessageCount: row.recentMessageCount ?? 15,
    summaryFrequency: row.summaryFrequency ?? 15,
    temperature: row.temperature ?? 0.7,
    maxTokens: row.maxTokens ?? 2048,
    topP: row.topP ?? 0.9,
    frequencyPenalty: row.frequencyPenalty ?? 0,
    presencePenalty: row.presencePenalty ?? 0,
    stopSequences: row.stopSequences ?? [],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  })

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

export class DrizzleConversationRepository implements ConversationRepository {
  constructor(private readonly db: Database) {}

  async create(conversation: Conversation): Promise<Conversation> {
    await this.db.insert(conversations).values({
      id: conversation.id,
      versionId: conversation.versionId,
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
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })

    return conversation
  }

  async findById(id: string): Promise<Conversation | null> {
    const rows = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)

    if (rows.length === 0) return null
    return toConversation(rows[0])
  }

  async findByIdWithMessages(id: string): Promise<ConversationWithMessages | null> {
    const convRows = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)

    if (convRows.length === 0) return null

    const conv = toConversation(convRows[0])
    const msgRows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.position)

    return { conversation: conv, messages: msgRows.map(toMessage) }
  }

  async list(status?: ConversationStatus): Promise<Conversation[]> {
    const query = this.db.select().from(conversations)

    if (status) {
      query.where(eq(conversations.status, status))
    }

    const rows = await query.orderBy(conversations.updatedAt)
    return rows.map(toConversation)
  }

  async update(conversation: Conversation): Promise<Conversation> {
    await this.db
      .update(conversations)
      .set({
        title: conversation.title,
        status: conversation.status,
        updatedAt: conversation.updatedAt,
      })
      .where(eq(conversations.id, conversation.id))

    return conversation
  }

  async updateSettings(
    id: string,
    settings: ConversationSettingsUpdate,
  ): Promise<Conversation> {
    const now = new Date()
    const values: Record<string, unknown> = { updatedAt: now }

    if (settings.model !== undefined) values.model = settings.model
    if (settings.provider !== undefined) values.provider = settings.provider
    if (settings.providerInstanceId !== undefined)
      values.providerInstanceId = settings.providerInstanceId
    if (settings.recentMessageCount !== undefined)
      values.recentMessageCount = settings.recentMessageCount
    if (settings.summaryFrequency !== undefined)
      values.summaryFrequency = settings.summaryFrequency
    if (settings.temperature !== undefined)
      values.temperature = settings.temperature
    if (settings.maxTokens !== undefined) values.maxTokens = settings.maxTokens
    if (settings.topP !== undefined) values.topP = settings.topP
    if (settings.frequencyPenalty !== undefined)
      values.frequencyPenalty = settings.frequencyPenalty
    if (settings.presencePenalty !== undefined)
      values.presencePenalty = settings.presencePenalty
    if (settings.stopSequences !== undefined)
      values.stopSequences = JSON.stringify(settings.stopSequences)

    await this.db
      .update(conversations)
      .set(values)
      .where(eq(conversations.id, id))

    const updated = await this.findById(id)
    if (!updated) {
      throw new Error(`Conversation '${id}' not found after updateSettings`)
    }

    return updated
  }
}
