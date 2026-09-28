import { useState } from "react"
import { PlusIcon, UploadIcon, UsersIcon } from "lucide-react"

import type { CharacterSummary } from "@workspace/shared/types/character"
import type { CharacterExport } from "@workspace/shared/types/export"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@workspace/ui/components/empty"

import { createConversation } from "@/lib/api/conversations"
import { deleteCharacter, importCharacter } from "@/lib/api/characters"
import { ApiClientError } from "@/lib/api/client"
import { parseCharacterExport } from "@/lib/parse-character-export"
import { CharacterCard } from "./character-card"
import { CharacterDropOverlay } from "./character-drop-overlay"
import {
  ImportCharacterDialog,
  type ImportCharacterResult,
} from "./import-character-dialog"
import { useCharacterList } from "./use-character-list"

export function CharacterList() {
  const {
    characters,
    conversationsByCharacter,
    latestConversationByCharacter,
    lastActivityByCharacter,
    loading,
    refresh,
    loadVersions,
  } = useCharacterList()

  const [importOpen, setImportOpen] = useState(false)

  const openConversation = (conversationId: string) => {
    location.href = `/conversations/${conversationId}`
  }

  const handleImageClick = async (character: CharacterSummary) => {
    const latest = latestConversationByCharacter.get(character.id)
    if (latest) {
      openConversation(latest.id)
      return
    }
    try {
      const conv = await createConversation({ characterId: character.id })
      if (conv.defaultProviderStatus === "unavailable") {
        toast.warning(
          "No hay un proveedor de IA configurado. La conversación se creó, pero no podrá responder hasta que configures uno.",
        )
      }
      openConversation(conv.conversation.id)
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        toast.error("Ya existe una conversación para este personaje y versión.")
      } else {
        toast.error("No se pudo crear la conversación.")
      }
    }
  }

  const handleCreateConversation = async (
    characterId: string,
    versionId: string,
  ) => {
    try {
      const conv = await createConversation({ characterId, versionId })
      if (conv.defaultProviderStatus === "unavailable") {
        toast.warning(
          "No hay un proveedor de IA configurado. La conversación se creó, pero no podrá responder hasta que configures uno.",
        )
      }
      openConversation(conv.conversation.id)
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        toast.error("Ya existe una conversación para este personaje y versión.")
        const latest = latestConversationByCharacter.get(characterId)
        if (latest) {
          openConversation(latest.id)
        }
      } else {
        toast.error("No se pudo crear la conversación.")
      }
    }
  }

  const handleEdit = (characterId: string) => {
    location.href = `/characters/${characterId}`
  }

  const handleDelete = async (characterId: string) => {
    try {
      await deleteCharacter(characterId)
      toast.success("Personaje eliminado.")
      await refresh()
    } catch {
      toast.error("No se pudo eliminar el personaje.")
    }
  }

  const handleImportPayload = async (
    payload: CharacterExport,
  ): Promise<ImportCharacterResult> => {
    try {
      const imported = await importCharacter(payload)
      toast.success(`Personaje "${imported.name}" importado.`)
      await refresh()
      return { ok: true }
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "No se pudo importar el personaje."
      return { ok: false, error: message }
    }
  }

  const handleImportFile = async (file: File) => {
    const parsed = parseCharacterExport(await file.text())
    if (!parsed.ok) {
      toast.error(parsed.error)
      return
    }
    const result = await handleImportPayload(parsed.payload)
    if (!result.ok) {
      toast.error(result.error ?? "No se pudo importar el personaje.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <CharacterDropOverlay onFile={handleImportFile}>
        <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis personajes</h1>
          <p className="text-muted-foreground text-sm">
            {characters.length} personaje{characters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <UploadIcon />
            Importar personaje
          </Button>
          <Button render={<a href="/characters/new" />} nativeButton={false}>
            <PlusIcon />
            Crear personaje
          </Button>
        </div>
      </header>

      {characters.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No tienes personajes</EmptyTitle>
            <EmptyDescription>
              Crea tu primer personaje para empezar una conversación.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<a href="/characters/new" />} nativeButton={false}>
              <PlusIcon />
              Crear personaje
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              conversations={conversationsByCharacter.get(c.id) ?? []}
              lastActivityAt={lastActivityByCharacter.get(c.id) ?? null}
              getVersions={loadVersions}
              onImageClick={handleImageClick}
              onOpenConversation={openConversation}
              onCreateConversation={handleCreateConversation}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
        </div>
      </CharacterDropOverlay>
      <ImportCharacterDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportPayload}
      />
    </>
  )
}
