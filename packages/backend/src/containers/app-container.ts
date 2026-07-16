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
import { DrizzleCharacterRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-character.repository"
import { DrizzleConversationRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-conversation.repository"
import { DrizzleMessageRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-message.repository"
import { ProviderRegistryImpl } from "../infrastructure/adapters/secondary/providers/provider-registry"
import type { ProviderRegistry } from "../domain/ports/provider.port"
import type { SettingsRepository } from "../domain/ports/settings.repository"
import type { CharacterRepository } from "../domain/ports/character.repository"
import type { ConversationRepository } from "../domain/ports/conversation.repository"
import type { MessageRepository } from "../domain/ports/message.repository"
import { CreateCharacterUseCase } from "../application/use-cases/character/create-character.use-case"
import { GetCharacterUseCase } from "../application/use-cases/character/get-character.use-case"
import { ListCharactersUseCase } from "../application/use-cases/character/list-characters.use-case"
import { UpdateCharacterUseCase } from "../application/use-cases/character/update-character.use-case"
import { DeleteCharacterUseCase } from "../application/use-cases/character/delete-character.use-case"
import { ListCharacterVersionsUseCase } from "../application/use-cases/character/list-character-versions.use-case"
import { CreateConversationUseCase } from "../application/use-cases/conversation/create-conversation.use-case"
import { GetConversationUseCase } from "../application/use-cases/conversation/get-conversation.use-case"
import { ListConversationsUseCase } from "../application/use-cases/conversation/list-conversations.use-case"
import { ArchiveConversationUseCase } from "../application/use-cases/conversation/archive-conversation.use-case"

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
  characterRepository: CharacterRepository
  conversationRepository: ConversationRepository
  messageRepository: MessageRepository
  createCharacter: CreateCharacterUseCase
  getCharacter: GetCharacterUseCase
  listCharacters: ListCharactersUseCase
  updateCharacter: UpdateCharacterUseCase
  deleteCharacter: DeleteCharacterUseCase
  listCharacterVersions: ListCharacterVersionsUseCase
  createConversation: CreateConversationUseCase
  getConversation: GetConversationUseCase
  listConversations: ListConversationsUseCase
  archiveConversation: ArchiveConversationUseCase
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
  const characterRepository: CharacterRepository = new DrizzleCharacterRepository(database)
  const conversationRepository: ConversationRepository = new DrizzleConversationRepository(database)
  const messageRepository: MessageRepository = new DrizzleMessageRepository(database)

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
    characterRepository,
    conversationRepository,
    messageRepository,
    createCharacter: new CreateCharacterUseCase(characterRepository),
    getCharacter: new GetCharacterUseCase(characterRepository),
    listCharacters: new ListCharactersUseCase(characterRepository),
    updateCharacter: new UpdateCharacterUseCase(characterRepository),
    deleteCharacter: new DeleteCharacterUseCase(characterRepository),
    listCharacterVersions: new ListCharacterVersionsUseCase(characterRepository),
    createConversation: new CreateConversationUseCase(
      conversationRepository,
      messageRepository,
      characterRepository,
    ),
    getConversation: new GetConversationUseCase(
      conversationRepository,
      characterRepository,
    ),
    listConversations: new ListConversationsUseCase(
      conversationRepository,
      messageRepository,
      characterRepository,
    ),
    archiveConversation: new ArchiveConversationUseCase(
      conversationRepository,
      characterRepository,
    ),
  }
}
