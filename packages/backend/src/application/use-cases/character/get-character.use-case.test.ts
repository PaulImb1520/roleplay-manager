import { describe, it, expect } from "vitest"

import { GetCharacterUseCase } from "./get-character.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import { CharacterCard } from "../../../domain/entities/character-card.entity"

const now = new Date()
const card = CharacterCard.create({
  id: "card-1",
  versionId: "ver-1",
  title: "Card",
  content: "Content",
  position: 0,
  active: true,
})
const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "ver-1",
  characterId: "char-1",
  name: "Test",
  subtitle: null,
  profileImage: "img.png",
  description: "Desc",
  instructions: null,
  greeting: "Hi",
  versionNumber: 1,
  createdAt: now,
  cards: [card],
})

const buildRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version }),
  findById: async (id) =>
    id === "char-1" ? { character, currentVersion: version } : null,
  list: async () => [character],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => version,
  findVersionsByCharacterId: async () => [version],
  findMaxVersionNumber: async () => 1,
  saveVersion: async (v) => v,
})

describe("GetCharacterUseCase", () => {
  it("retorna el personaje con su version actual", async () => {
    const useCase = new GetCharacterUseCase(buildRepo())
    const result = await useCase.execute("char-1")

    expect(result.id).toBe("char-1")
    expect(result.currentVersion.versionNumber).toBe(1)
    expect(result.currentVersion.cards).toHaveLength(1)
  })

  it("lanza CharacterNotFoundError si no existe", async () => {
    const useCase = new GetCharacterUseCase(buildRepo())
    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Character with id 'nonexistent' not found.",
    )
  })
})
