// Stub de puerto para ProviderPort.
// Se implementa progresivamente en S1 (configuración), S4 (generación)
// y S9 (pulado por proveedor).
//
// Documentado en:
// - docs/06-provider-architecture.md (contrato general)
// - docs/05-use-cases/provider/validate-provider-connection.md
// - docs/05-use-cases/provider/list-provider-models.md

export type ProviderId = "ollama" | "openai-compatible"

export type ProviderStatus = "available" | "unavailable" | "unconfigured"

export interface ProviderModel {
  id: string
  name?: string
}

export type ProviderPort = unknown
