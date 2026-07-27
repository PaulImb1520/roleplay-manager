import { describe, it, expect } from "vitest"

import { UpdateSummaryUseCase } from "./update-summary.use-case"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import { NotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

const buildRepo = (existing: boolean): SummaryRepository => ({
  findById: async () =>
    existing
      ? ({
          id: "sum-1",
          conversationId: "conv-1",
          content: "old content",
          firstMessageId: "msg-1",
          lastMessageId: "msg-5",
          model: null,
          provider: null,
          createdAt: new Date(),
          editedAt: null,
          withContent: (c: string) => ({
            id: "sum-1",
            conversationId: "conv-1",
            content: c,
            firstMessageId: "msg-1",
            lastMessageId: "msg-5",
            model: null,
            provider: null,
            createdAt: new Date(),
            editedAt: new Date(),
          }),
        } as never)
      : null,
  findByConversationId: async () => [],
  findLatestByConversationId: async () => null,
  create: async (s) => s,
  update: async (s) => s,
  deleteById: async () => {},
  deleteByIds: async () => {},
})

describe("UpdateSummaryUseCase", () => {
  it("updates an existing summary", async () => {
    const useCase = new UpdateSummaryUseCase(buildRepo(true))
    const result = await useCase.execute("conv-1", "sum-1", {
      content: "new content",
    })
    expect(result.content).toBe("new content")
    expect(result.editedAt).not.toBeNull()
  })

  it("throws NotFoundError when summary does not exist", async () => {
    const useCase = new UpdateSummaryUseCase(buildRepo(false))
    await expect(
      useCase.execute("conv-1", "sum-1", { content: "new content" }),
    ).rejects.toThrow(NotFoundError)
  })

  it("throws NotFoundError when conversationId mismatches", async () => {
    const useCase = new UpdateSummaryUseCase(buildRepo(true))
    await expect(
      useCase.execute("conv-999", "sum-1", { content: "new content" }),
    ).rejects.toThrow(NotFoundError)
  })
})
