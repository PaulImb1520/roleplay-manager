import type { MemoryRepository } from "../../../domain/ports/memory.repository"

export class DeleteMemoryUseCase {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async execute(conversationId: string, memoryId: string): Promise<void> {
    const existing = await this.memoryRepository.findById(memoryId)
    if (!existing) {
      throw new Error(`Memory '${memoryId}' not found`)
    }

    await this.memoryRepository.deleteById(memoryId)
  }
}
