import type {
  ProviderInstance,
  UpdateProviderInstanceInput,
} from "@workspace/shared/types/provider-instance"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import { DomainError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class UpdateProviderInstanceUseCase {
  constructor(
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateProviderInstanceInput,
  ): Promise<ProviderInstance> {
    const existing = await this.providerInstanceRepository.findById(id)
    if (!existing) {
      throw new DomainError(
        "PROVIDER_INSTANCE_NOT_FOUND",
        `Provider instance '${id}' not found.`,
      )
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new DomainError(
        "NAME_REQUIRED",
        "Provider instance name cannot be empty.",
      )
    }

    if (input.url !== undefined && !input.url.trim()) {
      throw new DomainError(
        "URL_REQUIRED",
        "URL cannot be empty for openai-compatible providers.",
      )
    }

    return this.providerInstanceRepository.update(id, input)
  }
}
