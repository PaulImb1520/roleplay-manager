import { describe, it, expect, vi, beforeEach } from "vitest"

import * as memoriesApi from "@/lib/api/memories"
import { useMemoryStore } from "./memory.store"
import type { MemoryDTO } from "@workspace/shared/types/memory"

vi.mock("@/lib/api/memories", () => ({
  decayConversationMemories: vi.fn(),
  listMemories: vi.fn(),
}))

const buildMemory = (id: string): MemoryDTO => ({
  id,
  conversationId: "conv-1",
  actor: "Test",
  title: `Memory ${id}`,
  description: "A test memory",
  priority: 5,
  createdBy: "assistant",
  updatedBy: "system",
  createdAt: "2026-07-31T12:00:00Z",
  updatedAt: "2026-07-31T12:00:00Z",
})

describe("useMemoryStore.runDecay", () => {
  beforeEach(() => {
    useMemoryStore.getState().reset()
    vi.clearAllMocks()
  })

  it("llama al endpoint de decay y refresca la lista de memorias", async () => {
    vi.mocked(memoriesApi.decayConversationMemories).mockResolvedValue({ deleted: 2 })
    vi.mocked(memoriesApi.listMemories).mockResolvedValue([buildMemory("m-1")])

    const result = await useMemoryStore.getState().runDecay("conv-1")

    expect(memoriesApi.decayConversationMemories).toHaveBeenCalledWith("conv-1")
    expect(memoriesApi.listMemories).toHaveBeenCalledWith("conv-1")
    expect(result).toEqual({ deleted: 2 })
  })

  it("guarda el registro de la última limpieza con fecha y conteo", async () => {
    vi.mocked(memoriesApi.decayConversationMemories).mockResolvedValue({ deleted: 2 })
    vi.mocked(memoriesApi.listMemories).mockResolvedValue([])

    await useMemoryStore.getState().runDecay("conv-1")

    const lastDecay = useMemoryStore.getState().lastDecay
    expect(lastDecay).not.toBeNull()
    expect(lastDecay!.deleted).toBe(2)
    expect(() => new Date(lastDecay!.at)).not.toThrow()
  })

  it("reemplaza la lista de memorias con el estado post-borrado", async () => {
    vi.mocked(memoriesApi.decayConversationMemories).mockResolvedValue({ deleted: 1 })
    vi.mocked(memoriesApi.listMemories).mockResolvedValue([buildMemory("m-kept")])

    useMemoryStore.setState({
      memories: [buildMemory("m-kept"), buildMemory("m-gone")],
    })
    await useMemoryStore.getState().runDecay("conv-1")

    expect(useMemoryStore.getState().memories.map((m) => m.id)).toEqual(["m-kept"])
  })

  it("propaga el error del endpoint al llamador", async () => {
    vi.mocked(memoriesApi.decayConversationMemories).mockRejectedValue(
      new Error("boom"),
    )

    await expect(useMemoryStore.getState().runDecay("conv-1")).rejects.toThrow("boom")
  })
})
