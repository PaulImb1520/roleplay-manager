import type {
  ConfigureDefaultProviderInput,
  DefaultProviderConfig,
  OpenAICompatibleConfig,
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
