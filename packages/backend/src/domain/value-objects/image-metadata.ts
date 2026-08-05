import { validateImageBytes } from "@workspace/shared/lib/image"
import { CharacterValidationError } from "../errors"

export class ImageMetadata {
  private constructor(
    readonly mime: string,
    readonly extension: string,
    readonly sizeBytes: number,
  ) {}

  static create(
    mime: string,
    extension: string,
    data: Buffer,
    maxBytes: number,
  ): ImageMetadata {
    const result = validateImageBytes(new Uint8Array(data), mime, maxBytes)
    if (!result.ok) {
      throw new CharacterValidationError(result.reason)
    }
    return new ImageMetadata(result.mime, extension, data.length)
  }
}
