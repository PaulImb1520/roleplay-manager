import type {
  ListModelsResult,
  ProviderId,
  ProviderStatusEntry,
} from "@workspace/shared/types/provider"

import { apiRequest } from "./client"

export const listProviders = async (): Promise<{ id: ProviderId }[]> => {
  return apiRequest("/api/providers")
}

export const validateProvider = async (
  id: ProviderId,
): Promise<ProviderStatusEntry> => {
  return apiRequest(`/api/providers/${id}/status`)
}

export const listProviderModels = async (
  id: ProviderId,
  instanceId?: string,
): Promise<ListModelsResult> => {
  const params = instanceId ? `?instanceId=${encodeURIComponent(instanceId)}` : ""
  return apiRequest(`/api/providers/${id}/models${params}`)
}
