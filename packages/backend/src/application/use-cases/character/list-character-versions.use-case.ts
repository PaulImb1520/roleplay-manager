import type { CharacterVersionDTO } from "@workspace/shared/types/character"

import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { CharacterNotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class ListCharacterVersionsUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(characterId: string): Promise<CharacterVersionDTO[]> {
    const existing = await this.characterRepository.findById(characterId)
    if (!existing) {
      throw new CharacterNotFoundError(characterId)
    }

    const versions = await this.characterRepository.findVersionsByCharacterId(characterId)

    return versions.map((v) => ({
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
      cards: v.cards.map((c) => ({
        id: c.id,
        versionId: c.versionId,
        title: c.title,
        content: c.content,
        position: c.position,
        active: c.active,
      })),
    }))
  }
}
