import type { SummaryDTO, UpdateSummaryInput } from "@workspace/shared/types/summary"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import { NotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class UpdateSummaryUseCase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  async execute(
    conversationId: string,
    summaryId: string,
    input: UpdateSummaryInput,
  ): Promise<SummaryDTO> {
    const summary = await this.summaryRepository.findById(summaryId)
    if (!summary || summary.conversationId !== conversationId) {
      throw new NotFoundError("SUMMARY_NOT_FOUND", "Summary not found")
    }

    const updated = summary.withContent(input.content)
    await this.summaryRepository.update(updated)

    return {
      id: updated.id,
      conversationId: updated.conversationId,
      content: updated.content,
      firstMessageId: updated.firstMessageId,
      lastMessageId: updated.lastMessageId,
      model: updated.model,
      provider: updated.provider,
      createdAt: updated.createdAt.toISOString(),
      editedAt: updated.editedAt?.toISOString() ?? null,
    }
  }
}
