import type { DefaultProviderConfig } from "@workspace/shared/types/provider"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const KEYS = {
  provider: "default_provider",
  providerInstanceId: "default_provider_instance_id",
  model: "default_model",
} as const

export class GetDefaultProviderUseCase {
  constructor(
    private readonly settings: SettingsRepository,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(): Promise<DefaultProviderConfig> {
    const stored = await this.settings.getMany([
      KEYS.provider,
      KEYS.providerInstanceId,
      KEYS.model,
    ])
    const provider = stored[KEYS.provider] as DefaultProviderConfig["provider"]
    const instanceIdRaw = stored[KEYS.providerInstanceId]
    const providerInstanceId = instanceIdRaw && instanceIdRaw !== "" ? instanceIdRaw : null
    const model = stored[KEYS.model]

    if (providerInstanceId) {
      const instance = await this.providerInstanceRepository.findById(providerInstanceId)
      if (!instance) {
        await this.settings.setMany({
          [KEYS.provider]: "",
          [KEYS.providerInstanceId]: "",
          [KEYS.model]: "",
        })
        return { provider: null, providerInstanceId: null, model: null }
      }
    }

    return {
      provider: provider ?? null,
      providerInstanceId,
      model: model ?? null,
    }
  }
}
