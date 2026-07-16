import { describe, it, expect, vi } from "vitest"

import { DeleteCharacterUseCase } from "./delete-character.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"

const now = new Date()
const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "v1", characterId: "char-1", name: "Test", subtitle: null,
  profileImage: "img.png", description: "Desc", instructions: null,
  greeting: "Hi",
  versionNumber: 1, createdAt: now, cards: [],
})

describe("DeleteCharacterUseCase", () => {
  it("elimina el personaje si existe", async () => {
    const deleteMock = vi.fn()
    const repo: CharacterRepository = {
      createWithFirstVersion: async () => ({ character, version }),
      findById: async (id) =>
        id === "char-1" ? { character, currentVersion: version } : null,
      list: async () => [character],
      update: async (c) => c,
      delete: deleteMock,
      findVersionById: async () => null,
      findVersionsByCharacterId: async () => [],
      findMaxVersionNumber: async () => 0,
      saveVersion: async (v) => v,
    }

    const useCase = new DeleteCharacterUseCase(repo)
    await useCase.execute("char-1")
    expect(deleteMock).toHaveBeenCalledWith("char-1")
  })

  it("lanza CharacterNotFoundError si no existe", async () => {
    const repo: CharacterRepository = {
      createWithFirstVersion: async () => ({ character, version }),
      findById: async () => null,
      list: async () => [],
      update: async (c) => c,
      delete: async () => {},
      findVersionById: async () => null,
      findVersionsByCharacterId: async () => [],
      findMaxVersionNumber: async () => 0,
      saveVersion: async (v) => v,
    }

    const useCase = new DeleteCharacterUseCase(repo)
    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Character with id 'nonexistent' not found.",
    )
  })
})
