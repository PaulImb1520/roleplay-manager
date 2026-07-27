import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import { NotFoundError } from "../../../infrastructure/adapters/primary/middlewares/error-handler"

export class DeleteSummaryUseCase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  async execute(conversationId: string, summaryId: string): Promise<void> {
    const summary = await this.summaryRepository.findById(summaryId)
    if (!summary || summary.conversationId !== conversationId) {
      throw new NotFoundError("SUMMARY_NOT_FOUND", "Summary not found")
    }

    await this.summaryRepository.deleteById(summaryId)
  }
}
