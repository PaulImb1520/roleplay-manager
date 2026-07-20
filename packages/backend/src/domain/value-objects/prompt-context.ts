export interface PromptContextMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface PromptContext {
  systemPrompt: string
  messages: PromptContextMessage[]
}

export interface GenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
}

export interface StreamChunk {
  content: string
}
