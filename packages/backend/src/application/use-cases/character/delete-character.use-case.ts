import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { CharacterNotFoundError } from "../../../domain/errors"

export class DeleteCharacterUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.characterRepository.findById(id)
    if (!existing) {
      throw new CharacterNotFoundError(id)
    }

    await this.characterRepository.delete(id)
  }
}
