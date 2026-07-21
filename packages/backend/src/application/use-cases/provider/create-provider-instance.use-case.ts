import type {
  CreateProviderInstanceInput,
  ProviderInstance,
} from "@workspace/shared/types/provider-instance"
import type { ProviderId } from "@workspace/shared/types/provider"

import type { ProviderInstanceRepository } from "../../../domain/ports/provider-instance.repository"
import { DomainError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

const VALID_KINDS: ProviderId[] = ["ollama", "openai-compatible"]

export class CreateProviderInstanceUseCase {
  constructor(
    private readonly providerInstanceRepository: ProviderInstanceRepository,
  ) {}

  async execute(input: CreateProviderInstanceInput): Promise<ProviderInstance> {
    if (!VALID_KINDS.includes(input.kind as ProviderId)) {
      throw new DomainError(
        "INVALID_PROVIDER_KIND",
        `Invalid provider kind. Must be one of: ${VALID_KINDS.join(", ")}`,
      )
    }

    if (!input.name.trim()) {
      throw new DomainError(
        "NAME_REQUIRED",
        "Provider instance name is required.",
      )
    }

    if (input.kind === "openai-compatible" && !input.url.trim()) {
      throw new DomainError(
        "URL_REQUIRED",
        "URL is required for openai-compatible providers.",
      )
    }

    return this.providerInstanceRepository.create({
      kind: input.kind,
      name: input.name.trim(),
      url: input.url.trim(),
      apiKey: input.apiKey,
    })
  }
}
