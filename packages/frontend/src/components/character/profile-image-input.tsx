"use client"

import { useCallback, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { UploadIcon } from "lucide-react"
import { uploadCharacterAsset } from "@/lib/api/client"

interface ProfileImageInputProps {
  characterId: string
  name: string
  profileImage: string
  onImageChange: (url: string) => void
  onAssetUploaded: (assetId: string) => void
  onAssetClear: () => void
}

export function ProfileImageInput({
  characterId,
  name,
  profileImage,
  onImageChange,
  onAssetUploaded,
  onAssetClear,
}: ProfileImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Usa PNG, JPEG, WEBP o GIF.")
      return
    }

    const maxSize = 3 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande (máximo 3 MB).")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onImageChange(previewUrl)

    try {
      const result = await uploadCharacterAsset(characterId, file)
      onAssetUploaded(result.assetId)
      toast.success("Imagen subida correctamente")
    } catch {
      toast.error("Error al subir la imagen")
    } finally {
      URL.revokeObjectURL(previewUrl)
      e.target.value = ""
    }
  }, [onImageChange, onAssetUploaded, characterId])

  const handleClear = useCallback(() => {
    onImageChange("")
    onAssetClear()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onImageChange, onAssetClear])

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-16">
        <AvatarImage src={profileImage} alt="Preview" />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className="size-4" />
          Subir imagen
        </Button>
        {profileImage ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            Quitar imagen
          </Button>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
