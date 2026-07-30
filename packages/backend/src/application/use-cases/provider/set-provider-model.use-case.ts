import type {
  ProviderId,
  SetProviderModelInput,
} from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../domain/errors"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const MODEL_KEYS: Record<ProviderId, string> = {
  ollama: "default_model_ollama",
  "openai-compatible": "default_model_openai_compatible",
}

const REGISTERED: ReadonlyArray<ProviderId> = ["ollama", "openai-compatible"]

export class SetProviderModelUseCase {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly settings: SettingsRepository,
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    providerId: ProviderId,
    input: SetProviderModelInput,
  ): Promise<void> {
    if (!REGISTERED.includes(providerId)) {
      throw new ProviderUnavailableError(
        `Unknown provider id: ${providerId}`,
      )
    }

    if (input.force !== true) {
      let adapter = null
      if (input.providerInstanceId) {
        const instance = await this.providerInstanceRepository.findById(
          input.providerInstanceId,
        )
        if (instance) {
          adapter = this.registry.createAdapter(instance)
        }
      }
      if (!adapter) {
        adapter = await this.registry.getAdapter(providerId)
      }
      if (adapter === null) {
        throw new ProviderUnavailableError(
          `Provider ${providerId} is not configured.`,
        )
      }
      const status = await adapter.validateConnection()
      if (status !== "available") {
        throw new ProviderUnavailableError(
          `Provider ${providerId} is not available (status: ${status}). ` +
            `Reintente cuando el proveedor este activo o use \`force: true\`.`,
        )
      }
    } else {
      this.logger.info("SetProviderModel skipping validation (force)", {
        provider: providerId,
        model: input.model,
      })
    }

    await this.settings.set(MODEL_KEYS[providerId], input.model)
  }
}