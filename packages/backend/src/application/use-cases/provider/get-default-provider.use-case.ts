import type { DefaultProviderConfig, ProviderId } from "@workspace/shared/types/provider"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const KEYS = {
  provider: "default_provider",
  providerInstanceId: "default_provider_instance_id",
} as const

const MODEL_KEYS: Record<ProviderId, string> = {
  ollama: "default_model_ollama",
  "openai-compatible": "default_model_openai_compatible",
}

export class GetDefaultProviderUseCase {
  constructor(
    private readonly settings: SettingsRepository,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(): Promise<DefaultProviderConfig> {
    const allKeys = [
      KEYS.provider,
      KEYS.providerInstanceId,
      ...Object.values(MODEL_KEYS),
    ]
    const stored = await this.settings.getMany(allKeys)
    const provider = stored[KEYS.provider] as DefaultProviderConfig["provider"]
    const instanceIdRaw = stored[KEYS.providerInstanceId]
    const providerInstanceId = instanceIdRaw && instanceIdRaw !== "" ? instanceIdRaw : null

    const models: Partial<Record<ProviderId, string>> = {}
    for (const [pid, key] of Object.entries(MODEL_KEYS)) {
      const val = stored[key]
      if (val) models[pid as ProviderId] = val
    }

    if (providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(providerInstanceId)
      if (!instance) {
        await this.settings.setMany({
          [KEYS.provider]: "",
          [KEYS.providerInstanceId]: "",
          ...Object.fromEntries(
            Object.values(MODEL_KEYS).map((k) => [k, ""]),
          ),
        })
        return { provider: null, providerInstanceId: null, models: {} }
      }
    }

    return {
      provider: provider ?? null,
      providerInstanceId,
      models,
    }
  }
}
