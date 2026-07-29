import { describe, it, expect } from "vitest"

import { DeleteMemoryUseCase } from "./delete-memory.use-case"
import type { MemoryRepository } from "../../../domain/ports/memory.repository"
import { NotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

const buildRepo = (existing: boolean): MemoryRepository => ({
  findById: async () => (existing ? ({ id: "mem-1" } as never) : null),
  deleteById: async () => {},
  findByConversationId: async () => [],
  create: async (m) => m,
  update: async (m) => m,
})

describe("DeleteMemoryUseCase", () => {
  it("deletes an existing memory", async () => {
    const useCase = new DeleteMemoryUseCase(buildRepo(true))
    await expect(useCase.execute("conv-1", "mem-1")).resolves.toBeUndefined()
  })

  it("throws NotFoundError when memory does not exist", async () => {
    const useCase = new DeleteMemoryUseCase(buildRepo(false))
    await expect(useCase.execute("conv-1", "mem-1")).rejects.toThrow(NotFoundError)
  })

  it("throws 404 when memory does not exist", async () => {
    const useCase = new DeleteMemoryUseCase(buildRepo(false))
    try {
      await useCase.execute("conv-1", "mem-1")
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError)
      expect((e as NotFoundError).status).toBe(404)
      expect((e as NotFoundError).code).toBe("MEMORY_NOT_FOUND")
    }
  })
})
