import { describe, it, expect } from "vitest"
import { PassThrough } from "node:stream"
import type { IncomingMessage } from "node:http"

import { parseMultipartBody } from "./multipart"

function createMultipartRequest(
  boundary: string,
  body: Buffer,
): IncomingMessage {
  const stream = new PassThrough()
  const req = Object.assign(stream, {
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  }) as unknown as IncomingMessage
  process.nextTick(() => {
    stream.write(body)
    stream.end()
  })
  return req
}

describe("parseMultipartBody", () => {
  it("parses a valid multipart file upload", async () => {
    const boundary = "----TestBoundary"
    const body = [
      `------TestBoundary`,
      `Content-Disposition: form-data; name="file"; filename="test.png"`,
      `Content-Type: image/png`,
      ``,
      `fake image data`,
      `------TestBoundary--`,
      ``,
    ].join("\r\n")

    const req = createMultipartRequest(boundary, Buffer.from(body))
    const result = await parseMultipartBody(req, 3 * 1024 * 1024)

    expect(result.fieldname).toBe("file")
    expect(result.filename).toBe("test.png")
    expect(result.mimeType).toBe("image/png")
    expect(result.data.toString()).toBe("fake image data")
  })

  it("rejects when no file is uploaded", async () => {
    const boundary = "----TestBoundary"
    const body = [
      `------TestBoundary--`,
      ``,
    ].join("\r\n")

    const req = createMultipartRequest(boundary, Buffer.from(body))
    await expect(parseMultipartBody(req, 3 * 1024 * 1024)).rejects.toThrow("No file")
  })
})
