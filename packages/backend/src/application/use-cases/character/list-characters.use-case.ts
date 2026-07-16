import type { CharacterSummary } from "@workspace/shared/types/character"

import type { CharacterRepository } from "../../../domain/ports/character.repository"

export class ListCharactersUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(): Promise<CharacterSummary[]> {
    const characters = await this.characterRepository.list()
    const summaries: CharacterSummary[] = []

    for (const character of characters) {
      const result = await this.characterRepository.findById(character.id)
      if (result) {
        summaries.push({
          id: character.id,
          name: character.name,
          subtitle: result.currentVersion.subtitle,
          profileImage: result.currentVersion.profileImage,
          versionNumber: result.currentVersion.versionNumber,
          createdAt: character.createdAt.toISOString(),
          updatedAt: character.updatedAt.toISOString(),
        })
      }
    }

    return summaries
  }
}
