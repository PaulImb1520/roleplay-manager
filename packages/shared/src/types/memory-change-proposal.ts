export type MemoryChangeProposalDTO = {
  id: string
  conversationId: string
  operation: "CREATE" | "UPDATE" | "DELETE"
  targetMemoryId: string | null
  actor: string
  title: string
  description: string
  priority: number
  status: "pending" | "applied" | "discarded"
  createdAt: string
  processedAt: string | null
  processedBy: "user" | "system"
}

export type ApplyProposalDecision = {
  proposalId: string
  action: "apply" | "discard"
  overrides?: {
    actor?: string
    title?: string
    description?: string
    priority?: number
  }
}
