import { and, eq } from "drizzle-orm"

import type { MemoryChangeProposalRepository } from "../../../../../domain/ports/memory-change-proposal.repository"
import type { Database } from "../../../../config/database"
import { memoryChangeProposals } from "../schema"

export class DrizzleMemoryChangeProposalRepository
  implements MemoryChangeProposalRepository
{
  constructor(private readonly db: Database) {}

  async discardPendingByConversationId(conversationId: string): Promise<void> {
    await this.db
      .update(memoryChangeProposals)
      .set({
        status: "discarded",
        processedAt: new Date(),
        processedBy: "system",
      })
      .where(
        and(
          eq(memoryChangeProposals.conversationId, conversationId),
          eq(memoryChangeProposals.status, "pending"),
        ),
      )
  }
}
