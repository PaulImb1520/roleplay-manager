"use client"

import { useCallback, useEffect, useState } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import { blobToFile, fileToDataUrl, getCroppedImg, type CropArea } from "./image-cropper.utils"

import "react-easy-crop/react-easy-crop.css"

interface ImageCropperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  aspect?: number
  onCropComplete: (croppedFile: File) => void
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  file,
  aspect = 1,
  onCropComplete,
}: ImageCropperDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recortar imagen</DialogTitle>
          <DialogDescription>
            Ajusta la selección cuadrada de la foto de perfil.
          </DialogDescription>
        </DialogHeader>
        {file ? (
          <CropperBody
            key={`${file.name}-${file.size}-${file.lastModified}`}
            file={file}
            aspect={aspect}
            onCropComplete={(croppedFile) => {
              onCropComplete(croppedFile)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface CropperBodyProps {
  file: File
  aspect: number
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

function CropperBody({ file, aspect, onCropComplete, onCancel }: CropperBodyProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fileToDataUrl(file)
      .then((url) => {
        if (!cancelled) setImageSrc(url)
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudo leer la imagen")
      })
    return () => {
      cancelled = true
    }
  }, [file])

  const handleApply = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setBusy(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(blobToFile(blob, "cropped.png", "image/png"))
    } catch {
      toast.error("No se pudo recortar la imagen")
    } finally {
      setBusy(false)
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete])

  return (
    <>
      <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        ) : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!imageSrc || !croppedAreaPixels || busy}
        >
          {busy ? <Spinner /> : null}
          Aplicar
        </Button>
      </DialogFooter>
    </>
  )
}
