import type { ConversationRepository } from "../../../domain/ports/conversation.repository"
import type { MemoryRepository } from "../../../domain/ports/memory.repository"
import type { MessageRepository } from "../../../domain/ports/message.repository"
import type { Logger } from "../../../domain/ports/logger.port"
import {
  ConversationArchivedError,
  ConversationNotFoundError,
} from "../../../domain/errors"
import {
  MAX_MEMORIES_DECAYED_PER_SWEEP,
  MemoryDecayPolicy,
} from "../../../domain/value-objects/memory-decay-policy"

export interface DecayConversationMemoryInput {
  conversationId: string
  manual?: boolean
}

export interface DecayConversationMemoryResult {
  deleted: number
}

export class DecayConversationMemoryUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly memoryRepository: MemoryRepository,
    private readonly messageRepository: MessageRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: DecayConversationMemoryInput,
  ): Promise<DecayConversationMemoryResult> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId,
    )
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId)
    }
    if (conversation.status === "archived") {
      throw new ConversationArchivedError(input.conversationId)
    }

    if (conversation.memoryDecayMode === "off") {
      return { deleted: 0 }
    }
    if (conversation.memoryDecayMode === "manual" && !input.manual) {
      return { deleted: 0 }
    }

    const policy = MemoryDecayPolicy.fromConversation(conversation)
    const memories = await this.memoryRepository.findByConversationId(
      input.conversationId,
    )
    if (memories.length === 0) {
      return { deleted: 0 }
    }

    const messages = await this.messageRepository.findByConversationId(
      input.conversationId,
    )

    const candidates = memories
      .map((memory) => ({
        memory,
        turns: policy.turnsSince(memory.updatedAt, messages),
      }))
      .filter(({ memory, turns }) =>
        policy.isDeletionCandidate(memory.priority, turns),
      )
      .sort(
        (a, b) =>
          policy.effectivePriority(a.memory.priority, a.turns) -
          policy.effectivePriority(b.memory.priority, b.turns),
      )
      .slice(0, MAX_MEMORIES_DECAYED_PER_SWEEP)

    for (const { memory } of candidates) {
      await this.memoryRepository.deleteById(memory.id)
    }

    if (candidates.length > 0) {
      this.logger.info("Memory decay sweep deleted memories", {
        conversationId: input.conversationId,
        deleted: candidates.length,
      })
    }

    return { deleted: candidates.length }
  }
}
