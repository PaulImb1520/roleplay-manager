import type { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

import type { Logger } from "../../../../domain/ports/logger.port"

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

export class NotFoundError extends HttpError {
  constructor(code: string, message: string) {
    super(404, code, message)
    this.name = "NotFoundError"
  }
}

export class DomainError extends HttpError {
  constructor(code: string, message: string) {
    super(422, code, message)
    this.name = "DomainError"
  }
}

export class CharacterNotFoundError extends NotFoundError {
  constructor(id: string) {
    super("CHARACTER_NOT_FOUND", `Character with id '${id}' not found.`)
    this.name = "CharacterNotFoundError"
  }
}

export class CharacterVersionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super("CHARACTER_VERSION_NOT_FOUND", `Character version with id '${id}' not found.`)
    this.name = "CharacterVersionNotFoundError"
  }
}

export class NoChangesDetectedError extends DomainError {
  constructor(message = "No changes detected for the character.") {
    super("NO_CHANGES_DETECTED", message)
    this.name = "NoChangesDetectedError"
  }
}

export class CharacterValidationError extends DomainError {
  constructor(message: string) {
    super("CHARACTER_VALIDATION_ERROR", message)
    this.name = "CharacterValidationError"
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

export class ConversationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super("CONVERSATION_NOT_FOUND", `Conversation with id '${id}' not found.`)
    this.name = "ConversationNotFoundError"
  }
}

export class ConversationArchivedError extends DomainError {
  constructor(id: string) {
    super("CONVERSATION_ARCHIVED", `Conversation '${id}' is already archived.`)
    this.name = "ConversationArchivedError"
  }
}

export class MessageNotFoundError extends NotFoundError {
  constructor(id: string) {
    super("MESSAGE_NOT_FOUND", `Message with id '${id}' not found.`)
    this.name = "MessageNotFoundError"
  }
}

export class ConversationAlreadyActiveError extends DomainError {
  constructor(id: string) {
    super("CONVERSATION_ALREADY_ACTIVE", `Conversation '${id}' is already active.`)
    this.name = "ConversationAlreadyActiveError"
  }
}

export class ProviderUnavailableError extends ProviderError {
  constructor(message = "The provider is not available.") {
    super("PROVIDER_CONNECTION_FAILED", message)
    this.name = "ProviderUnavailableError"
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
