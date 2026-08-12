import type {
  CharacterDetail,
  CharacterVersionDTO,
  CharacterCardDTO,
} from "@workspace/shared/types/character"

import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { CharacterAssetRepository } from "../../../domain/ports/character-asset.repository"
import type { CharacterVersion } from "../../../domain/entities/character-version.entity"
import type { CharacterCard } from "../../../domain/entities/character-card.entity"
import {
  CharacterAssetNotFoundError,
  CharacterNotFoundError,
} from "../../../domain/errors"

export class UpdateCharacterProfileImageUseCase {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly assetRepository: CharacterAssetRepository,
  ) {}

  async execute(
    id: string,
    profileImageAssetId: string | null,
  ): Promise<CharacterDetail> {
    const existing = await this.characterRepository.findById(id)

    if (!existing) {
      throw new CharacterNotFoundError(id)
    }

    if (profileImageAssetId !== null) {
      const asset = await this.assetRepository.findById(profileImageAssetId)
      if (!asset) {
        throw new CharacterAssetNotFoundError(profileImageAssetId)
      }
    }

    await this.characterRepository.updateProfileImageAssetId(
      existing.currentVersion.id,
      profileImageAssetId,
    )

    const result = await this.characterRepository.findById(id)
    const allVersions = await this.characterRepository.findVersionsByCharacterId(id)
    const currentVersion = result?.currentVersion ?? existing.currentVersion

    return {
      id: existing.character.id,
      name: existing.character.name,
      createdAt: existing.character.createdAt.toISOString(),
      updatedAt: existing.character.updatedAt.toISOString(),
      currentVersion: toVersionDTO(currentVersion),
      versions: allVersions.map(toVersionDTO),
    }
  }
}

function toVersionDTO(v: CharacterVersion): CharacterVersionDTO {
  return {
    id: v.id,
    characterId: v.characterId,
    name: v.name,
    subtitle: v.subtitle,
    profileImageAssetId: v.profileImageAssetId,
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
