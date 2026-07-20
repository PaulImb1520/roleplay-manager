import type { MessageDTO } from "@workspace/shared/types/message"
import { Message, MessageContent, MessageFooter } from "@workspace/ui/components/message"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import { parseMessage } from "../../lib/format-message"

export function MessageBubble({
  message,
  isStreaming,
}: {
  message: Pick<MessageDTO, "id" | "role" | "content" | "createdAt">
  isStreaming?: boolean
}) {
  const isUser = message.role === "user"
  const segments = parseMessage(message.content)

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        <Bubble variant={isUser ? "default" : "muted"}>
          <BubbleContent>
            {segments.map((segment, i) => {
              switch (segment.type) {
                case "action":
                  return (
                    <span key={i} className="italic text-muted-foreground/70">
                      {segment.content}
                    </span>
                  )
                case "ooc":
                  return (
                    <code
                      key={i}
                      className="text-xs font-mono text-emerald-600 dark:text-emerald-400"
                    >
                      //{segment.content}
                    </code>
                  )
                default:
                  return <span key={i}>{segment.content}</span>
              }
            })}
            {isStreaming && (
              <span className="inline-block w-[2px] h-4 bg-foreground ml-0.5 animate-pulse" />
            )}
          </BubbleContent>
        </Bubble>
        {!isStreaming && message.createdAt && (
          <MessageFooter>
            {new Date(message.createdAt).toLocaleTimeString()}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}
