import type { ProviderModel, ProviderStatus } from "@workspace/shared/types/provider"

import {
  ProviderError,
  ProviderTimeoutError,
} from "../../primary/middlewares/error-handler"
import type { Logger } from "../../../../domain/ports/logger.port"
import type { ProviderPort } from "../../../../domain/ports/provider.port"

export interface OllamaAdapterOptions {
  baseUrl: string
  timeoutMs: number
  logger: Logger
}

/**
 * Adaptador para Ollama local (HTTP contra `/api/tags`).
 *
 * En S1 implementa unicamente `validateConnection` y `listModels`. La
 * generacion de respuestas llega en S4 con su propio adaptador que
 * traduce el `PromptContext` al formato `/api/chat` de Ollama.
 */
export class OllamaAdapter implements ProviderPort {
  constructor(private readonly options: OllamaAdapterOptions) {}

  private get baseUrl(): string {
    return this.options.baseUrl.replace(/\/+$/, "")
  }

  private async fetchWithTimeout(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(),
      this.options.timeoutMs,
    )
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new ProviderTimeoutError(
          `Ollama did not respond within ${this.options.timeoutMs}ms.`,
        )
      }
      throw new ProviderError(
        "PROVIDER_CONNECTION_FAILED",
        `Could not reach Ollama: ${(error as Error).message}`,
      )
    } finally {
      clearTimeout(timer)
    }
  }

  async validateConnection(): Promise<ProviderStatus> {
    try {
      const response = await this.fetchWithTimeout("/api/tags", {
        method: "GET",
      })
      if (response.ok) return "available"
      this.options.logger.warn("Ollama responded with non-OK status", {
        status: response.status,
      })
      return "unavailable"
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        this.options.logger.warn("Ollama timed out on validateConnection")
        return "unavailable"
      }
      this.options.logger.warn(
        "Ollama connection failed",
        { message: (error as Error).message },
      )
      return "unavailable"
    }
  }

  async listModels(): Promise<{
    models: ProviderModel[]
    manualEntryRequired: boolean
  }> {
    try {
      const response = await this.fetchWithTimeout("/api/tags", {
        method: "GET",
      })
      if (!response.ok) {
        throw new ProviderError(
          "PROVIDER_CONNECTION_FAILED",
          `Ollama /api/tags returned ${response.status}`,
        )
      }
      const body = (await response.json()) as {
        models?: Array<{ name: string }>
      }
      const models: ProviderModel[] = (body.models ?? []).map((m) => ({
        id: m.name,
        name: m.name,
      }))
      return { models, manualEntryRequired: false }
    } catch (error) {
      if (error instanceof ProviderTimeoutError) throw error
      if (error instanceof ProviderError) throw error
      throw new ProviderError(
        "PROVIDER_CONNECTION_FAILED",
        `Failed to list Ollama models: ${(error as Error).message}`,
      )
    }
  }
}
