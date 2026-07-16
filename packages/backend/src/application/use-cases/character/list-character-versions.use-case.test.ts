import { describe, it, expect } from "vitest"

import { ListCharacterVersionsUseCase } from "./list-character-versions.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import { CharacterCard } from "../../../domain/entities/character-card.entity"

const now = new Date()
const card = CharacterCard.create({
  id: "card-1", versionId: "v1", title: "Card",
  content: "Content", position: 0, active: true,
})
const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const v1 = CharacterVersion.create({
  id: "v1", characterId: "char-1", name: "Test v1", subtitle: null,
  profileImage: "img.png", description: "Desc", instructions: null,
  greeting: "Hi",
  versionNumber: 1, createdAt: now, cards: [card],
})
const v2 = CharacterVersion.create({
  id: "v2", characterId: "char-1", name: "Test v2", subtitle: "updated",
  profileImage: "img.png", description: "Desc", instructions: null,
  greeting: "Hey",
  versionNumber: 2, createdAt: new Date(now.getTime() + 1000), cards: [],
})

const buildRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version: v1 }),
  findById: async (id) =>
    id === "char-1" ? { character, currentVersion: v2 } : null,
  list: async () => [character],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => null,
  findVersionsByCharacterId: async () => [v1, v2],
  findMaxVersionNumber: async () => 2,
  saveVersion: async (v) => v,
})

describe("ListCharacterVersionsUseCase", () => {
  it("retorna todas las versiones del personaje", async () => {
    const useCase = new ListCharacterVersionsUseCase(buildRepo())
    const result = await useCase.execute("char-1")

    expect(result).toHaveLength(2)
    expect(result[0].versionNumber).toBe(1)
    expect(result[1].versionNumber).toBe(2)
    expect(result[0].cards).toHaveLength(1)
  })

  it("lanza CharacterNotFoundError si no existe", async () => {
    const useCase = new ListCharacterVersionsUseCase(buildRepo())
    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Character with id 'nonexistent' not found.",
    )
  })
})
