import type {
  ProviderId,
  ProviderModel,
} from "@workspace/shared/types/provider"

import { ProviderUnavailableError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"
import type { Logger } from "../../../domain/ports/logger.port"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"

export interface ListProviderModelsResult {
  id: ProviderId
  models: ProviderModel[]
  manualEntryRequired: boolean
}

/**
 * Lista los modelos de un proveedor. Si el proveedor no esta
 * configurado, devuelve `{ models: [], manualEntryRequired: true }`
 * para que el frontend habilite la entrada manual.
 */
export class ListProviderModelsUseCase {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly logger: Logger,
  ) {}

  async execute(id: ProviderId): Promise<ListProviderModelsResult> {
    const adapter = await this.registry.getAdapter(id)
    if (adapter === null) {
      this.logger.info("Provider not configured; returning manual entry flag", {
        id,
      })
      return { id, models: [], manualEntryRequired: true }
    }
    try {
      const result = await adapter.listModels()
      return {
        id,
        models: result.models,
        manualEntryRequired: result.manualEntryRequired,
      }
    } catch (error) {
      this.logger.warn("listModels threw an error", {
        id,
        message: (error as Error).message,
      })
      throw new ProviderUnavailableError(
        `Could not list models for ${id}: ${(error as Error).message}`,
      )
    }
  }
}
