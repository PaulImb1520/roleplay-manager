import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"
import { Send, ArrowRight, Eye } from "lucide-react"

export function MessageInput({
  onSend,
  onContinue,
  onPreview,
  disabled,
  rewindDraft = "",
}: {
  onSend: (content: string) => void
  onContinue?: () => void
  onPreview?: (content?: string) => void
  disabled: boolean
  rewindDraft?: string
}) {
  const [content, setContent] = useState(rewindDraft)

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setContent("")
  }

  const handleContinue = () => {
    if (disabled) return
    onContinue?.()
  }

  const hasText = content.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="min-h-11 max-h-50 resize-none"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        disabled={disabled}
      />
      {hasText ? (
        <ContextMenu>
          <ContextMenuTrigger>
            <Button
              type="submit"
              size="icon"
              disabled={disabled || !hasText}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onPreview?.(content.trim())}>
              <Eye className="size-4" />
              Previsualizar contexto
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              disabled={disabled}
              className="shrink-0"
              onClick={handleContinue}
            >
              <ArrowRight className="size-4" />
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onPreview?.()}>
              <Eye className="size-4" />
              Previsualizar contexto
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </form>
  )
}
