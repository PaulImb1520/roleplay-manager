export type ConversationStatus = "active" | "archived"

export type MemoryProposalMode = "auto" | "manual"

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
  providerInstanceId: string | null
  recentMessageCount: number
  summaryFrequency: number
  temperature: number | null
  maxTokens: number | null
  topP: number | null
  frequencyPenalty: number | null
  presencePenalty: number | null
  stopSequences: string[]
  memoryProposalMode: MemoryProposalMode
  createdAt: string
  updatedAt: string
  messages: MessageDTO[]
}

export interface ConversationSettingsUpdate {
  model?: string | null
  provider?: string | null
  providerInstanceId?: string | null
  recentMessageCount?: number
  summaryFrequency?: number
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
  memoryProposalMode?: MemoryProposalMode
  force?: boolean
}

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

export interface CreateConversationInput {
  characterId: string
}
