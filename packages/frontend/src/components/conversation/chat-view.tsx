import type { ConversationDetail } from "@workspace/shared/types/conversation"
import { MessageList } from "./message-list"
import { getCharacterAssetUrl } from "@/lib/api/client"

export function ChatView({ conversation }: { conversation: ConversationDetail }) {
  const imageSrc = conversation.profileImageAssetId
    ? getCharacterAssetUrl(conversation.characterId, conversation.profileImageAssetId)
    : null
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="size-8 overflow-hidden rounded-full bg-muted">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={`${conversation.characterName} avatar`}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">
            {conversation.title ?? conversation.characterName}
          </h2>
          <p className="text-xs text-muted-foreground">
            {conversation.characterName}
          </p>
        </div>
      </header>

      <MessageList messages={conversation.messages} />

      <footer className="border-t p-4">
        <div className="mx-auto max-w-2xl rounded-lg border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
          El envío de mensajes estará disponible próximamente.
        </div>
      </footer>
    </div>
  )
}
