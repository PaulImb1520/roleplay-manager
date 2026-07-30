import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  OpenAICompatibleConfig,
  ProviderId,
} from "@workspace/shared/types/provider"

import { apiRequest } from "./client"

export const getDefaultProvider = async (): Promise<DefaultProviderConfig> => {
  return apiRequest("/api/settings/default-provider")
}

export const configureDefaultProvider = async (
  input: ConfigureDefaultProviderInput,
): Promise<DefaultProviderConfig> => {
  return apiRequest("/api/settings/default-provider", {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export const setProviderModel = async (
  providerId: ProviderId,
  model: string,
  options?: { force?: boolean; providerInstanceId?: string },
): Promise<void> => {
  const body: Record<string, unknown> = { model }
  if (options?.force) body.force = true
  if (options?.providerInstanceId) body.providerInstanceId = options.providerInstanceId
  await apiRequest(`/api/settings/provider-model/${providerId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export const getOpenAICompatibleConfig = async (): Promise<OpenAICompatibleConfig> => {
  return apiRequest("/api/settings/openai-compatible")
}

export const setOpenAICompatibleConfig = async (input: {
  url: string
  apiKey?: string
}): Promise<void> => {
  await apiRequest("/api/settings/openai-compatible", {
    method: "PUT",
    body: JSON.stringify(input),
  })
}
