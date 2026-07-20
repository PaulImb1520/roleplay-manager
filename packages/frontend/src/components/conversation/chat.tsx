import { useEffect, useRef } from "react"
import type { ConversationDetail } from "@workspace/shared/types/conversation"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@workspace/ui/components/message-scroller"

import { useChatStore } from "../../lib/stores/chat.store"
import { sendMessageStreaming } from "../../lib/api/conversations"
import { MessageBubble } from "./message"
import { MessageInput } from "./message-input"

export function Chat({ conversation }: { conversation: ConversationDetail }) {
  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    setMessages,
    addMessage,
    appendToStreamingContent,
    setStreaming,
    setStreamingContent,
    setError,
  } = useChatStore()

  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      setMessages(conversation.messages)
      initialized.current = true
    }
  }, [conversation, setMessages])

  const handleSend = async (content: string) => {
    setError(null)
    setStreaming(true)
    setStreamingContent("")

    await sendMessageStreaming(conversation.id, content, {
      onSaved: (message) => {
        addMessage(message)
      },
      onChunk: (chunk) => {
        appendToStreamingContent(chunk)
      },
      onDone: (message) => {
        addMessage(message)
        setStreamingContent("")
        setStreaming(false)
      },
      onError: (err) => {
        setError(err.message)
        setStreaming(false)
        setStreamingContent("")
      },
    })
  }

  return (
    <MessageScrollerProvider autoScroll={isStreaming}>
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <div className="size-8 overflow-hidden rounded-full bg-muted">
            {conversation.characterProfileImage ? (
              <img
                src={conversation.characterProfileImage}
                alt={`${conversation.characterName} avatar`}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">
              {conversation.title ?? conversation.characterName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.characterName} &middot;{" "}
              {conversation.status === "active" ? "Activa" : "Archivada"}
            </p>
          </div>
        </header>

        <MessageScroller className="flex-1 pt-4">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {messages.length === 0 && !streamingContent ? (
                <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">
                  No hay mensajes en esta conversación.
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageScrollerItem
                      key={msg.id}
                      scrollAnchor={i === messages.length - 1 && !isStreaming}
                    >
                      <MessageBubble message={msg} />
                    </MessageScrollerItem>
                  ))}
                  {streamingContent && (
                    <MessageScrollerItem key="streaming" scrollAnchor>
                      <MessageBubble
                        message={{
                          id: "streaming",
                          role: "assistant",
                          content: streamingContent,
                          createdAt: "",
                        }}
                        isStreaming
                      />
                    </MessageScrollerItem>
                  )}
                </>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>

        <footer className="border-t">
          <MessageInput
            onSend={handleSend}
            disabled={isStreaming || conversation.status === "archived"}
          />
        </footer>
      </div>
    </MessageScrollerProvider>
  )
}
