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
import { DrizzleProviderInstanceRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-provider-instance.repository"
import { DrizzleMemoryRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-memory.repository"
import { DrizzleMemoryChangeProposalRepository } from "../infrastructure/adapters/secondary/drizzle/repositories/drizzle-memory-change-proposal.repository"
import { ProviderRegistryImpl } from "../infrastructure/adapters/secondary/providers/provider-registry"
import { PromptContextBuilderImpl } from "../infrastructure/adapters/secondary/prompt-context-builder/prompt-context-builder.impl"
import type { ProviderRegistry } from "../domain/ports/provider.port"
import type { SettingsRepository } from "../domain/ports/settings.repository"
import type { CharacterRepository } from "../domain/ports/character.repository"
import type { ConversationRepository } from "../domain/ports/conversation.repository"
import type { MessageRepository } from "../domain/ports/message.repository"
import type { MemoryRepository } from "../domain/ports/memory.repository"
import type { MemoryChangeProposalRepository } from "../domain/ports/memory-change-proposal.repository"
import type { ProviderInstanceRepository } from "../domain/ports/provider-instance.repository"
import type { PromptContextBuilder } from "../domain/ports/prompt-context-builder"
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
import { SendMessageUseCase } from "../application/use-cases/conversation/send-message.use-case"
import { EditMessageUseCase } from "../application/use-cases/conversation/edit-message.use-case"
import { DeleteMessageUseCase } from "../application/use-cases/conversation/delete-message.use-case"
import { RegenerateReplyUseCase } from "../application/use-cases/conversation/regenerate-reply.use-case"
import { RewindConversationUseCase } from "../application/use-cases/conversation/rewind-conversation.use-case"
import { ContinueConversationUseCase } from "../application/use-cases/conversation/continue-conversation.use-case"
import { CycleAlternativeUseCase } from "../application/use-cases/conversation/cycle-alternative.use-case"
import { UpdateConversationSettingsUseCase } from "../application/use-cases/conversation/update-conversation-settings.use-case"
import { ApplyMemoryChangesUseCase } from "../application/use-cases/memory/apply-memory-changes.use-case"
import { ApplyAllMemoryChangesUseCase } from "../application/use-cases/memory/apply-all-memory-changes.use-case"
import { CreateMemoryUseCase } from "../application/use-cases/memory/create-memory.use-case"
import { UpdateMemoryUseCase } from "../application/use-cases/memory/update-memory.use-case"
import { DeleteMemoryUseCase } from "../application/use-cases/memory/delete-memory.use-case"
import { ListMemoriesUseCase } from "../application/use-cases/memory/list-memories.use-case"
import { ListProposalsUseCase } from "../application/use-cases/memory/list-proposals.use-case"
import { ListProviderInstancesUseCase } from "../application/use-cases/provider/list-provider-instances.use-case"
import { CreateProviderInstanceUseCase } from "../application/use-cases/provider/create-provider-instance.use-case"
import { UpdateProviderInstanceUseCase } from "../application/use-cases/provider/update-provider-instance.use-case"
import { DeleteProviderInstanceUseCase } from "../application/use-cases/provider/delete-provider-instance.use-case"
import { ValidateProviderInstanceUseCase } from "../application/use-cases/provider/validate-provider-instance.use-case"

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
  providerInstanceRepository: ProviderInstanceRepository
  characterRepository: CharacterRepository
  conversationRepository: ConversationRepository
  messageRepository: MessageRepository
  memoryRepository: MemoryRepository
  memoryChangeProposalRepository: MemoryChangeProposalRepository
  promptContextBuilder: PromptContextBuilder
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
  sendMessage: SendMessageUseCase
  editMessage: EditMessageUseCase
  deleteMessage: DeleteMessageUseCase
  regenerateReply: RegenerateReplyUseCase
  rewindConversation: RewindConversationUseCase
  continueConversation: ContinueConversationUseCase
  cycleAlternative: CycleAlternativeUseCase
  updateConversationSettings: UpdateConversationSettingsUseCase
  listProviderInstances: ListProviderInstancesUseCase
  createProviderInstance: CreateProviderInstanceUseCase
  updateProviderInstance: UpdateProviderInstanceUseCase
  deleteProviderInstance: DeleteProviderInstanceUseCase
  validateProviderInstance: ValidateProviderInstanceUseCase

  // Memory
  applyMemoryChanges: ApplyMemoryChangesUseCase
  applyAllMemoryChanges: ApplyAllMemoryChangesUseCase
  createMemory: CreateMemoryUseCase
  updateMemory: UpdateMemoryUseCase
  deleteMemory: DeleteMemoryUseCase
  listMemories: ListMemoriesUseCase
  listProposals: ListProposalsUseCase
}

export interface BuildContainerOptions {
  logger: Logger
  pino: PinoLogger
  database: Database
  ollamaBaseUrl: string
  providerTimeoutMs: number
  providerStreamingTimeoutMs: number
}

export const buildContainer = ({
  logger,
  pino,
  database,
  ollamaBaseUrl,
  providerTimeoutMs,
  providerStreamingTimeoutMs,
}: BuildContainerOptions): AppContainer => {
  const settings: SettingsRepository = new DrizzleSettingsRepository(database)
  const providerRegistry: ProviderRegistry = new ProviderRegistryImpl({
    settings,
    ollamaBaseUrl,
    timeoutMs: providerTimeoutMs,
    streamingTimeoutMs: providerStreamingTimeoutMs,
    logger,
  })
  const characterRepository: CharacterRepository = new DrizzleCharacterRepository(database)
  const conversationRepository: ConversationRepository = new DrizzleConversationRepository(database)
  const messageRepository: MessageRepository = new DrizzleMessageRepository(database)
  const memoryRepository: MemoryRepository =
    new DrizzleMemoryRepository(database)
  const memoryChangeProposalRepository: MemoryChangeProposalRepository =
    new DrizzleMemoryChangeProposalRepository(database)
  const promptContextBuilder: PromptContextBuilder = new PromptContextBuilderImpl()
  const getDefaultProvider = new GetDefaultProviderUseCase(settings)
  const providerInstanceRepository: ProviderInstanceRepository =
    new DrizzleProviderInstanceRepository(database)

  const applyAllMemoryChanges = new ApplyAllMemoryChangesUseCase(
    memoryRepository,
    memoryChangeProposalRepository,
    logger,
  )

  const sendMessage = new SendMessageUseCase(
    conversationRepository,
    messageRepository,
    characterRepository,
    memoryRepository,
    memoryChangeProposalRepository,
    promptContextBuilder,
    providerRegistry,
    logger,
    getDefaultProvider,
    providerInstanceRepository,
    applyAllMemoryChanges,
  )

  const regenerateReply = new RegenerateReplyUseCase(
    conversationRepository,
    messageRepository,
    characterRepository,
    memoryRepository,
    memoryChangeProposalRepository,
    promptContextBuilder,
    providerRegistry,
    logger,
    getDefaultProvider,
    providerInstanceRepository,
    applyAllMemoryChanges,
  )

  const continueConversation = new ContinueConversationUseCase(
    conversationRepository,
    messageRepository,
    characterRepository,
    memoryRepository,
    memoryChangeProposalRepository,
    promptContextBuilder,
    providerRegistry,
    logger,
    getDefaultProvider,
    providerInstanceRepository,
    applyAllMemoryChanges,
  )

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
    getDefaultProvider,
    configureDefaultProvider: new ConfigureDefaultProviderUseCase(
      providerRegistry,
      settings,
      providerInstanceRepository,
      logger,
    ),
    settings,
    providerRegistry,
    providerInstanceRepository,
    characterRepository,
    conversationRepository,
    messageRepository,
    memoryRepository,
    memoryChangeProposalRepository,
    promptContextBuilder,
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
      getDefaultProvider,
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
    sendMessage,
    editMessage: new EditMessageUseCase(
      conversationRepository,
      messageRepository,
    ),
    deleteMessage: new DeleteMessageUseCase(
      conversationRepository,
      messageRepository,
    ),
    regenerateReply,
    rewindConversation: new RewindConversationUseCase(
      conversationRepository,
      messageRepository,
      memoryChangeProposalRepository,
    ),
    continueConversation,
    cycleAlternative: new CycleAlternativeUseCase(
      conversationRepository,
      messageRepository,
    ),
    updateConversationSettings: new UpdateConversationSettingsUseCase(
      conversationRepository,
      characterRepository,
      providerRegistry,
      providerInstanceRepository,
      logger,
    ),
    listProviderInstances: new ListProviderInstancesUseCase(
      providerInstanceRepository,
    ),
    createProviderInstance: new CreateProviderInstanceUseCase(
      providerInstanceRepository,
    ),
    updateProviderInstance: new UpdateProviderInstanceUseCase(
      providerInstanceRepository,
    ),
    deleteProviderInstance: new DeleteProviderInstanceUseCase(
      providerInstanceRepository,
    ),
    validateProviderInstance: new ValidateProviderInstanceUseCase(
      providerInstanceRepository,
      providerRegistry,
      logger,
    ),
    applyMemoryChanges: new ApplyMemoryChangesUseCase(
      memoryRepository,
      memoryChangeProposalRepository,
      logger,
    ),
    applyAllMemoryChanges,
    createMemory: new CreateMemoryUseCase(memoryRepository),
    updateMemory: new UpdateMemoryUseCase(memoryRepository),
    deleteMemory: new DeleteMemoryUseCase(memoryRepository),
    listMemories: new ListMemoriesUseCase(memoryRepository),
    listProposals: new ListProposalsUseCase(memoryChangeProposalRepository),
  }
}
