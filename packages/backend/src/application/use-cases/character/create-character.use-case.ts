import { v7 as randomUUIDv7 } from "uuid"

import type {
  CreateCharacterInput,
  CharacterDetail,
  CharacterVersionDTO,
  CharacterCardDTO,
} from "@workspace/shared/types/character"

import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import { CharacterCard } from "../../../domain/entities/character-card.entity"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { CharacterValidationError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class CreateCharacterUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(input: CreateCharacterInput): Promise<CharacterDetail> {
    if (input.cards?.some((c) => !c.title.trim() || !c.content.trim())) {
      throw new CharacterValidationError("Cards must have non-empty title and content")
    }

    const now = new Date()
    const characterId = randomUUIDv7()

    const character = Character.create({
      id: characterId,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    })

    const versionId = randomUUIDv7()
    const cards = (input.cards ?? []).map((c, i) =>
      CharacterCard.create({
        id: randomUUIDv7(),
        versionId,
        title: c.title,
        content: c.content,
        position: i,
        active: c.active ?? true,
      }),
    )

    const version = CharacterVersion.create({
      id: versionId,
      characterId,
      name: input.name,
      subtitle: input.subtitle ?? null,
      profileImage: input.profileImage,
      description: input.description,
      instructions: input.instructions ?? null,
      greeting: input.greeting,
      versionNumber: 1,
      createdAt: now,
      cards,
    })

    const result = await this.characterRepository.createWithFirstVersion(character, version)

    return toCharacterDetail(result.character, result.version, [result.version])
  }
}

function toCharacterDetail(
  character: Character,
  currentVersion: CharacterVersion,
  allVersions: CharacterVersion[],
): CharacterDetail {
  return {
    id: character.id,
    name: character.name,
    createdAt: character.createdAt.toISOString(),
    updatedAt: character.updatedAt.toISOString(),
    currentVersion: toVersionDTO(currentVersion),
    versions: allVersions.map(toVersionDTO),
  }
}

function toVersionDTO(v: CharacterVersion): CharacterVersionDTO {
  return {
    id: v.id,
    characterId: v.characterId,
    name: v.name,
    subtitle: v.subtitle,
    profileImage: v.profileImage,
    description: v.description,
    instructions: v.instructions,
    greeting: v.greeting,
    versionNumber: v.versionNumber,
    createdAt: v.createdAt.toISOString(),
    cards: v.cards.map(toCardDTO),
  }
}

function toCardDTO(c: CharacterCard): CharacterCardDTO {
  return {
    id: c.id,
    versionId: c.versionId,
    title: c.title,
    content: c.content,
    position: c.position,
    active: c.active,
  }
}
