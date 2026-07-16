import type { ProviderId } from "@workspace/shared/types/provider"

import type { ProviderRegistry } from "../../../domain/ports/provider.port"

export interface ListProvidersResultEntry {
  id: ProviderId
}

export class ListProvidersUseCase {
  constructor(private readonly registry: ProviderRegistry) {}

  execute(): ListProvidersResultEntry[] {
    return this.registry.listRegistered().map((id) => ({ id }))
  }
}
