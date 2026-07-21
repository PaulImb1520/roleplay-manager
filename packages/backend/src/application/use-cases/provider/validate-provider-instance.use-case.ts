import type { ProviderInstanceStatus } from "@workspace/shared/types/provider-instance"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"
import type { Logger } from "../../../domain/ports/logger.port"
import { DomainError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class ValidateProviderInstanceUseCase {
  constructor(
    private readonly providerInstanceRepository: ProviderInstanceRepository,
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<ProviderInstanceStatus> {
    const instance = await this.providerInstanceRepository.findById(id)
    if (!instance) {
      throw new DomainError(
        "PROVIDER_INSTANCE_NOT_FOUND",
        `Provider instance '${id}' not found.`,
      )
    }

    try {
      const adapter = this.providerRegistry.createAdapter(instance)
      const rawStatus = await adapter.validateConnection()
      const status = rawStatus === "available" ? "available" : "unavailable"
      return { id, status, message: undefined }
    } catch (error) {
      this.logger.warn("Provider instance validation failed", {
        id,
        message: (error as Error).message,
      })
      return {
        id,
        status: "unavailable",
        message: (error as Error).message,
      }
    }
  }
}
