import { eq } from "drizzle-orm"

import type { CharacterAssetRepository, CharacterAssetMetadata } from "../../../../../domain/ports/character-asset.repository"
import type { Database } from "../../../../config/database"
import { characterAssets } from "../schema"

const toMetadata = (row: typeof characterAssets.$inferSelect): CharacterAssetMetadata => ({
  id: row.id,
  characterId: row.characterId,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  extension: row.extension,
  createdAt: new Date(row.createdAt),
})

export class DrizzleCharacterAssetRepository implements CharacterAssetRepository {
  constructor(private readonly db: Database) {}

  async create(metadata: CharacterAssetMetadata): Promise<void> {
    await this.db.insert(characterAssets).values({
      id: metadata.id,
      characterId: metadata.characterId,
      mimeType: metadata.mimeType,
      sizeBytes: metadata.sizeBytes,
      extension: metadata.extension,
      createdAt: metadata.createdAt,
    })
  }

  async findById(id: string): Promise<CharacterAssetMetadata | null> {
    const rows = await this.db
      .select()
      .from(characterAssets)
      .where(eq(characterAssets.id, id))
      .limit(1)

    return rows.length > 0 ? toMetadata(rows[0]) : null
  }

  async findByCharacterId(characterId: string): Promise<CharacterAssetMetadata[]> {
    const rows = await this.db
      .select()
      .from(characterAssets)
      .where(eq(characterAssets.characterId, characterId))

    return rows.map(toMetadata)
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(characterAssets).where(eq(characterAssets.id, id))
  }
}
