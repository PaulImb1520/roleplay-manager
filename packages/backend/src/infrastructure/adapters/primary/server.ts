import cors from "cors"
import express, { type Express } from "express"
import pinoHttp from "pino-http"
import type { Logger as PinoLogger } from "pino"

import type { Logger } from "../../../domain/ports/logger.port"
import type { HealthCheckUseCase } from "../../../application/use-cases/health/health-check.use-case"
import { buildErrorHandler } from "./middlewares/error-handler"
import { buildHealthRouter } from "./routes/health.routes"

export interface BuildServerOptions {
  logger: Logger
  pino: PinoLogger
  healthCheck: HealthCheckUseCase
  corsOrigin: string
}

export const buildServer = ({
  logger,
  pino,
  healthCheck,
  corsOrigin,
}: BuildServerOptions): Express => {
  const app = express()

  app.use(express.json({ limit: "1mb" }))
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  )

  // pino-http crea un child logger por request y lo expone en
  // `req.log` con el `requestId` correspondiente.
  app.use(
    pinoHttp({
      logger: pino,
      customLogLevel: (_req, res, err) => {
        if (err) return "error"
        if (res.statusCode >= 500) return "error"
        if (res.statusCode >= 400) return "warn"
        return "info"
      },
      customSuccessMessage: (req, res) =>
        `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, err) =>
        `${req.method} ${req.url} ${res.statusCode} ${err.message}`,
    }),
  )

  app.use("/api", buildHealthRouter(healthCheck))

  app.use(buildErrorHandler(logger))

  return app
}
