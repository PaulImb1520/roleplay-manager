import { v7 as randomUUIDv7 } from "uuid"

import type { CharacterAssetRepository, CharacterAssetStorage } from "../../../domain/ports/character-asset.repository"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import {
  ConversationNotFoundError,
  CharacterAssetValidationError,
} from "../../../domain/errors"
import { mimeToExtension, isAllowedImageMime } from "@workspace/shared/lib/image"
import { ImageMetadata } from "../../../domain/value-objects/image-metadata"

export interface UploadConversationCustomImageInput {
  conversationId: string
  mimeType: string
  sizeBytes: number
  data: Buffer
}

export interface UploadConversationCustomImageResult {
  assetId: string
  characterId: string
  mimeType: string
  sizeBytes: number
}

export class UploadConversationCustomImageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly assetRepository: CharacterAssetRepository,
    private readonly assetStorage: CharacterAssetStorage,
    private readonly maxBytes: number,
  ) {}

  async execute(
    input: UploadConversationCustomImageInput,
  ): Promise<UploadConversationCustomImageResult> {
    const conv = await this.conversationRepository.findById(input.conversationId)
    if (!conv) {
      throw new ConversationNotFoundError(input.conversationId)
    }

    if (!isAllowedImageMime(input.mimeType)) {
      throw new CharacterAssetValidationError(
        `Mime type '${input.mimeType}' is not allowed. Allowed: png, jpeg, webp, gif`,
      )
    }

    const extension = mimeToExtension(input.mimeType)
    if (!extension) {
      throw new CharacterAssetValidationError(
        `Cannot determine extension for mime '${input.mimeType}'`,
      )
    }

    const metadata = ImageMetadata.create(
      input.mimeType,
      extension,
      input.data,
      this.maxBytes,
    )

    const version = await this.characterRepository.findVersionById(conv.versionId)
    const characterId = version?.characterId
    if (!characterId) {
      throw new ConversationNotFoundError(input.conversationId)
    }

    const assetId = randomUUIDv7()
    await this.assetStorage.write(characterId, assetId, extension, input.data)

    const now = new Date()
    await this.assetRepository.create({
      id: assetId,
      characterId,
      mimeType: metadata.mime,
      sizeBytes: metadata.sizeBytes,
      extension: metadata.extension,
      createdAt: now,
    })

    return {
      assetId,
      characterId,
      mimeType: metadata.mime,
      sizeBytes: metadata.sizeBytes,
    }
  }
}