import { useEffect, useRef, useState } from "react"
import type { ConversationDetail } from "@workspace/shared/types/conversation"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@workspace/ui/components/message-scroller"
import { Button } from "@workspace/ui/components/button"
import { SettingsIcon } from "lucide-react"

import { useChatStore } from "../../lib/stores/chat.store"
import { sendMessageStreaming } from "../../lib/api/conversations"
import { MessageBubble } from "./message"
import { MessageInput } from "./message-input"
import { SettingsPanel } from "./settings-panel"

export function Chat({ conversation }: { conversation: ConversationDetail }) {
  const [conv, setConv] = useState(conversation)

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
      setMessages(conv.messages)
      initialized.current = true
    }
  }, [conv, setMessages])

  const handleSend = async (content: string) => {
    setError(null)
    setStreaming(true)
    setStreamingContent("")

    await sendMessageStreaming(conv.id, content, {
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
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="size-8 overflow-hidden rounded-full bg-muted">
          {conv.characterProfileImage ? (
            <img
              src={conv.characterProfileImage}
              alt={`${conv.characterName} avatar`}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">
            {conv.title ?? conv.characterName}
          </h2>
          <p className="text-xs text-muted-foreground">
            {conv.characterName} &middot;{" "}
            {conv.status === "active" ? "Activa" : "Archivada"}
          </p>
        </div>
        <div className="ml-auto">
          <SettingsPanel
            conversationId={conv.id}
            current={conv}
            onSettingsChanged={setConv}
          >
            <Button variant="ghost" size="icon" data-icon="inline-start">
              <SettingsIcon className="size-4" />
            </Button>
          </SettingsPanel>
        </div>
      </header>

      <MessageScrollerProvider autoScroll={isStreaming}>
        <MessageScroller className="flex-1 p-2 pr-0">
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
      </MessageScrollerProvider>

      <footer className="border-t">
        <MessageInput
          onSend={handleSend}
          disabled={isStreaming || conv.status === "archived"}
        />
      </footer>
    </div>
  )
}
