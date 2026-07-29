import { cn } from "@workspace/ui/lib/utils"

interface TypingIndicatorProps {
  className?: string
}

function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <span
      data-slot="typing-indicator"
      role="status"
      aria-label="Typing"
      className={cn("inline-flex items-center gap-1 align-middle", className)}
    >
      <span className="size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-dot1" />
      <span className="size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-dot2" />
      <span className="size-1.5 rounded-full bg-current opacity-60 motion-safe:animate-dot3" />
    </span>
  )
}

export { TypingIndicator }
