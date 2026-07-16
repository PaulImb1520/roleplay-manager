import type {
  ConversationDetail,
  ConversationSummary,
  CreateConversationInput,
} from "@workspace/shared/types/conversation"

import { apiRequest } from "./client"

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
