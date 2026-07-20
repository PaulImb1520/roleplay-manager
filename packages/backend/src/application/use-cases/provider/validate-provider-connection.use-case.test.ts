import { describe, it, expect, vi } from "vitest"
import type { ProviderStatus } from "@workspace/shared/types/provider"

import { ValidateProviderConnectionUseCase } from "./validate-provider-connection.use-case"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderPort, ProviderRegistry } from "../../../domain/ports/provider.port"

const buildSilentLogger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
})

describe("ValidateProviderConnectionUseCase", () => {
  it("devuelve available cuando el adaptador responde OK", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(async () => "available" as ProviderStatus),
      listModels: vi.fn(),
      async *generateStreaming(_context?: any, _options?: any): AsyncIterable<any> {},
    }
    const registry: ProviderRegistry = {
      listRegistered: () => ["ollama"],
      getAdapter: vi.fn(async () => adapter),
    }
    const useCase = new ValidateProviderConnectionUseCase(
      registry,
      buildSilentLogger(),
    )

    const result = await useCase.execute("ollama")

    expect(result).toEqual({ id: "ollama", status: "available" })
  })

  it("devuelve unconfigured cuando el registry no tiene adaptador", async () => {
    const registry: ProviderRegistry = {
      listRegistered: () => ["openai-compatible"],
      getAdapter: vi.fn(async () => null),
    }
    const useCase = new ValidateProviderConnectionUseCase(
      registry,
      buildSilentLogger(),
    )

    const result = await useCase.execute("openai-compatible")

    expect(result.status).toBe("unconfigured")
  })

  it("propaga ProviderUnavailableError si el adaptador falla", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(async () => {
        throw new Error("ECONNREFUSED")
      }),
      listModels: vi.fn(),
      async *generateStreaming(_context?: any, _options?: any): AsyncIterable<any> {},
    }
    const registry: ProviderRegistry = {
      listRegistered: () => ["ollama"],
      getAdapter: vi.fn(async () => adapter),
    }
    const useCase = new ValidateProviderConnectionUseCase(
      registry,
      buildSilentLogger(),
    )

    await expect(useCase.execute("ollama")).rejects.toThrow(
      "Provider ollama is not available",
    )
  })
})
