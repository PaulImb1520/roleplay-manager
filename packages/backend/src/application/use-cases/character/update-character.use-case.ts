import { v7 as randomUUIDv7 } from "uuid"

import type {
  CharacterDetail,
  UpdateCharacterInput,
} from "@workspace/shared/types/character"

import { CharacterCard } from "../../../domain/entities/character-card.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import {
  CharacterNotFoundError,
  CharacterValidationError,
  NoChangesDetectedError,
} from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class UpdateCharacterUseCase {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(
    id: string,
    input: UpdateCharacterInput,
  ): Promise<CharacterDetail> {
    const existing = await this.characterRepository.findById(id)

    if (!existing) {
      throw new CharacterNotFoundError(id)
    }

    const prevVersion = existing.currentVersion

    const newName = input.name ?? existing.character.name
    const newSubtitle = input.subtitle !== undefined ? input.subtitle : prevVersion.subtitle
    const newProfileImage = input.profileImage ?? prevVersion.profileImage
    const newDescription = input.description ?? prevVersion.description
    const newInstructions = input.instructions !== undefined ? input.instructions : prevVersion.instructions
    const newGreeting = input.greeting ?? prevVersion.greeting

    if (
      newName === existing.character.name &&
      newSubtitle === prevVersion.subtitle &&
      newProfileImage === prevVersion.profileImage &&
      newDescription === prevVersion.description &&
      newInstructions === prevVersion.instructions &&
      newGreeting === prevVersion.greeting &&
      input.cards === undefined
    ) {
      throw new NoChangesDetectedError()
    }

    if (input.cards?.some((c) => !c.title.trim() || !c.content.trim())) {
      throw new CharacterValidationError("Cards must have non-empty title and content")
    }

    const now = new Date()
    const updated = existing.character.withName(newName)
    await this.characterRepository.update(updated)

    const maxVersion = await this.characterRepository.findMaxVersionNumber(id)
    const newVersionNumber = maxVersion + 1
    const newVersionId = randomUUIDv7()

    const cards = (input.cards ?? prevVersion.cards.map((c) => ({
      id: c.id,
      title: c.title,
      content: c.content,
      position: c.position,
      active: c.active,
    }))).map((c, i) =>
      CharacterCard.create({
        id: randomUUIDv7(),
        versionId: newVersionId,
        title: c.title,
        content: c.content,
        position: i,
        active: c.active ?? true,
      }),
    )

    const newVersion = CharacterVersion.create({
      id: newVersionId,
      characterId: id,
      name: newName,
      subtitle: newSubtitle,
      profileImage: newProfileImage,
      description: newDescription,
      instructions: newInstructions,
      greeting: newGreeting,
      versionNumber: newVersionNumber,
      createdAt: now,
      cards,
    })

    await this.characterRepository.saveVersion(newVersion)

    const allVersions = await this.characterRepository.findVersionsByCharacterId(id)

    return {
      id: updated.id,
      name: updated.name,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      currentVersion: {
        id: newVersion.id,
        characterId: newVersion.characterId,
        name: newVersion.name,
        subtitle: newVersion.subtitle,
        profileImage: newVersion.profileImage,
        description: newVersion.description,
        instructions: newVersion.instructions,
        greeting: newVersion.greeting,
        versionNumber: newVersion.versionNumber,
        createdAt: newVersion.createdAt.toISOString(),
        cards: newVersion.cards.map((c) => ({
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
