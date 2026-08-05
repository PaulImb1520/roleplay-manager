import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { GetCharacterAssetUseCase } from "./get-character-asset.use-case"
import { FilesystemCharacterAssetStorage } from "../../../infrastructure/adapters/secondary/filesystem/filesystem-character-asset-storage"
import type { CharacterAssetRepository } from "../../../domain/ports/character-asset.repository"

describe("GetCharacterAssetUseCase", () => {
  let tempDir: string
  let storage: FilesystemCharacterAssetStorage

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "get-asset-test-"))
    storage = new FilesystemCharacterAssetStorage(tempDir)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it("returns the asset stream and metadata", async () => {
    const assetDir = join(tempDir, "char-1")
    await import("node:fs/promises").then((fs) => fs.mkdir(assetDir, { recursive: true }))
    await writeFile(join(assetDir, "asset-1.png"), "image data")

    const assetRepo: CharacterAssetRepository = {
      create: async () => {},
      findById: async (id) => {
        if (id === "asset-1") {
          return {
            id: "asset-1",
            characterId: "char-1",
            mimeType: "image/png",
            sizeBytes: 10,
            extension: "png",
            createdAt: new Date(),
          }
        }
        return null
      },
      findByCharacterId: async () => [],
      deleteById: async () => {},
    }

    const useCase = new GetCharacterAssetUseCase(assetRepo, storage)
    const result = await useCase.execute({ assetId: "asset-1" })

    expect(result.asset.mimeType).toBe("image/png")
    expect(result.asset.sizeBytes).toBe(10)

    const chunks: Buffer[] = []
    for await (const chunk of result.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    expect(Buffer.concat(chunks).toString()).toBe("image data")
  })

  it("throws if asset not found", async () => {
    const assetRepo: CharacterAssetRepository = {
      create: async () => {},
      findById: async () => null,
      findByCharacterId: async () => [],
      deleteById: async () => {},
    }

    const useCase = new GetCharacterAssetUseCase(assetRepo, storage)
    await expect(useCase.execute({ assetId: "nonexistent" })).rejects.toThrow("not found")
  })
})
