export interface MemoryChangeProposalRepository {
  discardPendingByConversationId(conversationId: string): Promise<void>
}
