import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  ProviderId,
} from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { SettingsRepository } from "../../../domain/ports/settings.repository"

const KEYS = {
  provider: "default_provider",
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
 *    las dos settings (`default_provider` y `default_model`).
 * 4. Devuelve la configuracion recien persistida.
 */
export class ConfigureDefaultProviderUseCase {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly settings: SettingsRepository,
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

    if (input.force !== true) {
      const adapter = await this.registry.getAdapter(input.provider)
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

    await this.settings.setMany({
      [KEYS.provider]: input.provider,
      [KEYS.model]: input.model,
    })

    return { provider: input.provider, model: input.model }
  }
}
