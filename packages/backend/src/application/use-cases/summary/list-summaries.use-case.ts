import type { SummaryDTO } from "@workspace/shared/types/summary"
import type { SummaryRepository } from "../../../domain/ports/summary.repository"
import type { Summary } from "../../../domain/entities/summary.entity"

export class ListSummariesUseCase {
  constructor(private readonly summaryRepository: SummaryRepository) {}

  async execute(conversationId: string): Promise<SummaryDTO[]> {
    const summaries = await this.summaryRepository.findByConversationId(conversationId)
    return summaries.map(toSummaryDTO)
  }
}

function toSummaryDTO(s: Summary): SummaryDTO {
  return {
    id: s.id,
    conversationId: s.conversationId,
    content: s.content,
    firstMessageId: s.firstMessageId,
    lastMessageId: s.lastMessageId,
    model: s.model,
    provider: s.provider,
    createdAt: s.createdAt.toISOString(),
    editedAt: s.editedAt?.toISOString() ?? null,
  }
}
