import type { MessageDTO } from "@workspace/shared/types/message"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@workspace/ui/components/message-scroller"
import { MessageBubble } from "./message"

export function MessageList({ messages }: { messages: MessageDTO[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">
        No hay mensajes en esta conversación.
      </div>
    )
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {messages.map((msg, i) => (
              <MessageScrollerItem
                key={msg.id}
                scrollAnchor={i === messages.length - 1}
              >
                <MessageBubble message={msg} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
