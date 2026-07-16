export type ConversationStatus = "active" | "archived"

export interface ConversationSummary {
  id: string
  characterName: string
  characterProfileImage: string
  title: string | null
  status: ConversationStatus
  messageCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationDetail {
  id: string
  characterId: string
  characterName: string
  characterProfileImage: string
  title: string | null
  status: ConversationStatus
  model: string | null
  provider: string | null
  temperature: number | null
  maxTokens: number | null
  topP: number | null
  frequencyPenalty: number | null
  presencePenalty: number | null
  stopSequences: string[]
  createdAt: string
  updatedAt: string
  messages: MessageDTO[]
}

export interface MessageDTO {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  position: number
  alternatives: string[]
  createdAt: string
  editedAt: string | null
}

export interface CreateConversationInput {
  characterId: string
}
