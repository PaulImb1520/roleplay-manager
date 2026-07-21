import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import { DomainError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class DeleteProviderInstanceUseCase {
  constructor(
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.providerInstanceRepository.findById(id)
    if (!existing) {
      throw new DomainError(
        "PROVIDER_INSTANCE_NOT_FOUND",
        `Provider instance '${id}' not found.`,
      )
    }

    await this.providerInstanceRepository.delete(id)
  }
}
