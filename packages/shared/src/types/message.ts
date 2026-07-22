export interface MessageDTO {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  position: number
  alternatives: string[]
  alternativesCursor: number
  createdAt: string
  editedAt: string | null
}
