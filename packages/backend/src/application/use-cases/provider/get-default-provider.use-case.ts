import type { DefaultProviderConfig } from "@workspace/shared/types/provider"

import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const KEYS = {
  provider: "default_provider",
  model: "default_model",
} as const

export class GetDefaultProviderUseCase {
  constructor(private readonly settings: SettingsRepository) {}

  async execute(): Promise<DefaultProviderConfig> {
    const stored = await this.settings.getMany([KEYS.provider, KEYS.model])
    const provider = stored[KEYS.provider] as DefaultProviderConfig["provider"]
    const model = stored[KEYS.model]
    return { provider: provider ?? null, model: model ?? null }
  }
}
