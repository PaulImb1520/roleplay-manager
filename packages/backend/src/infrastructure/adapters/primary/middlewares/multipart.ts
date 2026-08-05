import { IncomingMessage } from "node:http"
import Busboy from "busboy"

export interface ParsedMultipartFile {
  fieldname: string
  filename: string
  mimeType: string
  data: Buffer
}

export function parseMultipartBody(
  req: IncomingMessage,
  maxFileSize: number,
): Promise<ParsedMultipartFile> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxFileSize,
        files: 1,
        fields: 0,
      },
    })

    let collectedData: Buffer | null = null
    let fileMetadata: { fieldname: string; filename: string; mimeType: string } | null = null

    busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      const { filename, mimeType } = info

      if (fileMetadata) {
        file.resume()
        reject(new Error("Multiple files are not supported"))
        return
      }

      fileMetadata = { fieldname, filename: filename || "", mimeType: mimeType || "" }

      const chunks: Buffer[] = []
      file.on("data", (chunk: Buffer) => {
        chunks.push(chunk)
      })
      file.on("end", () => {
        collectedData = Buffer.concat(chunks)
      })
      file.on("limit", () => {
        reject(new Error("File size exceeds limit"))
      })
    })

    busboy.on("finish", () => {
      if (!fileMetadata || !collectedData) {
        reject(new Error("No file was uploaded"))
        return
      }
      resolve({
        fieldname: fileMetadata.fieldname,
        filename: fileMetadata.filename,
        mimeType: fileMetadata.mimeType,
        data: collectedData,
      })
    })

    busboy.on("error", (err: Error) => {
      reject(err)
    })

    req.pipe(busboy)
  })
}
