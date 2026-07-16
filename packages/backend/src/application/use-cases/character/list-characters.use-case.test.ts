import { describe, it, expect } from "vitest"

import { ListCharactersUseCase } from "./list-characters.use-case"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"

const now = new Date()
const char1 = Character.create({ id: "c1", name: "Alpha", createdAt: now, updatedAt: now })
const char2 = Character.create({ id: "c2", name: "Beta", createdAt: now, updatedAt: now })
const ver1 = CharacterVersion.create({
  id: "v1", characterId: "c1", name: "Alpha", subtitle: "Sub",
  profileImage: "img.png", description: "Desc", instructions: null,
  greeting: "Hi",
  versionNumber: 1, createdAt: now, cards: [],
})
const ver2 = CharacterVersion.create({
  id: "v2", characterId: "c2", name: "Beta", subtitle: null,
  profileImage: "img2.png", description: "Desc2", instructions: null,
  greeting: "Hey",
  versionNumber: 1, createdAt: now, cards: [],
})

const buildRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character: char1, version: ver1 }),
  findById: async (id) => {
    if (id === "c1") return { character: char1, currentVersion: ver1 }
    if (id === "c2") return { character: char2, currentVersion: ver2 }
    return null
  },
  list: async () => [char1, char2],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => null,
  findVersionsByCharacterId: async () => [],
  findMaxVersionNumber: async () => 0,
  saveVersion: async (v) => v,
})

describe("ListCharactersUseCase", () => {
  it("retorna lista de CharacterSummary", async () => {
    const useCase = new ListCharactersUseCase(buildRepo())
    const result = await useCase.execute()

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("Alpha")
    expect(result[0].subtitle).toBe("Sub")
    expect(result[1].name).toBe("Beta")
    expect(result[1].subtitle).toBeNull()
  })

  it("retorna lista vacia si no hay personajes", async () => {
    const emptyRepo: CharacterRepository = {
      createWithFirstVersion: async () => ({ character: char1, version: ver1 }),
      findById: async () => null,
      list: async () => [],
      update: async (c) => c,
      delete: async () => {},
      findVersionById: async () => null,
      findVersionsByCharacterId: async () => [],
      findMaxVersionNumber: async () => 0,
      saveVersion: async (v) => v,
    }
    const useCase = new ListCharactersUseCase(emptyRepo)
    expect(await useCase.execute()).toEqual([])
  })
})
