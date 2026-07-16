import { describe, it, expect } from "vitest"

import { ArchiveConversationUseCase } from "./archive-conversation.use-case"
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

const activeConv = Conversation.create({
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
})

const archivedConv = Conversation.create({
  id: "conv-2",
  versionId: "ver-1",
  title: null,
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
})

const buildConversationRepo = (conversation: Conversation): ConversationRepository => ({
  create: async (c) => c,
  findById: async () => null,
  findByIdWithMessages: async () => ({
    conversation,
    messages: [
      Message.create({
        id: "msg-1",
        conversationId: conversation.id,
        role: "assistant",
        content: "Hello!",
        position: 0,
        alternatives: [],
        createdAt: now,
        editedAt: null,
      }),
    ],
  }),
  list: async () => [],
  update: async (c) => c,
})

const buildCharacterRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version }),
  findById: async () => ({ character, currentVersion: version }),
  list: async () => [],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => null,
  findVersionsByCharacterId: async () => [],
  findMaxVersionNumber: async () => 0,
  saveVersion: async (v) => v,
})

describe("ArchiveConversationUseCase", () => {
  it("archiva una conversación activa", async () => {
    const useCase = new ArchiveConversationUseCase(
      buildConversationRepo(activeConv),
      buildCharacterRepo(),
    )

    const result = await useCase.execute("conv-1", "archive")
    expect(result.status).toBe("archived")
  })

  it("lanza error si ya está archivada", async () => {
    const useCase = new ArchiveConversationUseCase(
      buildConversationRepo(archivedConv),
      buildCharacterRepo(),
    )

    await expect(
      useCase.execute("conv-2", "archive"),
    ).rejects.toThrow("is already archived")
  })

  it("desarchiva una conversación archivada", async () => {
    const useCase = new ArchiveConversationUseCase(
      buildConversationRepo(archivedConv),
      buildCharacterRepo(),
    )

    const result = await useCase.execute("conv-2", "unarchive")
    expect(result.status).toBe("active")
  })

  it("lanza error si ya está activa al desarchivar", async () => {
    const useCase = new ArchiveConversationUseCase(
      buildConversationRepo(activeConv),
      buildCharacterRepo(),
    )

    await expect(
      useCase.execute("conv-1", "unarchive"),
    ).rejects.toThrow("is already active")
  })

  it("lanza ConversationNotFoundError si no existe", async () => {
    const repo = buildConversationRepo(activeConv)
    repo.findByIdWithMessages = async () => null

    const useCase = new ArchiveConversationUseCase(repo, buildCharacterRepo())

    await expect(
      useCase.execute("nonexistent", "archive"),
    ).rejects.toThrow("Conversation with id 'nonexistent' not found.")
  })
})
