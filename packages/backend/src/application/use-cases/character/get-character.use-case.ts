import type { CharacterDetail } from "@workspace/shared/types/character"

import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { CharacterNotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class GetCharacterUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(id: string): Promise<CharacterDetail> {
    const result = await this.characterRepository.findById(id)

    if (!result) {
      throw new CharacterNotFoundError(id)
    }

    const allVersions = await this.characterRepository.findVersionsByCharacterId(id)

    return {
      id: result.character.id,
      name: result.character.name,
      createdAt: result.character.createdAt.toISOString(),
      updatedAt: result.character.updatedAt.toISOString(),
      currentVersion: {
        id: result.currentVersion.id,
        characterId: result.currentVersion.characterId,
        name: result.currentVersion.name,
        subtitle: result.currentVersion.subtitle,
        profileImage: result.currentVersion.profileImage,
        description: result.currentVersion.description,
        instructions: result.currentVersion.instructions,
        greeting: result.currentVersion.greeting,
        versionNumber: result.currentVersion.versionNumber,
        createdAt: result.currentVersion.createdAt.toISOString(),
        cards: result.currentVersion.cards.map((c) => ({
          id: c.id,
          versionId: c.versionId,
          title: c.title,
          content: c.content,
          position: c.position,
          active: c.active,
        })),
      },
      versions: allVersions.map((v) => ({
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
      })),
    }
  }
}
