import { describe, it, expect } from "vitest"

import { UpdateConversationSettingsUseCase } from "./update-conversation-settings.use-case"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { Logger } from "../../../domain/ports/logger.port"
import { Conversation } from "../../../domain/entities/conversation.entity"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"

const now = new Date()
const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "ver-1", characterId: "char-1", name: "Test",
  subtitle: null, profileImage: "https://example.com/avatar.png",
  description: "A test character", instructions: null,
  greeting: "Hello!", versionNumber: 1, createdAt: now, cards: [],
})

const existingConv = Conversation.create({
  id: "conv-1",
  versionId: "ver-1",
  title: null,
  status: "active",
  model: null,
  provider: null,
  providerInstanceId: null,
  recentMessageCount: 10,
  summaryFrequency: 20,
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequences: [],
  memoryProposalMode: "auto",
  createdAt: now,
  updatedAt: now,
})

let capturedSettings: Record<string, unknown> = {}

const buildConversationRepo = (conversation: Conversation): ConversationRepository => ({
  create: async (c) => c,
  findById: async () => conversation,
  findByIdWithMessages: async () => null,
  list: async () => [],
  update: async (c) => c,
  updateSettings: async (_id: string, settings: any) => {
    capturedSettings = settings
    return conversation
  },
})

const buildCharacterRepo = (): CharacterRepository => ({
  createWithFirstVersion: async () => ({ character, version }),
  findById: async () => ({ character, currentVersion: version }),
  list: async () => [],
  update: async (c) => c,
  delete: async () => {},
  findVersionById: async () => version,
  findVersionsByCharacterId: async () => [],
  findMaxVersionNumber: async () => 0,
  saveVersion: async (v) => v,
})

const buildProviderRegistry = (): ProviderRegistry => ({
  getAdapter: async () => null,
  createAdapter: () => {
    throw new Error("not implemented")
  },
  listRegistered: () => [],
})

const buildProviderInstanceRepo = (): ProviderInstanceRepository => ({
  create: async () => ({
    id: "inst-1",
    providerId: "openai-compatible" as const,
    name: "Test",
    kind: "openai-compatible",
    baseUrl: "https://example.com",
    url: "https://example.com",
    apiKey: null,
    hasApiKey: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }),
  findById: async () => null,
  list: async () => [],
  delete: async () => {},
  update: async (_id, _input) => ({
    id: "inst-1",
    providerId: "openai-compatible" as const,
    name: "Test",
    kind: "openai-compatible",
    baseUrl: "https://example.com",
    url: "https://example.com",
    apiKey: null,
    hasApiKey: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }),
})

const buildLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => buildLogger(),
})

function buildUseCase(conv: Conversation = existingConv) {
  capturedSettings = {}
  return new UpdateConversationSettingsUseCase(
    buildConversationRepo(conv),
    buildCharacterRepo(),
    buildProviderRegistry(),
    buildProviderInstanceRepo(),
    buildLogger(),
  )
}

describe("UpdateConversationSettingsUseCase", () => {
  it("capa recentMessageCount cuando ambos campos violan el invariante", async () => {
    const useCase = buildUseCase()
    await useCase.execute("conv-1", {
      recentMessageCount: 20,
      summaryFrequency: 15,
    })
    expect(capturedSettings.recentMessageCount).toBe(14)
    expect(capturedSettings.summaryFrequency).toBe(15)
  })

  it("capa recentMessageCount contra summaryFrequency actual cuando solo viene recent", async () => {
    const useCase = buildUseCase()
    await useCase.execute("conv-1", {
      recentMessageCount: 30,
    })
    expect(capturedSettings.recentMessageCount).toBe(19)
    expect(capturedSettings.summaryFrequency).toBeUndefined()
  })

  it("no modifica valores válidos", async () => {
    const useCase = buildUseCase()
    await useCase.execute("conv-1", {
      recentMessageCount: 5,
      summaryFrequency: 25,
    })
    expect(capturedSettings.recentMessageCount).toBe(5)
    expect(capturedSettings.summaryFrequency).toBe(25)
  })

  it("no modifica recentMessageCount cuando solo cambia summaryFrequency", async () => {
    const useCase = buildUseCase()
    await useCase.execute("conv-1", {
      summaryFrequency: 30,
    })
    expect(capturedSettings.recentMessageCount).toBeUndefined()
    expect(capturedSettings.summaryFrequency).toBe(30)
  })
})
