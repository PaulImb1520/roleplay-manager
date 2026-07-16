import type {
  ListModelsResult,
  ProviderId,
  ProviderModel,
  ProviderStatus,
} from "@workspace/shared/types/provider"

export interface ProviderPort {
  validateConnection(): Promise<ProviderStatus>
  listModels(): Promise<{ models: ProviderModel[]; manualEntryRequired: boolean }>
}

export type { ListModelsResult, ProviderId, ProviderModel, ProviderStatus }

/**
 * Registry de proveedores.
 *
 * Devuelve el adaptador configurado para un `ProviderId` dado, o `null`
 * si el proveedor no está configurado (caso típico: OpenAI-compatible
 * sin URL base).
 *
 * El listado de IDs registrados se mantiene como una constante del
 * registry para que la API pueda anunciar al frontend qué proveedores
 * están disponibles sin necesidad de instanciar cada adaptador.
 */
export interface ProviderRegistry {
  listRegistered(): ProviderId[]
  getAdapter(id: ProviderId): Promise<ProviderPort | null>
}
