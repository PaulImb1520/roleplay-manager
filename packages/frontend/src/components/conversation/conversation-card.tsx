import type { ConversationSummary } from "@workspace/shared/types/conversation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ArchiveIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function ConversationCard({
  conversation,
  onToggleArchive,
}: {
  conversation: ConversationSummary
  onToggleArchive: (id: string, action: "archive" | "unarchive") => void
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <a href={`/conversations/${conversation.id}`} className="block">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="size-10 overflow-hidden rounded-full bg-muted">
            {conversation.characterProfileImage ? (
              <img
                src={conversation.characterProfileImage}
                alt={`${conversation.characterName} avatar`}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <CardTitle className="text-base">
              {conversation.title ?? conversation.characterName}
            </CardTitle>
            <p className="text-muted-foreground text-xs">{conversation.characterName}</p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={conversation.status === "active" ? "default" : "secondary"}>
            {conversation.status === "active" ? "Activa" : "Archivada"}
          </Badge>
          <span>{conversation.messageCount} mensajes</span>
          <span>Actualizado: {new Date(conversation.updatedAt).toLocaleDateString()}</span>
        </CardContent>
      </a>
      <div className="flex justify-end border-t px-4 py-2">
        {conversation.status === "active" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onToggleArchive(conversation.id, "archive")
            }}
          >
            <ArchiveIcon className="mr-1 size-3" />
            Archivar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              onToggleArchive(conversation.id, "unarchive")
            }}
          >
            <RotateCcwIcon className="mr-1 size-3" />
            Desarchivar
          </Button>
        )}
      </div>
    </Card>
  )
}
