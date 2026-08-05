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
  subtitle: null, profileImageAssetId: null,
  description: "A test character", instructions: null,
  greeting: "Hello!", versionNumber: 1, createdAt: now, cards: [],
})

const buildConversationRepo = (): ConversationRepository => ({
  create: async (c) => c,
  findById: async () => null,
  findByIdWithMessages: async () => null,
  updateSettings: async (_id: string, _settings: any) => ({} as Conversation),
  clearProviderInstanceId: async () => {},
  list: async (status) => {
    const all = [
      Conversation.create({
        id: "conv-1",
        versionId: "ver-1",
        title: null,
        titleSource: null,
        status: "active",
        model: null,
        provider: null,
        providerInstanceId: null,
        recentMessageCount: 10,
        summaryFrequency: 20,
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        memoryProposalMode: "auto",
        createdAt: now,
        updatedAt: now,
      }),
      Conversation.create({
        id: "conv-2",
        versionId: "ver-1",
        title: "Chat sobre Test",
        titleSource: null,
        status: "archived",
        model: null,
        provider: null,
        providerInstanceId: null,
        recentMessageCount: 10,
        summaryFrequency: 20,
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        memoryProposalMode: "auto",
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
        alternativesCursor: 0,
        createdAt: now,
        editedAt: null,
      }),
    ),
  findById: async () => null,
  findLastByConversationId: async () => null,
  update: async (m) => m,
  deleteById: async () => {},
  deleteAfterPosition: async () => {},
  clearAlternatives: async () => {},
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
    expect(result[0].lastActivityAt).toBeDefined()
    expect(result[1].lastActivityAt).toBeDefined()
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

  it("ordena por lastActivityAt descendente", async () => {
    const older = new Date("2025-01-01")
    const newer = new Date("2025-06-01")

    const repo = (): ConversationRepository => ({
      create: async (c) => c,
      findById: async () => null,
      findByIdWithMessages: async () => null,
      updateSettings: async (_id: string, _settings: any) => ({} as Conversation),
      clearProviderInstanceId: async () => {},
      list: async () => [
        Conversation.create({
          id: "old-conv",
          versionId: "ver-1",
          title: null, titleSource: null, status: "active",
          model: null, provider: null, providerInstanceId: null,
          recentMessageCount: 10, summaryFrequency: 20,
          temperature: 0.7, maxTokens: 2048, topP: 0.9,
          frequencyPenalty: 0, presencePenalty: 0,
          stopSequences: [],
          memoryProposalMode: "auto",
          createdAt: older,
          updatedAt: older,
        }),
        Conversation.create({
          id: "recent-conv",
          versionId: "ver-1",
          title: null, titleSource: null, status: "active",
          model: null, provider: null, providerInstanceId: null,
          recentMessageCount: 10, summaryFrequency: 20,
          temperature: 0.7, maxTokens: 2048, topP: 0.9,
          frequencyPenalty: 0, presencePenalty: 0,
          stopSequences: [],
          memoryProposalMode: "auto",
          createdAt: newer,
          updatedAt: newer,
        }),
      ],
      update: async (c) => c,
    })

    const messageRepo = (): MessageRepository => ({
      create: async (m) => m,
      findByConversationId: async (convId) => {
        if (convId === "recent-conv") {
          return [
            Message.create({
              id: "msg-recent", conversationId: "recent-conv",
              role: "assistant", content: "Hi", position: 0,
              alternatives: [], alternativesCursor: 0,
              createdAt: newer, editedAt: null,
            }),
          ]
        }
        return [
          Message.create({
            id: "msg-old", conversationId: "old-conv",
            role: "assistant", content: "Hello", position: 0,
            alternatives: [], alternativesCursor: 0,
            createdAt: older, editedAt: null,
          }),
        ]
      },
      findById: async () => null,
      findLastByConversationId: async () => null,
      update: async (m) => m,
      deleteById: async () => {},
      deleteAfterPosition: async () => {},
      clearAlternatives: async () => {},
    })

    const useCase = new ListConversationsUseCase(
      repo(),
      messageRepo(),
      buildCharacterRepo(),
    )

    const result = await useCase.execute()
    expect(result[0].id).toBe("recent-conv")
    expect(result[1].id).toBe("old-conv")
  })
})
