import { describe, it, expect } from "vitest"

import { CreateCharacterUseCase } from "./create-character.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"

const buildRepo = (): CharacterRepository => ({
  createWithFirstVersion: async (c, v) => ({ character: c, version: v }),
  findById: async () => null,
  list: async () => [],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => null,
  findVersionsByCharacterId: async () => [],
  findMaxVersionNumber: async () => 0,
  saveVersion: async (v) => v,
})

describe("CreateCharacterUseCase", () => {
  it("crea un personaje con version 1 y retorna CharacterDetail", async () => {
    const useCase = new CreateCharacterUseCase(buildRepo())

    const result = await useCase.execute({
      name: "Test Character",
      subtitle: "A test",
      profileImage: "https://example.com/avatar.png",
      description: "A test character",
      greeting: "Hello!",
      cards: [
        { title: "Card 1", content: "Content 1" },
        { title: "Card 2", content: "Content 2", active: false },
      ],
    })

    expect(result.name).toBe("Test Character")
    expect(result.currentVersion.versionNumber).toBe(1)
    expect(result.currentVersion.cards).toHaveLength(2)
    expect(result.currentVersion.cards[0].title).toBe("Card 1")
    expect(result.currentVersion.cards[0].position).toBe(0)
    expect(result.currentVersion.cards[1].active).toBe(false)
  })

  it("crea con valores minimos (sin cards, sin subtitle)", async () => {
    const useCase = new CreateCharacterUseCase(buildRepo())

    const result = await useCase.execute({
      name: "Minimal",
      profileImage: "https://example.com/avatar.png",
      description: "Desc",
      greeting: "Hi",
    })

    expect(result.currentVersion.subtitle).toBeNull()
    expect(result.currentVersion.cards).toHaveLength(0)
  })

  it("rechaza cards con titulo vacio", async () => {
    const useCase = new CreateCharacterUseCase(buildRepo())

    await expect(
      useCase.execute({
        name: "Bad",
        profileImage: "https://example.com/avatar.png",
        description: "Desc",
        greeting: "Hi",
        cards: [{ title: "", content: "something" }],
      }),
    ).rejects.toThrow("Cards must have non-empty title and content")
  })
})
