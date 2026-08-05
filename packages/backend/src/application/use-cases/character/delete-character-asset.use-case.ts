import type { CharacterAssetRepository, CharacterAssetStorage } from "../../../domain/ports/character-asset.repository"
import { CharacterAssetNotFoundError } from "../../../domain/errors"

export class DeleteCharacterAssetUseCase {
  constructor(
    private readonly assetRepository: CharacterAssetRepository,
    private readonly assetStorage: CharacterAssetStorage,
  ) {}

  async execute(assetId: string): Promise<void> {
    const asset = await this.assetRepository.findById(assetId)
    if (!asset) {
      throw new CharacterAssetNotFoundError(assetId)
    }

    await this.assetStorage.delete(asset.characterId, asset.id, asset.extension)
    await this.assetRepository.deleteById(asset.id)
  }
}
