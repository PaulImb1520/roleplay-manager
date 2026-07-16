import OpenAI from "openai"

import type {
  ProviderModel,
  ProviderStatus,
} from "@workspace/shared/types/provider"

import {
  ProviderError,
  ProviderTimeoutError,
} from "../../primary/middlewares/error-handler"
import type { Logger } from "../../../../domain/ports/logger.port"
import type { ProviderPort } from "../../../../domain/ports/provider.port"

export interface OpenAICompatibleAdapterOptions {
  baseUrl: string
  apiKey: string | null
  timeoutMs: number
  logger: Logger
}

/**
 * Adaptador para cualquier proveedor que exponga la API de OpenAI
 * (LM Studio, vLLM, Text Generation WebUI, OpenAI, Groq, etc.).
 *
 * En S1 se usa unicamente `client.models.list()` para descubrimiento.
 * La generacion llega en S4 usando `client.chat.completions.create`.
 *
 * Decision documentada: usar el SDK oficial `openai` con `baseURL`
 * configurable (ver `docs/09-tooling.md`).
 */
export class OpenAICompatibleAdapter implements ProviderPort {
  private readonly client: OpenAI

  constructor(private readonly options: OpenAICompatibleAdapterOptions) {
    this.client = new OpenAI({
      baseURL: options.baseUrl,
      apiKey: options.apiKey ?? "not-required",
      timeout: options.timeoutMs,
      maxRetries: 0,
    })
  }

  async validateConnection(): Promise<ProviderStatus> {
    try {
      await this.client.models.list()
      return "available"
    } catch (error) {
      return this.translateToUnavailable(error)
    }
  }

  async listModels(): Promise<{
    models: ProviderModel[]
    manualEntryRequired: boolean
  }> {
    try {
      const response = await this.client.models.list()
      const models: ProviderModel[] = response.data.map((m) => ({
        id: m.id,
        name: m.id,
      }))
      return { models, manualEntryRequired: false }
    } catch (error) {
      const status = this.errorStatus(error)
      if (status === 404 || status === 405 || status === 501) {
        this.options.logger.info(
          "Provider does not expose /v1/models; falling back to manual entry",
          { status },
        )
        return { models: [], manualEntryRequired: true }
      }
      if (error instanceof ProviderTimeoutError) throw error
      throw new ProviderError(
        "PROVIDER_CONNECTION_FAILED",
        `Failed to list OpenAI-compatible models: ${(error as Error).message}`,
      )
    }
  }

  private translateToUnavailable(error: unknown): ProviderStatus {
    if (error instanceof ProviderTimeoutError) {
      this.options.logger.warn("OpenAI-compatible timed out")
      return "unavailable"
    }
    this.options.logger.warn(
      "OpenAI-compatible connection failed",
      { message: (error as Error).message },
    )
    return "unavailable"
  }

  private errorStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null) return undefined
    const e = error as { status?: number; response?: { status?: number } }
    return e.status ?? e.response?.status
  }
}
