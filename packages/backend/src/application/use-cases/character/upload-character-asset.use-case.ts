import { v7 as randomUUIDv7 } from "uuid"

import type { CharacterAssetRepository, CharacterAssetStorage } from "../../../domain/ports/character-asset.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import { CharacterNotFoundError, CharacterAssetValidationError } from "../../../domain/errors"
import { mimeToExtension, isAllowedImageMime } from "@workspace/shared/lib/image"
import { ImageMetadata } from "../../../domain/value-objects/image-metadata"

export interface UploadCharacterAssetInput {
  characterId: string
  mimeType: string
  sizeBytes: number
  data: Buffer
}

export interface UploadCharacterAssetResult {
  assetId: string
  characterId: string
  mimeType: string
  sizeBytes: number
}

export class UploadCharacterAssetUseCase {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly assetRepository: CharacterAssetRepository,
    private readonly assetStorage: CharacterAssetStorage,
    private readonly maxBytes: number,
  ) {}

  async execute(input: UploadCharacterAssetInput): Promise<UploadCharacterAssetResult> {
    const character = await this.characterRepository.findById(input.characterId)
    if (!character) {
      throw new CharacterNotFoundError(input.characterId)
    }

    if (!isAllowedImageMime(input.mimeType)) {
      throw new CharacterAssetValidationError(
        `Mime type '${input.mimeType}' is not allowed. Allowed: png, jpeg, webp, gif`,
      )
    }

    const extension = mimeToExtension(input.mimeType)
    if (!extension) {
      throw new CharacterAssetValidationError(`Cannot determine extension for mime '${input.mimeType}'`)
    }

    const metadata = ImageMetadata.create(input.mimeType, extension, input.data, this.maxBytes)
    const assetId = randomUUIDv7()

    await this.assetStorage.write(input.characterId, assetId, extension, input.data)

    const now = new Date()
    await this.assetRepository.create({
      id: assetId,
      characterId: input.characterId,
      mimeType: metadata.mime,
      sizeBytes: metadata.sizeBytes,
      extension: metadata.extension,
      createdAt: now,
    })

    return {
      assetId,
      characterId: input.characterId,
      mimeType: metadata.mime,
      sizeBytes: metadata.sizeBytes,
    }
  }
}
