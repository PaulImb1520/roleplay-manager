import { describe, it, expect, vi } from "vitest"
import type { ProviderStatus } from "@workspace/shared/types/provider"

import { ConfigureDefaultProviderUseCase } from "./configure-default-provider.use-case"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderPort, ProviderRegistry } from "../../../domain/ports/provider.port"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const buildSilentLogger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
})

const buildAvailableAdapter = (): ProviderPort => ({
  validateConnection: vi.fn(async () => "available" as ProviderStatus),
  listModels: vi.fn(),
})

const buildRegistry = (adapter: ProviderPort | null): ProviderRegistry => ({
  listRegistered: () => ["ollama", "openai-compatible"],
  getAdapter: vi.fn(async () => adapter),
})

const buildSettings = (): SettingsRepository => ({
  get: vi.fn(async () => null),
  getMany: vi.fn(async () => ({})),
  set: vi.fn(),
  setMany: vi.fn(async () => undefined),
})

describe("ConfigureDefaultProviderUseCase", () => {
  it("persiste provider y model tras validar conexion", async () => {
    const adapter = buildAvailableAdapter()
    const registry = buildRegistry(adapter)
    const settings = buildSettings()
    const useCase = new ConfigureDefaultProviderUseCase(
      registry,
      settings,
      buildSilentLogger(),
    )

    const result = await useCase.execute({
      provider: "ollama",
      model: "llama3:latest",
    })

    expect(result).toEqual({ provider: "ollama", model: "llama3:latest" })
    expect(adapter.validateConnection).toHaveBeenCalled()
    expect(settings.setMany).toHaveBeenCalledWith({
      default_provider: "ollama",
      default_model: "llama3:latest",
    })
  })

  it("rechaza providerId desconocido", async () => {
    const useCase = new ConfigureDefaultProviderUseCase(
      buildRegistry(null),
      buildSettings(),
      buildSilentLogger(),
    )

    await expect(
      useCase.execute({ provider: "fake" as never, model: "x" }),
    ).rejects.toThrow("Unknown provider id: fake")
  })

  it("rechaza si el proveedor no esta disponible y no esta en force", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(async () => "unavailable" as ProviderStatus),
      listModels: vi.fn(),
    }
    const settings = buildSettings()
    const useCase = new ConfigureDefaultProviderUseCase(
      buildRegistry(adapter),
      settings,
      buildSilentLogger(),
    )

    await expect(
      useCase.execute({ provider: "ollama", model: "x" }),
    ).rejects.toThrow("is not available")

    expect(settings.setMany).not.toHaveBeenCalled()
  })

  it("con force=true persiste aunque la validacion falle", async () => {
    const adapter: ProviderPort = {
      validateConnection: vi.fn(async () => "unavailable" as ProviderStatus),
      listModels: vi.fn(),
    }
    const settings = buildSettings()
    const useCase = new ConfigureDefaultProviderUseCase(
      buildRegistry(adapter),
      settings,
      buildSilentLogger(),
    )

    const result = await useCase.execute({
      provider: "ollama",
      model: "x",
      force: true,
    })

    expect(result).toEqual({ provider: "ollama", model: "x" })
    expect(adapter.validateConnection).not.toHaveBeenCalled()
    expect(settings.setMany).toHaveBeenCalledWith({
      default_provider: "ollama",
      default_model: "x",
    })
  })

  it("rechaza si el proveedor no esta configurado (sin force)", async () => {
    const useCase = new ConfigureDefaultProviderUseCase(
      buildRegistry(null),
      buildSettings(),
      buildSilentLogger(),
    )

    await expect(
      useCase.execute({ provider: "openai-compatible", model: "gpt-x" }),
    ).rejects.toThrow("not configured")
  })
})
