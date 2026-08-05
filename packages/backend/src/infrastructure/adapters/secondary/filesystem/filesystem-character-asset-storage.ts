import { createReadStream } from "node:fs"
import { mkdir, writeFile, unlink, access } from "node:fs/promises"
import { join, dirname } from "node:path"
import { Readable } from "node:stream"

import type { CharacterAssetStorage } from "../../../../domain/ports/character-asset.repository"
import { CharacterAssetValidationError } from "../../../../domain/errors"

export class FilesystemCharacterAssetStorage implements CharacterAssetStorage {
  private readonly root: string

  constructor(root: string) {
    this.root = root
  }

  resolvePath(characterId: string, assetId: string, extension: string): string {
    this.validatePath(characterId, assetId, extension)
    return join(this.root, characterId, `${assetId}.${extension}`)
  }

  async write(
    characterId: string,
    assetId: string,
    extension: string,
    data: Buffer,
  ): Promise<void> {
    const filePath = this.resolvePath(characterId, assetId, extension)
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, data)
  }

  async read(
    characterId: string,
    assetId: string,
    extension: string,
  ): Promise<Readable> {
    const filePath = this.resolvePath(characterId, assetId, extension)
    try {
      await access(filePath)
    } catch {
      throw new CharacterAssetValidationError("Asset file not found on disk")
    }
    return createReadStream(filePath)
  }

  async delete(
    characterId: string,
    assetId: string,
    extension: string,
  ): Promise<void> {
    const filePath = this.resolvePath(characterId, assetId, extension)
    try {
      await access(filePath)
      await unlink(filePath)
    } catch {
      // File may not exist — idempotent delete
    }
  }

  private validatePath(characterId: string, assetId: string, extension: string): void {
    const parts = [characterId, assetId, extension]
    for (const part of parts) {
      if (part.includes("..") || part.includes("/") || part.includes("\\")) {
        throw new CharacterAssetValidationError("Invalid path component")
      }
    }
  }
}
