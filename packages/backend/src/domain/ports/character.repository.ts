import type { Character } from "../entities/character.entity"
import type { CharacterVersion } from "../entities/character-version.entity"

export interface CreateCharacterWithVersionResult {
  character: Character
  version: CharacterVersion
}

export interface CharacterRepository {
  createWithFirstVersion(character: Character, version: CharacterVersion): Promise<CreateCharacterWithVersionResult>

  findById(id: string): Promise<{ character: Character; currentVersion: CharacterVersion } | null>

  list(): Promise<Character[]>

  update(character: Character): Promise<Character>

  delete(id: string): Promise<void>

  findVersionById(id: string): Promise<CharacterVersion | null>

  findVersionsByCharacterId(characterId: string): Promise<CharacterVersion[]>

  findMaxVersionNumber(characterId: string): Promise<number>

  saveVersion(version: CharacterVersion): Promise<CharacterVersion>
}
