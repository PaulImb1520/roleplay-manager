import { describe, it, expect } from "vitest"

import { GetConversationUseCase } from "./get-conversation.use-case"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
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
  findByIdWithMessages: async () => {
    const now = new Date()
    return {
      conversation: Conversation.create({
        id: "conv-1",
        versionId: "ver-1",
        title: null,
        status: "active",
        model: null,
        provider: null,
        providerInstanceId: null,
        recentMessageCount: 15,
        summaryFrequency: 15,
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
      messages: [
        Message.create({
          id: "msg-1",
          conversationId: "conv-1",
          role: "assistant",
          content: "Hello!",
          position: 0,
          alternatives: [],
          alternativesCursor: 0,
          createdAt: now,
          editedAt: null,
        }),
      ],
    }
  },
  list: async () => [],
  update: async (c) => c,
  updateSettings: async (_id: string, _settings: any) => ({} as Conversation),
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

describe("GetConversationUseCase", () => {
  it("retorna conversación con mensajes", async () => {
    const useCase = new GetConversationUseCase(
      buildConversationRepo(),
      buildCharacterRepo(),
    )

    const result = await useCase.execute("conv-1")

    expect(result.id).toBe("conv-1")
    expect(result.characterName).toBe("Test")
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0].content).toBe("Hello!")
  })

  it("lanza ConversationNotFoundError si no existe", async () => {
    const repo = buildConversationRepo()
    repo.findByIdWithMessages = async () => null

    const useCase = new GetConversationUseCase(repo, buildCharacterRepo())

    await expect(
      useCase.execute("nonexistent"),
    ).rejects.toThrow("Conversation with id 'nonexistent' not found.")
  })
})
