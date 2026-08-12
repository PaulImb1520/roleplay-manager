import { useState } from "react"

import type {
  CharacterSummary,
  CharacterVersionDTO,
} from "@workspace/shared/types/character"
import type { ConversationSummary } from "@workspace/shared/types/conversation"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  ClockFading,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

interface CharacterContextMenuProps {
  character: CharacterSummary
  conversations: ConversationSummary[]
  getVersions: (characterId: string) => Promise<CharacterVersionDTO[]>
  onOpenConversation: (conversationId: string) => void
  onCreateConversation: (characterId: string, versionId: string) => void
  onEdit: (characterId: string) => void
  onDelete: (characterId: string) => void
  children: React.ReactNode
}

export function CharacterContextMenu({
  character,
  conversations,
  getVersions,
  onOpenConversation,
  onCreateConversation,
  onEdit,
  onDelete,
  children,
}: CharacterContextMenuProps) {
  const [versions, setVersions] = useState<CharacterVersionDTO[] | null>(null)
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleVersionsOpenChange = (open: boolean) => {
    if (open && versions === null && !versionsLoading) {
      setVersionsLoading(true)
      getVersions(character.id)
        .then(setVersions)
        .finally(() => setVersionsLoading(false))
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<div className="contents" />}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-52">
        <ContextMenuGroup>
          <ContextMenuLabel>{character.name}</ContextMenuLabel>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={conversations.length === 0}
          onClick={() => {
            const latest = conversations[0]
            if (latest) {
              onOpenConversation(latest.id)
            }
          }}
        >
          <ClockFading className="size-4" />
          Conversación más reciente
        </ContextMenuItem>
        <ContextMenuSub onOpenChange={handleVersionsOpenChange}>
          <ContextMenuSubTrigger>
            <MessageSquarePlusIcon className="size-4" />
            Nueva conversación
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {versionsLoading && versions === null ? (
              <ContextMenuItem disabled>Cargando versiones…</ContextMenuItem>
            ) : (
              (versions ?? []).map((v) => (
                <ContextMenuItem
                  key={v.id}
                  onClick={() => onCreateConversation(character.id, v.id)}
                >
                  v{v.versionNumber} ·{" "}
                  {new Date(v.createdAt).toLocaleDateString()}
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={conversations.length === 0}>
            <MessageSquareTextIcon className="size-4" />
            Conversaciones
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {conversations.length === 0 ? (
              <ContextMenuItem disabled>Sin conversaciones</ContextMenuItem>
            ) : (
              conversations.map((conv) => (
                <ContextMenuItem
                  key={conv.id}
                  onClick={() => onOpenConversation(conv.id)}
                >
                  <span className="max-w-48 truncate">
                    {conv.title ?? "Sin título"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(conv.lastActivityAt).toLocaleDateString()}
                  </span>
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onEdit(character.id)}>
          <PencilIcon className="size-4" />
          Editar personaje
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2Icon className="size-4" />
          Eliminar personaje
        </ContextMenuItem>
      </ContextMenuContent>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogTitle>¿Eliminar personaje?</DialogTitle>
          <DialogDescription>
            Se eliminará "{character.name}" junto con todas sus versiones,
            conversaciones, memorias y archivos. Esta acción no se puede
            deshacer.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false)
                onDelete(character.id)
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  )
}
