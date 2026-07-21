import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ProviderId,
} from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"
import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"

const KEYS = {
  provider: "default_provider",
  providerInstanceId: "default_provider_instance_id",
  model: "default_model",
} as const

const REGISTERED: ReadonlyArray<ProviderId> = ["ollama", "openai-compatible"]

/**
 * Configura el proveedor y modelo por defecto del sistema.
 *
 * Comportamiento:
 * 1. Verifica que `provider` sea un id registrado.
 * 2. Si `force !== true`, valida la conexion antes de persistir.
 *    Si la validacion falla, lanza `ProviderUnavailableError` y NO
 *    persiste cambios. La configuracion anterior, si existia, se
 *    conserva intacta.
 * 3. Si la validacion pasa (o se omite por `force: true`), persiste
 *    las settings (`default_provider`, `default_provider_instance_id`,
 *    `default_model`).
 * 4. Devuelve la configuracion recien persistida.
 */
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
      [KEYS.model]: input.model,
    }
    if (input.providerInstanceId !== undefined) {
      if (input.providerInstanceId === null) {
        await this.settings.set(KEYS.providerInstanceId, "")
      } else {
        entries[KEYS.providerInstanceId] = input.providerInstanceId
      }
    }

    await this.settings.setMany(entries)

    return {
      provider: input.provider,
      providerInstanceId: input.providerInstanceId ?? null,
      model: input.model,
    }
  }
}
