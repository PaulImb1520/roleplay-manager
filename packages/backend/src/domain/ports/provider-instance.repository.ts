import type {
  CreateProviderInstanceInput,
  UpdateProviderInstanceInput,
} from "@workspace/shared/types/provider-instance"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

export interface ProviderInstanceRepository {
  list(): Promise<ProviderInstance[]>
  findById(id: string): Promise<ProviderInstance | null>
  create(input: CreateProviderInstanceInput): Promise<ProviderInstance>
  update(id: string, input: UpdateProviderInstanceInput): Promise<ProviderInstance>
  delete(id: string): Promise<void>
}
