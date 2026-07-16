import type { ProviderId, ProviderStatus } from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"

export interface ValidateProviderConnectionResult {
  id: ProviderId
  status: ProviderStatus
  message?: string
}

/**
 * Verifica la conexion con un proveedor.
 *
 * - Si el proveedor no esta configurado (p. ej. OpenAI-compatible
 *   sin URL base), devuelve `status: "unconfigured"` sin lanzar error.
 * - Si el adaptador responde OK, devuelve `"available"`.
 * - Si falla la conexion o expira el timeout, devuelve `"unavailable"`.
 * - Si el id es desconocido, lanza `ProviderUnavailableError`.
 */
export class ValidateProviderConnectionUseCase {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly logger: Logger,
  ) {}

  async execute(id: ProviderId): Promise<ValidateProviderConnectionResult> {
    const adapter = await this.registry.getAdapter(id)
    if (adapter === null) {
      this.logger.info("Provider is not configured", { id })
      return { id, status: "unconfigured" }
    }
    try {
      const status = await adapter.validateConnection()
      return { id, status }
    } catch (error) {
      this.logger.warn("Provider validation threw an error", {
        id,
        message: (error as Error).message,
      })
      throw new ProviderUnavailableError(
        `Provider ${id} is not available: ${(error as Error).message}`,
      )
    }
  }
}
