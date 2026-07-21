import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"

export class ListProviderInstancesUseCase {
  constructor(
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(): Promise<ProviderInstance[]> {
    return this.providerInstanceRepository.list()
  }
}
