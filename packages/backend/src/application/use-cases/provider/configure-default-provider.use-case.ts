import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ProviderId,
} from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../domain/errors"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"

const KEYS = {
  provider: "default_provider",
  providerInstanceId: "default_provider_instance_id",
} as const

const MODEL_KEYS: Record<ProviderId, string> = {
  ollama: "default_model_ollama",
  "openai-compatible": "default_model_openai_compatible",
}

const REGISTERED: ReadonlyArray<ProviderId> = ["ollama", "openai-compatible"]

export class ConfigureDefaultProviderUseCase {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly settings: SettingsRepository,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: ConfigureDefaultProviderInput,
  ): Promise<DefaultProviderConfig> {
    if (!REGISTERED.includes(input.provider)) {
      throw new ProviderUnavailableError(
        `Unknown provider id: ${input.provider}`,
      )
    }

    let adapterToValidate = null
    if (input.providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(
        input.providerInstanceId,
      )
      if (instance) {
        adapterToValidate = this.registry.createAdapter(instance)
      }
    }

    if (input.force !== true) {
      const adapter = adapterToValidate ?? await this.registry.getAdapter(input.provider)
      if (adapter === null) {
        throw new ProviderUnavailableError(
          `Provider ${input.provider} is not configured.`,
        )
      }
      const status = await adapter.validateConnection()
      if (status !== "available") {
        throw new ProviderUnavailableError(
          `Provider ${input.provider} is not available (status: ${status}). ` +
            `Reintente cuando el proveedor este activo o use \`force: true\`.`,
        )
      }
    } else {
      this.logger.info("ConfigureDefaultProvider skipping validation (force)", {
        provider: input.provider,
      })
    }

    const entries: Record<string, string> = {
      [KEYS.provider]: input.provider,
    }
    if (input.providerInstanceId !== undefined) {
      if (input.providerInstanceId === null) {
        await this.settings.set(KEYS.providerInstanceId, "")
      } else {
        entries[KEYS.providerInstanceId] = input.providerInstanceId
      }
    }

    await this.settings.setMany(entries)

    const allKeys = Object.values(MODEL_KEYS)
    const stored = await this.settings.getMany(allKeys)
    const models: Partial<Record<ProviderId, string>> = {}
    for (const [pid, key] of Object.entries(MODEL_KEYS)) {
      const val = stored[key]
      if (val) models[pid as ProviderId] = val
    }

    return {
      provider: input.provider,
      providerInstanceId: input.providerInstanceId ?? null,
      models,
    }
  }
}
