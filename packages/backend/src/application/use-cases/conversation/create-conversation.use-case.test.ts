import { describe, it, expect } from "vitest"

import { CreateConversationUseCase } from "./create-conversation.use-case"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
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

const buildConversationRepo = (): ConversationRepository => ({
  create: async (c) => c,
  findById: async () => null,
  findByIdWithMessages: async () => null,
  list: async () => [],
  update: async (c) => c,
})

const buildMessageRepo = (): MessageRepository => ({
  create: async (m) => m,
  findByConversationId: async () => [],
  findLastByConversationId: async () => null,
})

describe("CreateConversationUseCase", () => {
  it("crea conversación con greeting del personaje", async () => {
    const useCase = new CreateConversationUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
    )

    const result = await useCase.execute({ characterId: "char-1" })

    expect(result.characterName).toBe("Test")
    expect(result.status).toBe("active")
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0].role).toBe("assistant")
    expect(result.messages[0].content).toBe("Hello!")
    expect(result.messages[0].position).toBe(0)
  })

  it("lanza CharacterNotFoundError si el personaje no existe", async () => {
    const repo = buildCharacterRepo()
    repo.findById = async () => null

    const useCase = new CreateConversationUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      repo,
    )

    await expect(
      useCase.execute({ characterId: "nonexistent" }),
    ).rejects.toThrow("Character with id 'nonexistent' not found.")
  })
})
