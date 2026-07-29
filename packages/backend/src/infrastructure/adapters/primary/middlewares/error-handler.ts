import type { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

import type { Logger } from "../../../../domain/ports/logger.port"
import { DomainError as DomainErr } from "../../../../domain/errors"

export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Invalid request payload") {
    super(400, "VALIDATION_ERROR", message)
    this.name = "ValidationError"
  }
}

export class InfrastructureError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_ERROR", message)
    this.name = "InfrastructureError"
  }
}

export class ProviderError extends HttpError {
  constructor(
    code:
      | "PROVIDER_CONNECTION_FAILED"
      | "PROVIDER_GENERATION_FAILED"
      | "PROVIDER_MODEL_NOT_FOUND",
    message: string,
  ) {
    super(502, code, message)
    this.name = "ProviderError"
  }
}

export class ProviderTimeoutError extends HttpError {
  constructor(message = "The provider did not respond in time.") {
    super(504, "PROVIDER_TIMEOUT", message)
    this.name = "ProviderTimeoutError"
  }
}

export const buildErrorHandler = (logger: Logger): ErrorRequestHandler => {
  return (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const body: ApiErrorBody = {
        error: {
          code: "VALIDATION_ERROR",
          message: err.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; "),
        },
      }
      res.status(400).json(body)
      return
    }

    if (err instanceof HttpError) {
      logger.warn("Request failed with known error", {
        status: err.status,
        code: err.code,
        message: err.message,
      })
      const body: ApiErrorBody = {
        error: { code: err.code, message: err.message },
      }
      res.status(err.status).json(body)
      return
    }

    if (err instanceof DomainErr) {
      logger.warn("Request failed with domain error", {
        code: err.code,
        message: err.message,
      })
      const body: ApiErrorBody = {
        error: { code: err.code, message: err.message },
      }
      res.status(err.statusCode).json(body)
      return
    }

    logger.error("Unhandled error", err as Error)
    const body: ApiErrorBody = {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    }
    res.status(500).json(body)
  }
}
