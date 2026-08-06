"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { ImagePlusIcon, XIcon } from "lucide-react"
import { getCharacterAssetUrl } from "@/lib/api/client"
import { ImageCropperDialog } from "./image-cropper-dialog"

interface ProfileImageInputProps {
  characterId: string
  name: string
  profileImageAssetId: string | null
  pendingFile: File | null
  aspect?: number
  showClearButton?: boolean
  clearLabel?: string
  onFileSelected: (file: File) => void
  onClear: () => void
}

const ACCEPTED_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 3 * 1024 * 1024

function validateFile(file: File): boolean {
  if (!ACCEPTED_MIMES.includes(file.type)) {
    toast.error("Tipo de archivo no permitido. Usa PNG, JPEG, WEBP o GIF.")
    return false
  }
  if (file.size > MAX_SIZE_BYTES) {
    toast.error("El archivo es demasiado grande (máximo 3 MB).")
    return false
  }
  return true
}

export function ProfileImageInput({
  characterId,
  name,
  profileImageAssetId,
  pendingFile,
  aspect = 1,
  showClearButton = true,
  clearLabel = "Quitar imagen",
  onFileSelected,
  onClear,
}: ProfileImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [cropperFile, setCropperFile] = useState<File | null>(null)
  const previewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setCropperFile(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleClear = useCallback(() => {
    onClear()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [onClear])

  const imageSrc =
    previewUrl ?? (profileImageAssetId ? getCharacterAssetUrl(characterId, profileImageAssetId) : null)

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen de perfil"
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        {imageSrc ? (
          <Avatar className="size-24">
            <AvatarImage src={imageSrc} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <ImagePlusIcon className="size-10 text-muted-foreground" />
        )}
        <div className="text-sm">
          <p className="font-medium">
            Arrastra una imagen aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPEG, WEBP o GIF · máximo 3 MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
        className="hidden"
      />
      {pendingFile ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Imagen pendiente de guardar al crear el personaje.
        </p>
      ) : null}
      {imageSrc && showClearButton ? (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="mt-2">
          <XIcon className="size-3" />
          {clearLabel}
        </Button>
      ) : null}

      <ImageCropperDialog
        open={!!cropperFile}
        onOpenChange={(open) => {
          if (!open) setCropperFile(null)
        }}
        file={cropperFile}
        aspect={aspect}
        onCropComplete={(croppedFile) => {
          onFileSelected(croppedFile)
          setCropperFile(null)
        }}
      />
    </div>
  )
}
