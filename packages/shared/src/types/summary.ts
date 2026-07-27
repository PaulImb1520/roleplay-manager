export type SummaryDTO = {
  id: string
  conversationId: string
  content: string
  firstMessageId: string
  lastMessageId: string
  model: string | null
  provider: string | null
  createdAt: string
  editedAt: string | null
}

export type UpdateSummaryInput = {
  content: string
}

export type ListSummariesOutput = SummaryDTO[]
