import type {
  ProviderInstance,
  CreateProviderInstanceInput,
  UpdateProviderInstanceInput,
  ProviderInstanceStatus,
} from "@workspace/shared/types/provider-instance"

import { apiRequest } from "./client"

export const listProviderInstances = async (): Promise<ProviderInstance[]> => {
  return apiRequest("/api/provider-instances")
}

export const createProviderInstance = async (
  input: CreateProviderInstanceInput,
): Promise<ProviderInstance> => {
  return apiRequest("/api/provider-instances", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export const updateProviderInstance = async (
  id: string,
  input: UpdateProviderInstanceInput,
): Promise<ProviderInstance> => {
  return apiRequest(`/api/provider-instances/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export const deleteProviderInstance = async (id: string): Promise<void> => {
  await apiRequest(`/api/provider-instances/${id}`, { method: "DELETE" })
}

export const validateProviderInstance = async (
  id: string,
): Promise<ProviderInstanceStatus> => {
  return apiRequest(`/api/provider-instances/${id}/status`)
}
