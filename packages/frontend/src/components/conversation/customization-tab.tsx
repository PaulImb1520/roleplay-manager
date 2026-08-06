"use client"

import { useCallback, useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { Spinner } from "@workspace/ui/components/spinner"

import type { ConversationDetail } from "@workspace/shared/types/conversation"

import { uploadConversationCustomImage, ApiClientError } from "@/lib/api/client"
import { setConversationCustomProfileImage } from "@/lib/api/conversations"
import { ProfileImageInput } from "../character/profile-image-input"

interface CustomizationTabProps {
  conversation: ConversationDetail
  onSettingsChanged: (updated: ConversationDetail) => void
}

export function CustomizationTab({
  conversation,
  onSettingsChanged,
}: CustomizationTabProps) {
  const [saving, setSaving] = useState(false)

  const handleFileSelected = useCallback(
    async (file: File) => {
      setSaving(true)
      try {
        const { assetId } = await uploadConversationCustomImage(conversation.id, file)
        const updated = await setConversationCustomProfileImage(conversation.id, assetId)
        onSettingsChanged(updated)
        toast.success("Imagen actualizada para este chat")
      } catch (e) {
        toast.error("No se pudo actualizar la imagen", { description: errorMessage(e) })
      } finally {
        setSaving(false)
      }
    },
    [conversation.id, onSettingsChanged],
  )

  const handleClear = useCallback(async () => {
    setSaving(true)
    try {
      const updated = await setConversationCustomProfileImage(conversation.id, null)
      onSettingsChanged(updated)
      toast.success("Imagen personalizada eliminada")
    } catch (e) {
      toast.error("No se pudo eliminar la imagen", { description: errorMessage(e) })
    } finally {
      setSaving(false)
    }
  }, [conversation.id, onSettingsChanged])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Imagen de perfil personalizada</p>
        <p className="text-xs text-muted-foreground">
          Esta imagen solo se aplica a este chat. El resto seguirá usando la imagen del
          personaje.
        </p>
      </div>

      <ProfileImageInput
        characterId={conversation.characterId}
        name={conversation.characterName}
        profileImageAssetId={conversation.profileImageAssetId}
        pendingFile={null}
        showClearButton={!!conversation.customProfileImageAssetId}
        clearLabel="Quitar imagen personalizada"
        onFileSelected={handleFileSelected}
        onClear={handleClear}
      />

      {saving ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner />
          <span>Guardando imagen…</span>
        </div>
      ) : null}
    </div>
  )
}

function errorMessage(e: unknown): string {
  return e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
}