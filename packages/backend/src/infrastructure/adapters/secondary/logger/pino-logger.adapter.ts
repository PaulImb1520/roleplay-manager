import type { Logger as PinoLogger } from "pino"

import type {
  LogContext,
  LogLevel,
  Logger,
} from "../../../../domain/ports/logger.port"

export class PinoLoggerAdapter implements Logger {
  constructor(private readonly pino: PinoLogger) {}

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    if (error) {
      this.pino[level]({ ...(context ?? {}), err: error }, message)
    } else {
      this.pino[level](context ?? {}, message)
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error)
  }

  child(bindings: LogContext): Logger {
    return new PinoLoggerAdapter(this.pino.child(bindings))
  }
}
