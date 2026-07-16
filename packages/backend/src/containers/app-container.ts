import type { Database } from "../infrastructure/config/database"
import type { Logger } from "../domain/ports/logger.port"
import type { Logger as PinoLogger } from "pino"
import { HealthCheckUseCase } from "../application/use-cases/health/health-check.use-case"

export interface AppContainer {
  logger: Logger
  pino: PinoLogger
  database: Database
  healthCheck: HealthCheckUseCase
}

export interface BuildContainerOptions {
  logger: Logger
  pino: PinoLogger
  database: Database
}

export const buildContainer = ({
  logger,
  pino,
  database,
}: BuildContainerOptions): AppContainer => {
  return {
    logger,
    pino,
    database,
    healthCheck: new HealthCheckUseCase(database, logger),
  }
}
