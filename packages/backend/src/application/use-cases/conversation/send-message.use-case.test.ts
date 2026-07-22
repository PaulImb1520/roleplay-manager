import { describe, it, expect, beforeAll, vi } from "vitest"

import { SendMessageUseCase } from "./send-message.use-case"
import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { CharacterRepository } from "../../../domain/ports/character.repository"
import type { PromptContextBuilder } from "../../../domain/ports/prompt-context-builder"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { Logger } from "../../../domain/ports/logger.port"
import type { GetDefaultProviderUseCase } from "../provider/get-default-provider.use-case"
import { Conversation } from "../../../domain/entities/conversation.entity"
import { Message } from "../../../domain/entities/message.entity"
import { Character } from "../../../domain/entities/character.entity"
import { CharacterVersion } from "../../../domain/entities/character-version.entity"
import type { PromptContext, StreamChunk } from "../../../domain/value-objects/prompt-context"
import type { ProviderId } from "@workspace/shared/types/provider"

const now = new Date()

const character = Character.create({ id: "char-1", name: "Test", createdAt: now, updatedAt: now })
const version = CharacterVersion.create({
  id: "ver-1",
  characterId: "char-1",
  name: "Test",
  subtitle: null,
  profileImage: "https://example.com/avatar.png",
  description: "A test character",
  instructions: null,
  greeting: "Hello!",
  versionNumber: 1,
  createdAt: now,
  cards: [],
})

const activeConversation = Conversation.create({
  id: "conv-1",
  versionId: "ver-1",
  title: null,
  status: "active",
  model: null,
  provider: "ollama",
  providerInstanceId: null,
  recentMessageCount: 15,
  summaryFrequency: 15,
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

const archivedConversation = Conversation.create({
  id: "conv-archived",
  versionId: "ver-1",
  title: null,
  status: "archived",
  model: null,
  provider: "ollama",
  providerInstanceId: null,
  recentMessageCount: 15,
  summaryFrequency: 15,
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

const existingMessages = [
  Message.create({
    id: "msg-0",
    conversationId: "conv-1",
    role: "assistant",
    content: "Hello!",
    position: 0,
    alternatives: [],
    alternativesCursor: 0,
    createdAt: now,
    editedAt: null,
  }),
]

const buildConversationRepo = (): ConversationRepository => ({
  create: async () => activeConversation,
  findById: async (id) => {
    if (id === "conv-1") return activeConversation
    if (id === "conv-archived") return archivedConversation
    return null
  },
  findByIdWithMessages: async () => null,
  list: async () => [],
  update: async (c) => c,
  updateSettings: vi.fn(async (_id: string, _settings: any) => activeConversation),
})

const buildMessageRepo = (): MessageRepository => ({
  create: async (m) => m,
  findByConversationId: async () => existingMessages,
  findById: async () => null,
  findLastByConversationId: async () => null,
  update: async (m) => m,
  deleteById: async () => {},
  deleteAfterPosition: async () => {},
  clearAlternatives: async () => {},
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

const buildPromptContextBuilder = (): PromptContextBuilder => ({
  build: async () => ({
    systemPrompt: "Eres Test.",
    messages: [],
  }),
})

let providerCount = 0

const buildProviderRegistry = (shouldFail = false): ProviderRegistry => ({
  listRegistered: () => ["ollama"],
  createAdapter: vi.fn(),
  getAdapter: async (_id: ProviderId) => {
    providerCount++
    if (shouldFail) return null
    return {
      validateConnection: async () => "available",
      listModels: async () => ({ models: [], manualEntryRequired: false }),
      generateStreaming: function (
        _context: PromptContext,
        _options?: { model?: string },
      ): AsyncIterable<StreamChunk> {
        return {
          [Symbol.asyncIterator]: () => {
            const chunks = ["Hello ", "from ", "the ", "AI!"]
            let i = 0
            return {
              next: async () => {
                if (i < chunks.length) {
                  return { value: { content: chunks[i++] }, done: false }
                }
                return { value: undefined, done: true }
              },
            }
          },
        }
      },
    }
  },
})

const providerInstanceRepository = {
  findById: vi.fn(),
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const buildDefaultProvider = (
  provider: string | null = "ollama",
  model: string | null = null,
): GetDefaultProviderUseCase =>
  ({ execute: async () => ({ provider, model }) }) as unknown as GetDefaultProviderUseCase

const buildLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => buildLogger(),
})

describe("SendMessageUseCase", () => {
  beforeAll(() => {
    providerCount = 0
  })

  it("lanza ConversationNotFoundError si la conversacion no existe", async () => {
    const useCase = new SendMessageUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
      buildPromptContextBuilder(),
      buildProviderRegistry(),
      buildLogger(),
      buildDefaultProvider(),
      providerInstanceRepository,
    )

    await expect(
      async () => {
        const gen = useCase.execute({ conversationId: "nonexistent", content: "Hola" })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of gen) {
          // consume
        }
      },
    ).rejects.toThrow("Conversation with id 'nonexistent' not found.")
  })

  it("lanza ConversationArchivedError si la conversacion esta archivada", async () => {
    const useCase = new SendMessageUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
      buildPromptContextBuilder(),
      buildProviderRegistry(),
      buildLogger(),
      buildDefaultProvider(),
      providerInstanceRepository,
    )

    await expect(
      async () => {
        const gen = useCase.execute({ conversationId: "conv-archived", content: "Hola" })
        for await (const _ of gen) {
          // consume
        }
      },
    ).rejects.toThrow("is already archived")
  })

  it("emite evento user-message-saved al guardar el mensaje", async () => {
    const useCase = new SendMessageUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
      buildPromptContextBuilder(),
      buildProviderRegistry(),
      buildLogger(),
      buildDefaultProvider(),
      providerInstanceRepository,
    )

    const events: string[] = []
    const gen = useCase.execute({ conversationId: "conv-1", content: "Hola" })

    for await (const event of gen) {
      events.push(event.type)
      if (event.type === "user-message-saved") {
        expect(event.message.role).toBe("user")
        expect(event.message.content).toBe("Hola")
      }
    }

    expect(events).toContain("user-message-saved")
  })

  it("emite chunks de streaming y evento done", async () => {
    const useCase = new SendMessageUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
      buildPromptContextBuilder(),
      buildProviderRegistry(),
      buildLogger(),
      buildDefaultProvider(),
      providerInstanceRepository,
    )

    const chunks: string[] = []
    let doneMessage = false
    const gen = useCase.execute({ conversationId: "conv-1", content: "Hola" })

    for await (const event of gen) {
      if (event.type === "chunk") {
        chunks.push(event.content)
      }
      if (event.type === "done") {
        doneMessage = true
        expect(event.message.role).toBe("assistant")
        expect(event.message.content).toBe("Hello from the AI!")
      }
    }

    expect(chunks).toEqual(["Hello ", "from ", "the ", "AI!"])
    expect(doneMessage).toBe(true)
  })

  it("emite evento error si el proveedor no esta configurado", async () => {
    const useCase = new SendMessageUseCase(
      buildConversationRepo(),
      buildMessageRepo(),
      buildCharacterRepo(),
      buildPromptContextBuilder(),
      buildProviderRegistry(true), // will return null
      buildLogger(),
      buildDefaultProvider(),
      providerInstanceRepository,
    )

    const gen = useCase.execute({ conversationId: "conv-1", content: "Hola" })
    let hasError = false

    for await (const event of gen) {
      if (event.type === "error") {
        hasError = true
        expect(event.error.code).toBe("PROVIDER_NOT_CONFIGURED")
      }
    }

    expect(hasError).toBe(true)
  })
})
