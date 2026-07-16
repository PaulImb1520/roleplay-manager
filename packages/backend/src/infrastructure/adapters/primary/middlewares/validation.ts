import type { RequestHandler } from "express"
import { ZodSchema } from "zod"

import { ValidationError } from "./error-handler"

export const validate =
  <T>(schema: ZodSchema<T>, source: "body" | "query" | "params" = "body"): RequestHandler =>
  (req, _res, next) => {
    const data = req[source]
    const result = schema.safeParse(data)
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
      next(new ValidationError(message))
      return
    }
    // Sustituimos los datos validados en req[source] para que el
    // controller reciba versiones saneadas.
    ;(req as unknown as Record<string, unknown>)[source] = result.data
    next()
  }
