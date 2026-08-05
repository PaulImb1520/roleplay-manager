import type { Readable } from "node:stream"

import type { CharacterAssetRepository, CharacterAssetStorage } from "../../../domain/ports/character-asset.repository"
import { CharacterAssetNotFoundError } from "../../../domain/errors"

export interface GetCharacterAssetInput {
  assetId: string
}

export interface GetCharacterAssetResult {
  asset: {
    id: string
    characterId: string
    mimeType: string
    sizeBytes: number
  }
  stream: Readable
}

export class GetCharacterAssetUseCase {
  constructor(
    private readonly assetRepository: CharacterAssetRepository,
    private readonly assetStorage: CharacterAssetStorage,
  ) {}

  async execute(input: GetCharacterAssetInput): Promise<GetCharacterAssetResult> {
    const asset = await this.assetRepository.findById(input.assetId)
    if (!asset) {
      throw new CharacterAssetNotFoundError(input.assetId)
    }

    const stream = await this.assetStorage.read(
      asset.characterId,
      asset.id,
      asset.extension,
    )

    return {
      asset: {
        id: asset.id,
        characterId: asset.characterId,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
      },
      stream,
    }
  }
}
