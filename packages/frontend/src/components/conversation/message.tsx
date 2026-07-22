import type { MessageDTO } from "@workspace/shared/types/message"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageActions,
} from "@workspace/ui/components/message"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@workspace/ui/components/context-menu"
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  History,
  RefreshCcw,
  Copy,
} from "lucide-react"
import { parseMessage } from "../../lib/format-message"

export function MessageBubble({
  message,
  isStreaming,
  isLastMessage,
  onDelete,
  onRegenerate,
  onRewind,
  onCyclePrev,
  onCycleNext,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isEditing,
  editContent,
  onEditContentChange,
}: {
  message: Pick<MessageDTO, "id" | "role" | "content" | "createdAt" | "position" | "alternatives" | "alternativesCursor">
  isStreaming?: boolean
  isLastMessage?: boolean
  onDelete?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onRewind?: (messageId: string) => void
  onCyclePrev?: (messageId: string) => void
  onCycleNext?: (messageId: string) => void
  onStartEdit?: (messageId: string, content: string) => void
  onCancelEdit?: () => void
  onSaveEdit?: (messageId: string, content: string) => void
  isEditing?: boolean
  editContent?: string
  onEditContentChange?: (content: string) => void
}) {
  const isUser = message.role === "user"
  const segments = parseMessage(message.content)
  const totalAlternatives = 1 + (message.alternatives?.length ?? 0)
  const currentIndex = message.alternativesCursor ?? 0
  const canCyclePrev = currentIndex < totalAlternatives - 1
  const canCycleNext = currentIndex > 0

  const handleSaveEdit = () => {
    if (editContent?.trim() && onSaveEdit) {
      onSaveEdit(message.id, editContent)
    }
  }

  const handleCancelEdit = () => {
    onCancelEdit?.()
  }

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange?.(e.target.value)}
              className="min-h-20 resize-none"
              autoFocus
            />
            <div className="flex gap-1 justify-end">
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="size-3" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveEdit}
                disabled={!editContent?.trim()}
              >
                <Check className="size-3" />
              </Button>
            </div>
          </div>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger className="select-text">
              <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"} className={isUser ? "ml-auto" : ""}>
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
                    <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse" />
                  )}
                </BubbleContent>
              </Bubble>
            </ContextMenuTrigger>
            {!isStreaming && (
              <ContextMenuContent>
                {!isUser && isLastMessage && (
                  <ContextMenuItem onClick={() => onRegenerate?.(message.id)}>
                    <RefreshCcw className="size-4" />
                    Regenerar
                  </ContextMenuItem>
                )}
                <ContextMenuItem onClick={() => onStartEdit?.(message.id, message.content)}>
                  <Pencil className="size-4" />
                  Editar
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onRewind?.(message.id)}>
                  <History className="size-4" />
                  Rebobinar
                </ContextMenuItem>
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                  <Copy className="size-4" />
                  Copiar
                </ContextMenuItem>
                {message.position > 0 && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive" onClick={() => onDelete?.(message.id)}>
                      <Trash2 className="size-4" />
                      Eliminar
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            )}
          </ContextMenu>
        )}
        {!isStreaming && (message.createdAt || (totalAlternatives > 1 && message.role === "assistant")) && (
          <MessageFooter>
            {message.createdAt && (
              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
            )}
            {totalAlternatives > 1 && message.role === "assistant" && (
              <MessageActions>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={!canCyclePrev}
                  onClick={() => onCyclePrev?.(message.id)}
                >
                  <ChevronLeft className="size-3" />
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {currentIndex + 1}/{totalAlternatives}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={!canCycleNext}
                  onClick={() => onCycleNext?.(message.id)}
                >
                  <ChevronRight className="size-3" />
                </Button>
              </MessageActions>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}
