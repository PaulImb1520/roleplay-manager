import cors from "cors"
import express, { type Express } from "express"
import pinoHttp from "pino-http"

import type { AppContainer } from "../../../containers/app-container"
import { buildErrorHandler } from "./middlewares/error-handler"
import { buildCharacterRouter } from "./routes/character.routes"
import { buildConversationRouter } from "./routes/conversation.routes"
import { buildHealthRouter } from "./routes/health.routes"
import { buildProviderRouter } from "./routes/provider.routes"
import { buildSettingsRouter } from "./routes/settings.routes"
import { buildProviderInstanceRouter } from "./routes/provider-instance.routes"

export interface BuildServerOptions {
  container: AppContainer
  corsOrigin: string
}

export const buildServer = ({
  container,
  corsOrigin,
}: BuildServerOptions): Express => {
  const { logger, pino } = container
  const app = express()

  app.use(express.json({ limit: "1mb" }))
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  )

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

  app.use("/api", buildHealthRouter(container.healthCheck))
  app.use("/api", buildProviderRouter(container))
  app.use(
    "/api/settings",
    buildSettingsRouter({
      getDefaultProvider: container.getDefaultProvider,
      configureDefaultProvider: container.configureDefaultProvider,
      settings: container.settings,
    }),
  )
  app.use("/api", buildProviderInstanceRouter(container))
  app.use("/api", buildCharacterRouter(container))
  app.use(
    "/api",
    buildConversationRouter({
      createConversation: container.createConversation,
      getConversation: container.getConversation,
      listConversations: container.listConversations,
      archiveConversation: container.archiveConversation,
      sendMessage: container.sendMessage,
      updateConversationSettings: container.updateConversationSettings,
    }),
  )

  app.use(buildErrorHandler(logger))

  return app
}
