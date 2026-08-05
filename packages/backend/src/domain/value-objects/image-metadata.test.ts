import { describe, it, expect } from "vitest"

import { ImageMetadata } from "./image-metadata"

describe("ImageMetadata", () => {
  it("creates metadata for valid image", () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
    const meta = ImageMetadata.create("image/png", "png", pngBytes, 3 * 1024 * 1024)
    expect(meta.mime).toBe("image/png")
    expect(meta.extension).toBe("png")
    expect(meta.sizeBytes).toBe(10)
  })

  it("rejects empty file", () => {
    expect(() =>
      ImageMetadata.create("image/png", "png", Buffer.alloc(0), 3 * 1024 * 1024),
    ).toThrow("File is empty")
  })

  it("rejects oversized file", () => {
    expect(() =>
      ImageMetadata.create("image/png", "png", Buffer.from([0x89, 0x50, 0x4e, 0x47]), 1),
    ).toThrow("too large")
  })

  it("rejects mime mismatch", () => {
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(() =>
      ImageMetadata.create("image/jpeg", "jpg", pngBytes, 3 * 1024 * 1024),
    ).toThrow("does not match")
  })
})
