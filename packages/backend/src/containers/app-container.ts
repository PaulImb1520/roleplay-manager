import type { Database } from "../infrastructure/config/database"
import type { Logger } from "../domain/ports/logger.port"
import type { Logger as PinoLogger } from "pino"
import { HealthCheckUseCase } from "../application/use-cases/health/health-check.use-case"
import { ListProvidersUseCase } from "../application/use-cases/provider/list-providers.use-case"
import { ValidateProviderConnectionUseCase } from "../application/use-cases/provider/validate-provider-connection.use-case"
import { ListProviderModelsUseCase } from "../application/use-cases/provider/list-provider-models.use-case"
import { GetDefaultProviderUseCase } from "../application/use-cases/provider/get-default-provider.use-case"
import { ConfigureDefaultProviderUseCase } from "../application/use-cases/provider/configure-default-provider.use-case"
import { DrizzleSettingsRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-settings.repository"
import { ProviderRegistryImpl } from "../infrastructure/adapters/secondary/providers/provider-registry"
import type { ProviderRegistry } from "../domain/ports/provider.port"
import type { SettingsRepository } from "../domain/ports/settings.repository"

export interface AppContainer {
  logger: Logger
  pino: PinoLogger
  database: Database
  healthCheck: HealthCheckUseCase
  listProviders: ListProvidersUseCase
  validateProviderConnection: ValidateProviderConnectionUseCase
  listProviderModels: ListProviderModelsUseCase
  getDefaultProvider: GetDefaultProviderUseCase
  configureDefaultProvider: ConfigureDefaultProviderUseCase
  settings: SettingsRepository
  providerRegistry: ProviderRegistry
}

export interface BuildContainerOptions {
  logger: Logger
  pino: PinoLogger
  database: Database
  ollamaBaseUrl: string
  providerTimeoutMs: number
}

export const buildContainer = ({
  logger,
  pino,
  database,
  ollamaBaseUrl,
  providerTimeoutMs,
}: BuildContainerOptions): AppContainer => {
  const settings: SettingsRepository = new DrizzleSettingsRepository(database)
  const providerRegistry: ProviderRegistry = new ProviderRegistryImpl({
    settings,
    ollamaBaseUrl,
    timeoutMs: providerTimeoutMs,
    logger,
  })

  return {
    logger,
    pino,
    database,
    healthCheck: new HealthCheckUseCase(database, logger),
    listProviders: new ListProvidersUseCase(providerRegistry),
    validateProviderConnection: new ValidateProviderConnectionUseCase(
      providerRegistry,
      logger,
    ),
    listProviderModels: new ListProviderModelsUseCase(
      providerRegistry,
      logger,
    ),
    getDefaultProvider: new GetDefaultProviderUseCase(settings),
    configureDefaultProvider: new ConfigureDefaultProviderUseCase(
      providerRegistry,
      settings,
      logger,
    ),
    settings,
    providerRegistry,
  }
}
