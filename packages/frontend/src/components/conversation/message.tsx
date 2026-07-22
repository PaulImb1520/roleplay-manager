import { useState } from "react"
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
  Pencil,
  RotateCcw,
  Undo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react"
import { parseMessage } from "../../lib/format-message"

export function MessageBubble({
  message,
  isStreaming,
  onEdit,
  onDelete,
  onRegenerate,
  onCyclePrev,
  onCycleNext,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isEditing,
  editContent,
  onEditContentChange,
}: {
  message: Pick<MessageDTO, "id" | "role" | "content" | "createdAt" | "alternatives" | "alternativesCursor">
  isStreaming?: boolean
  onEdit?: (messageId: string, content: string) => void
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
  const [showActions, setShowActions] = useState(false)
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
    <Message
      align={isUser ? "end" : "start"}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
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
        )}
        {!isStreaming && message.createdAt && (
          <MessageFooter>
            {new Date(message.createdAt).toLocaleTimeString()}
          </MessageFooter>
        )}
      </MessageContent>

      {showActions && !isStreaming && totalAlternatives > 1 && message.role === "assistant" && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={!canCyclePrev}
            onClick={() => onCyclePrev?.(message.id)}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <span className="tabular-nums">
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
        </div>
      )}

      {showActions && !isStreaming && !isEditing && (
        <MessageActions>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onRegenerate?.(message.id)}
            >
              <RotateCcw className="size-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onStartEdit?.(message.id, message.content)}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onRewind?.(message.id)}
          >
            <Undo2 className="size-3" />
          </Button>
          {message.position > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive"
              onClick={() => onDelete?.(message.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </MessageActions>
      )}
    </Message>
  )
}
