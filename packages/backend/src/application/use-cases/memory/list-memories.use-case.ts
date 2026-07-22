import type { MemoryRepository } from "../../../domain/ports/memory.repository"
import type { MemoryDTO } from "@workspace/shared/types/memory"
import type { Memory } from "../../../domain/entities/memory.entity"

export class ListMemoriesUseCase {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async execute(conversationId: string): Promise<MemoryDTO[]> {
    const memories = await this.memoryRepository.findByConversationId(conversationId)
    return memories.map(toMemoryDTO)
  }
}

function toMemoryDTO(m: Memory): MemoryDTO {
  return {
    id: m.id,
    conversationId: m.conversationId,
    actor: m.actor,
    title: m.title,
    description: m.description,
    priority: m.priority,
    createdBy: m.createdBy,
    updatedBy: m.updatedBy,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }
}
