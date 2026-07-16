import { describe, it, expect } from "vitest"

import { ListConversationsUseCase } from "./list-conversations.use-case"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Conversation } from "../../../domain/entities/conversation.entity"
import { Message } from "../../../domain/entities/message.entity"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"

const now = new Date()
const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "ver-1", characterId: "char-1", name: "Test",
  subtitle: null, profileImage: "https://example.com/avatar.png",
  description: "A test character", instructions: null,
  greeting: "Hello!", versionNumber: 1, createdAt: now, cards: [],
})

const buildConversationRepo = (): ConversationRepository => ({
  create: async (c) => c,
  findById: async () => null,
  findByIdWithMessages: async () => null,
  list: async (status) => {
    const all = [
      Conversation.create({
        id: "conv-1",
        versionId: "ver-1",
        title: null,
        status: "active",
        model: null,
        provider: null,
        recentMessageCount: 15,
        summaryFrequency: 15,
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        createdAt: now,
        updatedAt: now,
      }),
      Conversation.create({
        id: "conv-2",
        versionId: "ver-1",
        title: "Chat sobre Test",
        status: "archived",
        model: null,
        provider: null,
        recentMessageCount: 15,
        summaryFrequency: 15,
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        createdAt: now,
        updatedAt: now,
      }),
    ]
    return status ? all.filter((c) => c.status === status) : all
  },
  update: async (c) => c,
})

const buildMessageRepo = (messageCount: number): MessageRepository => ({
  create: async (m) => m,
  findByConversationId: async () =>
    Array.from({ length: messageCount }, (_, i) =>
      Message.create({
        id: `msg-${i}`,
        conversationId: "conv-1",
        role: i % 2 === 0 ? "assistant" : "user",
        content: `Message ${i}`,
        position: i,
        alternatives: [],
        createdAt: now,
        editedAt: null,
      }),
    ),
  findLastByConversationId: async () => null,
})

const buildCharacterRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version }),
  findById: async () => ({ character, currentVersion: version }),
  list: async () => [],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => version,
  findVersionsByCharacterId: async () => [],
  findMaxVersionNumber: async () => 0,
  saveVersion: async (v) => v,
})

describe("ListConversationsUseCase", () => {
  it("retorna lista de conversaciones con resumen", async () => {
    const useCase = new ListConversationsUseCase(
      buildConversationRepo(),
      buildMessageRepo(5),
      buildCharacterRepo(),
    )

    const result = await useCase.execute()

    expect(result).toHaveLength(2)
    expect(result[0].characterName).toBe("Test")
    expect(result[0].messageCount).toBe(5)
    expect(result[0].status).toBe("active")
    expect(result[1].status).toBe("archived")
  })

  it("filtra por estado", async () => {
    const useCase = new ListConversationsUseCase(
      buildConversationRepo(),
      buildMessageRepo(3),
      buildCharacterRepo(),
    )

    const result = await useCase.execute("archived")
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe("archived")
  })
})
