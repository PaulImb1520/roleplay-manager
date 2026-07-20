import { describe, it, expect, vi } from "vitest"

import { ListProviderModelsUseCase } from "./list-provider-models.use-case"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderPort, ProviderRegistry } from "../../../domain/ports/provider.port"

const buildSilentLogger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
})

describe("ListProviderModelsUseCase", () => {
  it("devuelve la lista de modelos del adaptador", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(),
      listModels: vi.fn(async () => ({
        models: [{ id: "llama3:latest" }, { id: "qwen2:7b" }],
        manualEntryRequired: false,
      })),
      async *generateStreaming(_context?: any, _options?: any): AsyncIterable<any> {},
    }
    const registry: ProviderRegistry = {
      listRegistered: () => ["ollama"],
      getAdapter: vi.fn(async () => adapter),
    }
    const useCase = new ListProviderModelsUseCase(registry, buildSilentLogger())

    const result = await useCase.execute("ollama")

    expect(result).toEqual({
      id: "ollama",
      models: [
        { id: "llama3:latest" },
        { id: "qwen2:7b" },
      ],
      manualEntryRequired: false,
    })
  })

  it("devuelve manualEntryRequired=true si el proveedor no esta configurado", async () => {
    const registry: ProviderRegistry = {
      listRegistered: () => ["openai-compatible"],
      getAdapter: vi.fn(async () => null),
    }
    const useCase = new ListProviderModelsUseCase(registry, buildSilentLogger())

    const result = await useCase.execute("openai-compatible")

    expect(result).toEqual({
      id: "openai-compatible",
      models: [],
      manualEntryRequired: true,
    })
  })

  it("propaga error si el adaptador falla", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(),
      listModels: vi.fn(async () => {
        throw new Error("network down")
      }),
      async *generateStreaming(_context?: any, _options?: any): AsyncIterable<any> {},
    }
    const registry: ProviderRegistry = {
      listRegistered: () => ["ollama"],
      getAdapter: vi.fn(async () => adapter),
    }
    const useCase = new ListProviderModelsUseCase(registry, buildSilentLogger())

    await expect(useCase.execute("ollama")).rejects.toThrow(
      "Could not list models for ollama",
    )
  })
})