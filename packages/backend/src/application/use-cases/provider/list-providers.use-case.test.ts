import { describe, it, expect, vi } from "vitest"

import { ListProvidersUseCase } from "./list-providers.use-case"
import type { ProviderRegistry } from "../../../domain/ports/provider.port"

const buildRegistry = (
  registered: Array<"ollama" | "openai-compatible"> = ["ollama", "openai-compatible"],
): ProviderRegistry => ({
  listRegistered: () => registered,
  createAdapter: vi.fn(),
  getAdapter: () => Promise.resolve(null),
})

describe("ListProvidersUseCase", () => {
  it("devuelve los IDs registrados por el registry", () => {
    const useCase = new ListProvidersUseCase(buildRegistry())
    const result = useCase.execute()
    expect(result).toEqual([{ id: "ollama" }, { id: "openai-compatible" }])
  })

  it("respeta el orden devuelto por el registry", () => {
    const useCase = new ListProvidersUseCase(
      buildRegistry(["openai-compatible", "ollama"]),
    )
    expect(useCase.execute().map((p) => p.id)).toEqual([
      "openai-compatible",
      "ollama",
    ])
  })
})
