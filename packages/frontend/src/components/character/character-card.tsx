import type {
  CharacterSummary,
  CharacterVersionDTO,
} from "@workspace/shared/types/character"
import type { ConversationSummary } from "@workspace/shared/types/conversation"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { UsersIcon } from "lucide-react"
import { getCharacterAssetUrl } from "@/lib/api/client"
import { CharacterContextMenu } from "./character-context-menu"

export interface CharacterCardProps {
  character: CharacterSummary
  conversations: ConversationSummary[]
  lastActivityAt: string | null
  getVersions: (characterId: string) => Promise<CharacterVersionDTO[]>
  onImageClick: (character: CharacterSummary) => void
  onOpenConversation: (conversationId: string) => void
  onCreateConversation: (characterId: string, versionId: string) => void
  onEdit: (characterId: string) => void
  onDelete: (characterId: string) => void
}

export function CharacterCard({
  character,
  conversations,
  lastActivityAt,
  getVersions,
  onImageClick,
  onOpenConversation,
  onCreateConversation,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const imageSrc = character.profileImageAssetId
    ? getCharacterAssetUrl(character.id, character.profileImageAssetId)
    : null

  return (
    <CharacterContextMenu
      character={character}
      conversations={conversations}
      getVersions={getVersions}
      onOpenConversation={onOpenConversation}
      onCreateConversation={onCreateConversation}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <Card className="relative overflow-hidden pt-0 transition-shadow hover:shadow-md" size="sm">
        <button
          type="button"
          onClick={() => onImageClick(character)}
          className="block w-full cursor-pointer text-left"
          aria-label={`Abrir la conversación más reciente con ${character.name}`}
        >
          {imageSrc ? (
            <>
              <div className="absolute inset-0 z-30 aspect-video" />
              <img
                src={imageSrc}
                alt={`${character.name} avatar`}
                className="relative z-20 aspect-video w-full object-cover"
              />
            </>
          ) : (
            <div className="relative z-20 flex aspect-video w-full items-center justify-center bg-muted">
              <UsersIcon className="size-10 text-muted-foreground" />
            </div>
          )}
        </button>
        <CardHeader>
          <CardAction>
            <Badge variant="secondary">v{character.versionNumber}</Badge>
          </CardAction>
          <CardTitle>{character.name}</CardTitle>
          {character.subtitle ? (
            <CardDescription>{character.subtitle}</CardDescription>
          ) : null}
        </CardHeader>
        <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
          <span>Creado: {new Date(character.createdAt).toLocaleDateString()}</span>
          <span>
            Última actividad:{" "}
            {lastActivityAt
              ? new Date(lastActivityAt).toLocaleDateString()
              : "Sin conversaciones"}
          </span>
        </CardFooter>
      </Card>
    </CharacterContextMenu>
  )
}
