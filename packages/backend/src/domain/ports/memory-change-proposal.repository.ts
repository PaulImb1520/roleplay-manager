import type { MemoryChangeProposal } from "../entities/memory-change-proposal.entity"
import type { ProcessedBy, ProposalStatus } from "../entities/memory-change-proposal.entity"

export interface MemoryChangeProposalRepository {
  create(proposal: MemoryChangeProposal): Promise<MemoryChangeProposal>
  createMany(proposals: MemoryChangeProposal[]): Promise<void>
  findById(id: string): Promise<MemoryChangeProposal | null>
  findPendingByConversationId(conversationId: string): Promise<MemoryChangeProposal[]>
  findByConversationId(conversationId: string): Promise<MemoryChangeProposal[]>
  update(proposal: MemoryChangeProposal): Promise<MemoryChangeProposal>
  markProcessed(
    id: string,
    status: ProposalStatus,
    processedBy: ProcessedBy,
  ): Promise<void>
  discardPendingByConversationId(conversationId: string): Promise<void>
}
