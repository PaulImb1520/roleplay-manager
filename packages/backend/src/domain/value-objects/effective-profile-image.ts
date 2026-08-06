import type { CharacterAssetRepository } from "../ports/character-asset.repository"

/**
 * Resolves the profile image to display for a conversation.
 *
 * A conversation may carry a per-conversation override
 * (`customProfileImageAssetId`). When set and still valid (the asset row
 * exists), it wins; otherwise fall back to the character's profile image.
 */
export async function resolveEffectiveProfileImageAssetId(
  customProfileImageAssetId: string | null,
  characterProfileImageAssetId: string | null,
  assetRepository: CharacterAssetRepository,
): Promise<string | null> {
  if (customProfileImageAssetId) {
    const asset = await assetRepository.findById(customProfileImageAssetId)
    if (asset) return customProfileImageAssetId
  }
  return characterProfileImageAssetId
}