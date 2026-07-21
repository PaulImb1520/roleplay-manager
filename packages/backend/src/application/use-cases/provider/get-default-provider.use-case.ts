import type { DefaultProviderConfig } from "@workspace/shared/types/provider"

import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const KEYS = {
  provider: "default_provider",
  providerInstanceId: "default_provider_instance_id",
  model: "default_model",
} as const

export class GetDefaultProviderUseCase {
  constructor(private readonly settings: SettingsRepository) {}

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
    return {
      provider: provider ?? null,
      providerInstanceId,
      model: model ?? null,
    }
  }
}
