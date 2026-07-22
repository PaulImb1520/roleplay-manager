import { create } from "zustand"
import type { MessageDTO } from "@workspace/shared/types/message"

export interface ChatState {
  messages: MessageDTO[]
  isStreaming: boolean
  streamingContent: string
  editingMessageId: string | null
  editingContent: string
  error: string | null

  setMessages: (messages: MessageDTO[]) => void
  addMessage: (message: MessageDTO) => void
  replaceMessage: (messageId: string, message: MessageDTO) => void
  removeMessage: (messageId: string) => void
  truncateAfter: (position: number) => void
  appendToStreamingContent: (chunk: string) => void
  setStreamingContent: (content: string) => void
  setStreaming: (isStreaming: boolean) => void
  startEditing: (messageId: string, content: string) => void
  setEditingContent: (content: string) => void
  cancelEditing: () => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  streamingContent: "",
  editingMessageId: null,
  editingContent: "",
  error: null,

  setMessages: (messages) => set({ messages, error: null }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message], error: null })),

  replaceMessage: (messageId, message) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? message : m)),
      error: null,
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
      error: null,
    })),

  truncateAfter: (position) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.position <= position),
      error: null,
    })),

  appendToStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  setStreamingContent: (content) => set({ streamingContent: content }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  startEditing: (messageId, content) =>
    set({ editingMessageId: messageId, editingContent: content }),

  setEditingContent: (content) => set({ editingContent: content }),

  cancelEditing: () =>
    set({ editingMessageId: null, editingContent: "" }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      messages: [],
      isStreaming: false,
      streamingContent: "",
      editingMessageId: null,
      editingContent: "",
      error: null,
    }),
}))
