export interface PromptContextMessageDTO {
  role: "system" | "user" | "assistant"
  content: string
}

export interface PromptContextMetadataDTO {
  characterName: string
  characterVersion: number
  summaryId: string | null
  memoryCount: number
  recentMessageCount: number
  totalContextMessages: number
  totalCharacters: number
}

export interface PromptContextDTO {
  systemPrompt: string
  messages: PromptContextMessageDTO[]
  metadata: PromptContextMetadataDTO
}
