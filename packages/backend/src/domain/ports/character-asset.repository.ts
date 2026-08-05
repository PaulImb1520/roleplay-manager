import type { Readable } from "node:stream"

export interface CharacterAssetMetadata {
  id: string
  characterId: string
  mimeType: string
  sizeBytes: number
  extension: string
  createdAt: Date
}

export interface CharacterAssetRepository {
  create(metadata: CharacterAssetMetadata): Promise<void>
  findById(id: string): Promise<CharacterAssetMetadata | null>
  findByCharacterId(characterId: string): Promise<CharacterAssetMetadata[]>
  deleteById(id: string): Promise<void>
}

export interface CharacterAssetStorage {
  write(characterId: string, assetId: string, extension: string, data: Buffer): Promise<void>
  read(characterId: string, assetId: string, extension: string): Promise<Readable>
  delete(characterId: string, assetId: string, extension: string): Promise<void>
  resolvePath(characterId: string, assetId: string, extension: string): string
}
