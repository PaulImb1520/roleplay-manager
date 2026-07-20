import { useState, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Send } from "lucide-react"

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void
  disabled: boolean
}) {
  const [content, setContent] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="min-h-[44px] max-h-[200px] resize-none"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        disabled={disabled}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !content.trim()}
        className="shrink-0"
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
