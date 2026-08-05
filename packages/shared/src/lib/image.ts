const ALLOWED_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])

const MAGIC_BYTES: { mime: string; bytes: Uint8Array }[] = [
  { mime: "image/png", bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
  { mime: "image/jpeg", bytes: new Uint8Array([0xff, 0xd8, 0xff]) },
  { mime: "image/gif", bytes: new Uint8Array([0x47, 0x49, 0x46, 0x38]) },
  { mime: "image/webp", bytes: new Uint8Array([0x52, 0x49, 0x46, 0x46]) },
]

export function isAllowedImageMime(mime: string): boolean {
  return ALLOWED_MIMES.has(mime)
}

export function detectMimeFromMagicBytes(
  bytes: Uint8Array,
): string | null {
  for (const entry of MAGIC_BYTES) {
    if (entry.mime === "image/webp") {
      if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return "image/webp"
      }
      continue
    }
    if (bytes.length >= entry.bytes.length) {
      let match = true
      for (let i = 0; i < entry.bytes.length; i++) {
        if (bytes[i] !== entry.bytes[i]) {
          match = false
          break
        }
      }
      if (match) return entry.mime
    }
  }
  return null
}

export function mimeToExtension(mime: string): string | null {
  switch (mime) {
    case "image/png": return "png"
    case "image/jpeg": return "jpg"
    case "image/gif": return "gif"
    case "image/webp": return "webp"
    default: return null
  }
}

export function validateImageBytes(
  bytes: Uint8Array,
  claimedMime: string,
  maxBytes: number,
): { ok: true; mime: string } | { ok: false; reason: string } {
  if (bytes.length === 0) {
    return { ok: false, reason: "File is empty" }
  }
  if (bytes.length > maxBytes) {
    return {
      ok: false,
      reason: `File is too large (${bytes.length} bytes, max ${maxBytes})`,
    }
  }
  if (!isAllowedImageMime(claimedMime)) {
    return { ok: false, reason: `Mime type '${claimedMime}' is not allowed. Allowed: png, jpeg, webp, gif` }
  }
  const detected = detectMimeFromMagicBytes(bytes)
  if (!detected || detected !== claimedMime) {
    return {
      ok: false,
      reason: `File content does not match mime type '${claimedMime}'`,
    }
  }
  return { ok: true, mime: detected }
}
