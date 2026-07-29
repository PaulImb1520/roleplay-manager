import { describe, it, expect, vi } from "vitest"

import { GetDefaultProviderUseCase } from "./get-default-provider.use-case"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const noopInstanceRepo: ProviderInstanceRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe("GetDefaultProviderUseCase", () => {
  it("devuelve null/null si no hay settings guardadas", async () => {
    const settings: SettingsRepository = {
      get: vi.fn(async () => null),
      getMany: vi.fn(async () => ({
        default_provider: null,
        default_model: null,
      })),
      set: vi.fn(),
      setMany: vi.fn(),
    }
    const useCase = new GetDefaultProviderUseCase(settings, noopInstanceRepo)

    const result = await useCase.execute()

    expect(result).toEqual({ provider: null, model: null, providerInstanceId: null })
  })

  it("devuelve el provider y model persistidos", async () => {
    const settings: SettingsRepository = {
      get: vi.fn(async () => null),
      getMany: vi.fn(async () => ({
        default_provider: "ollama",
        default_model: "llama3:latest",
      })),
      set: vi.fn(),
      setMany: vi.fn(),
    }
    const useCase = new GetDefaultProviderUseCase(settings, noopInstanceRepo)

    const result = await useCase.execute()

    expect(result).toEqual({ provider: "ollama", model: "llama3:latest", providerInstanceId: null })
  })

  it("limpia y retorna null si la instancia por defecto fue eliminada", async () => {
    const settings: SettingsRepository = {
      get: vi.fn(async () => null),
      getMany: vi.fn(async () => ({
        default_provider: "openai-compatible",
        default_provider_instance_id: "inst-1",
        default_model: "gpt-4",
      })),
      set: vi.fn(),
      setMany: vi.fn(),
    }
    const instanceRepo: ProviderInstanceRepository = {
      ...noopInstanceRepo,
      findById: vi.fn(async () => null),
    }
    const useCase = new GetDefaultProviderUseCase(settings, instanceRepo)

    const result = await useCase.execute()

    expect(result).toEqual({ provider: null, providerInstanceId: null, model: null })
    expect(settings.setMany).toHaveBeenCalledWith({
      default_provider: "",
      default_provider_instance_id: "",
      default_model: "",
    })
  })

  it("retorna la config si la instancia existe", async () => {
    const settings: SettingsRepository = {
      get: vi.fn(async () => null),
      getMany: vi.fn(async () => ({
        default_provider: "openai-compatible",
        default_provider_instance_id: "inst-1",
        default_model: "gpt-4",
      })),
      set: vi.fn(),
      setMany: vi.fn(),
    }
    const instanceRepo: ProviderInstanceRepository = {
      ...noopInstanceRepo,
      findById: vi.fn(async () => ({
        id: "inst-1",
        kind: "openai-compatible" as const,
        name: "My OpenAI",
        url: "https://api.openai.com/v1",
        hasApiKey: true,
        apiKey: "sk-...",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }) as unknown as ProviderInstance | null),
    }
    const useCase = new GetDefaultProviderUseCase(settings, instanceRepo)

    const result = await useCase.execute()

    expect(result).toEqual({
      provider: "openai-compatible",
      providerInstanceId: "inst-1",
      model: "gpt-4",
    })
    expect(settings.setMany).not.toHaveBeenCalled()
  })
})
