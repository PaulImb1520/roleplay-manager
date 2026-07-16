export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogContext = Record<string, unknown>

/**
 * Puerto de logging.
 *
 * El dominio y los casos de uso emiten eventos de log a través de esta
 * interfaz. La elección del backend (pino, winston, console) vive en
 * infraestructura.
 *
 * El método `child` permite crear un logger con bindings fijos
 * (p. ej. `requestId`, `conversationId`) que se propagan a cada
 * llamada de log sin repetirlos manualmente.
 */
export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  child(bindings: LogContext): Logger
}
