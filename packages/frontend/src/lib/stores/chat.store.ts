import { create } from "zustand"
import type { MessageDTO } from "@workspace/shared/types/message"

export interface ChatState {
  messages: MessageDTO[]
  isStreaming: boolean
  streamingContent: string
  error: string | null

  setMessages: (messages: MessageDTO[]) => void
  addMessage: (message: MessageDTO) => void
  appendToStreamingContent: (chunk: string) => void
  setStreamingContent: (content: string) => void
  setStreaming: (isStreaming: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  streamingContent: "",
  error: null,

  setMessages: (messages) => set({ messages, error: null }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message], error: null })),

  appendToStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  setStreamingContent: (content) => set({ streamingContent: content }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      messages: [],
      isStreaming: false,
      streamingContent: "",
      error: null,
    }),
}))
