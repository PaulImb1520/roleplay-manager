import { describe, it, expect, vi } from "vitest"

import { GetDefaultProviderUseCase } from "./get-default-provider.use-case"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

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
    const useCase = new GetDefaultProviderUseCase(settings)

    const result = await useCase.execute()

    expect(result).toEqual({ provider: null, model: null })
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
    const useCase = new GetDefaultProviderUseCase(settings)

    const result = await useCase.execute()

    expect(result).toEqual({ provider: "ollama", model: "llama3:latest" })
  })
})
