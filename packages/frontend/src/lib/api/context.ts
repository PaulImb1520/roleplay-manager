import type { PromptContextDTO } from "@workspace/shared/types/context"
import { apiRequest } from "./client"

export const getPromptContext = (
  conversationId: string,
  pendingMessage?: string,
): Promise<PromptContextDTO> => {
  const params = new URLSearchParams()
  if (pendingMessage) {
    params.set("pendingMessage", pendingMessage)
  }
  const qs = params.toString()
  return apiRequest(`/api/conversations/${conversationId}/context${qs ? `?${qs}` : ""}`)
}
