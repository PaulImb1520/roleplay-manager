import { buildServer } from "./infrastructure/adapters/primary/server"
import { buildContainer } from "./containers/app-container"
import { buildDatabase, runMigrations } from "./infrastructure/config/database"
import { buildLogger } from "./infrastructure/config/logger.config"
import { PinoLoggerAdapter } from "./infrastructure/adapters/secondary/logger/pino-logger.adapter"
import { loadEnv } from "./infrastructure/config/env"

const main = (): void => {
  const env = loadEnv()
  const pino = buildLogger({ level: env.LOG_LEVEL, nodeEnv: env.NODE_ENV })
  const logger = new PinoLoggerAdapter(pino)

  logger.info("Starting roleplay-manager backend", {
    env: env.NODE_ENV,
    port: env.PORT,
    databasePath: env.DATABASE_PATH,
  })

  let db
  try {
    db = buildDatabase(env.DATABASE_PATH)
    runMigrations(db)
    logger.info("Database migrations applied", { databasePath: env.DATABASE_PATH })
  } catch (error) {
    logger.error("Failed to initialize database", error as Error, {
      databasePath: env.DATABASE_PATH,
    })
    process.exit(1)
  }

  const container = buildContainer({ logger, pino, database: db })
  const app = buildServer({
    logger,
    pino,
    healthCheck: container.healthCheck,
    corsOrigin: env.CORS_ORIGIN,
  })

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`)
  })

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}, shutting down gracefully`)
    server.close(() => {
      logger.info("HTTP server closed")
      process.exit(0)
    })
    setTimeout(() => {
      logger.error("Forced shutdown after timeout")
      process.exit(1)
    }, 10_000).unref()
  }

  process.on("SIGINT", () => shutdown("SIGINT"))
  process.on("SIGTERM", () => shutdown("SIGTERM"))
}

main()
