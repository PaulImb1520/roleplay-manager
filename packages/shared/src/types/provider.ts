export type ProviderId = "ollama" | "openai-compatible"

export type ProviderStatus = "available" | "unavailable" | "unconfigured" | "unknown"

export interface ProviderModel {
  id: string
  name?: string
}

export interface ListModelsResult {
  id: ProviderId
  models: ProviderModel[]
  manualEntryRequired: boolean
}

export interface ProviderListEntry {
  id: ProviderId
}

export interface ProviderStatusEntry {
  id: ProviderId
  status: ProviderStatus
  message?: string
}

export interface DefaultProviderConfig {
  provider: ProviderId | null
  providerInstanceId: string | null
  model: string | null
}

export interface OpenAICompatibleConfig {
  url: string
  hasApiKey: boolean
}

export interface ConfigureDefaultProviderInput {
  provider: ProviderId
  providerInstanceId?: string | null
  model: string
  force?: boolean
}
