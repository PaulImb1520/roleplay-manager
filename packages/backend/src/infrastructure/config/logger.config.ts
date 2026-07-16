import { pino, type Logger as PinoLogger } from "pino"

import type { LogLevel } from "../../domain/ports/logger.port"

export interface BuildLoggerOptions {
  level: LogLevel
  nodeEnv: "development" | "production" | "test"
}

export const buildLogger = ({
  level,
  nodeEnv,
}: BuildLoggerOptions): PinoLogger => {
  if (nodeEnv === "production" || nodeEnv === "test") {
    return pino({ level, base: { service: "roleplay-manager-backend" } })
  }
  return pino({
    level,
    base: { service: "roleplay-manager-backend" },
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname,service",
      },
    },
  })
}
