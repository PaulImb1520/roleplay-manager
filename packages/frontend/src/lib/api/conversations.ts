import type {
  ConversationDetail,
  ConversationSettingsUpdate,
  ConversationSummary,
  CreateConversationInput,
} from "@workspace/shared/types/conversation"
import type { MessageDTO } from "@workspace/shared/types/message"

import { apiRequest, getBaseUrl } from "./client"

export const listConversations = (status?: string): Promise<ConversationSummary[]> => {
  const query = status ? `?status=${status}` : ""
  return apiRequest(`/api/conversations${query}`)
}

export const getConversation = (id: string): Promise<ConversationDetail> =>
  apiRequest(`/api/conversations/${id}`)

export const createConversation = (
  input: CreateConversationInput,
): Promise<ConversationDetail> =>
  apiRequest("/api/conversations", {
    method: "POST",
    body: JSON.stringify(input),
  })

export const archiveConversation = (id: string): Promise<ConversationDetail> =>
  apiRequest(`/api/conversations/${id}/archive`, { method: "POST" })

export const unarchiveConversation = (id: string): Promise<ConversationDetail> =>
  apiRequest(`/api/conversations/${id}/unarchive`, { method: "POST" })

export const updateConversationSettings = (
  id: string,
  settings: ConversationSettingsUpdate,
): Promise<ConversationDetail> =>
  apiRequest(`/api/conversations/${id}/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  })

export interface SendMessageCallbacks {
  onSaved?: (message: MessageDTO) => void
  onChunk: (content: string) => void
  onDone: (message: MessageDTO) => void
  onError: (error: { code: string; message: string }) => void
}

export const sendMessageStreaming = async (
  conversationId: string,
  content: string,
  callbacks: SendMessageCallbacks,
): Promise<void> => {
  const url = `${getBaseUrl()}/api/conversations/${conversationId}/messages`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const error = data?.error ?? {
      code: "UNKNOWN_ERROR",
      message: response.statusText,
    }
    callbacks.onError(error)
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    let currentEvent = ""
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim()
      } else if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6))

          switch (currentEvent) {
            case "saved": {
              callbacks.onSaved?.(data)
              break
            }
            case "chunk": {
              callbacks.onChunk(data.content)
              break
            }
            case "done": {
              callbacks.onDone(data)
              break
            }
            case "error": {
              callbacks.onError(data)
              break
            }
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }
}
