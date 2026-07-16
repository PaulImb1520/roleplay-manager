import type { MessageDTO } from "@workspace/shared/types/message"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export function MessageList({ messages }: { messages: MessageDTO[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">
        No hay mensajes en esta conversación.
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              <p className="mt-1 text-right text-[10px] opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
