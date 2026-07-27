import { describe, it, expect } from "vitest"

import { DeleteSummaryUseCase } from "./delete-summary.use-case"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import { NotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

const buildRepo = (existing: boolean): SummaryRepository => ({
  findById: async () =>
    existing
      ? ({
          id: "sum-1",
          conversationId: "conv-1",
        } as never)
      : null,
  findByConversationId: async () => [],
  findLatestByConversationId: async () => null,
  create: async (s) => s,
  update: async (s) => s,
  deleteById: async () => {},
  deleteByIds: async () => {},
})

describe("DeleteSummaryUseCase", () => {
  it("deletes an existing summary", async () => {
    const useCase = new DeleteSummaryUseCase(buildRepo(true))
    await expect(
      useCase.execute("conv-1", "sum-1"),
    ).resolves.toBeUndefined()
  })

  it("throws NotFoundError when summary does not exist", async () => {
    const useCase = new DeleteSummaryUseCase(buildRepo(false))
    await expect(
      useCase.execute("conv-1", "sum-1"),
    ).rejects.toThrow(NotFoundError)
  })

  it("throws NotFoundError when conversationId mismatches", async () => {
    const useCase = new DeleteSummaryUseCase(buildRepo(true))
    await expect(
      useCase.execute("conv-999", "sum-1"),
    ).rejects.toThrow(NotFoundError)
  })
})
