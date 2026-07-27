import { describe, it, expect } from "vitest"

import { ListSummariesUseCase } from "./list-summaries.use-case"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"

const buildRepo = (count: number): SummaryRepository => ({
  findById: async () => null,
  findByConversationId: async () =>
    Array.from({ length: count }, (_, i) => ({
      id: `sum-${i}`,
      conversationId: "conv-1",
      content: `Summary ${i}`,
      firstMessageId: `msg-${i * 5}`,
      lastMessageId: `msg-${i * 5 + 4}`,
      model: null,
      provider: null,
      createdAt: new Date(2024, 0, i + 1),
      editedAt: null,
    })) as never[],
  findLatestByConversationId: async () => null,
  create: async (s) => s,
  update: async (s) => s,
  deleteById: async () => {},
  deleteByIds: async () => {},
})

describe("ListSummariesUseCase", () => {
  it("returns summaries for a conversation", async () => {
    const useCase = new ListSummariesUseCase(buildRepo(2))
    const result = await useCase.execute("conv-1")
    expect(result).toHaveLength(2)
    expect(result[0].content).toBe("Summary 0")
  })

  it("returns empty array when no summaries exist", async () => {
    const useCase = new ListSummariesUseCase(buildRepo(0))
    const result = await useCase.execute("conv-1")
    expect(result).toEqual([])
  })
})
