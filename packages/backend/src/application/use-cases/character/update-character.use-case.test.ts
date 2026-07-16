import { describe, it, expect } from "vitest"

import { UpdateCharacterUseCase } from "./update-character.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import { CharacterCard } from "../../../domain/entities/character-card.entity"

const now = new Date()
const card = CharacterCard.create({
  id: "card-1", versionId: "ver-1", title: "Old Card",
  content: "Old content", position: 0, active: true,
})
const character = Character.create({ id: "char-1", name: "Original", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "ver-1", characterId: "char-1", name: "Original",
  subtitle: "sub", profileImage: "img.png", description: "desc",
  instructions: "instr", greeting: "hi", versionNumber: 1, createdAt: now, cards: [card],
})

let savedVersion: CharacterVersion | null = null

const buildRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version }),
  findById: async (id) =>
    id === "char-1" ? { character, currentVersion: version } : null,
  list: async () => [character],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => null,
  findVersionsByCharacterId: async () =>
    savedVersion ? [version, savedVersion] : [version],
  findMaxVersionNumber: async () => 1,
  saveVersion: async (v) => {
    savedVersion = v
    return v
  },
})

describe("UpdateCharacterUseCase", () => {
  it("crea nueva version al cambiar el nombre", async () => {
    savedVersion = null
    const useCase = new UpdateCharacterUseCase(buildRepo())
    const result = await useCase.execute("char-1", { name: "Updated" })

    expect(result.name).toBe("Updated")
    expect(result.currentVersion.versionNumber).toBe(2)
    expect(result.currentVersion.name).toBe("Updated")
    expect(result.versions).toHaveLength(2)
  })

  it("lanza NoChangesDetectedError si no hay cambios", async () => {
    savedVersion = null
    const useCase = new UpdateCharacterUseCase(buildRepo())

    await expect(
      useCase.execute("char-1", {}),
    ).rejects.toThrow("No changes detected for the character.")
  })

  it("lanza CharacterNotFoundError si no existe", async () => {
    savedVersion = null
    const useCase = new UpdateCharacterUseCase(buildRepo())

    await expect(
      useCase.execute("nonexistent", { name: "X" }),
    ).rejects.toThrow("Character with id 'nonexistent' not found.")
  })
})
