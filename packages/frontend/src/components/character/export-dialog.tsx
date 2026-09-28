import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"

import type { CharacterSummary } from "@workspace/shared/types/character"
import type { ExportSection } from "@workspace/shared/types/export"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Spinner } from "@workspace/ui/components/spinner"
import { DownloadIcon } from "lucide-react"

import { exportCharacter } from "@/lib/api/characters"

const CONVERSATION_CHILDREN: ExportSection[] = [
  "conversations.messages",
  "conversations.memories",
  "conversations.summaries",
  "conversations.settings",
]

const DEFAULT_SECTIONS: ExportSection[] = [
  "definition",
  "profileImage",
  "versions",
  "conversations",
  ...CONVERSATION_CHILDREN,
]

const ALL_SECTIONS: ExportSection[] = [...DEFAULT_SECTIONS, "standaloneSettings"]

const CHILD_LABELS: Record<string, string> = {
  "conversations.messages": "Mensajes",
  "conversations.memories": "Memorias dinámicas",
  "conversations.summaries": "Resúmenes",
  "conversations.settings": "Configuraciones y personalizaciones",
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "personaje"
}

interface ExportDialogProps {
  character: CharacterSummary | null
  conversationCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({
  character,
  conversationCount,
  open,
  onOpenChange,
}: ExportDialogProps) {
  const [selected, setSelected] = useState<Set<ExportSection>>(
    () => new Set(DEFAULT_SECTIONS),
  )
  const [exporting, setExporting] = useState(false)

  const conversationsSelected = selected.has("conversations")

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(new Set(DEFAULT_SECTIONS))
    }
    onOpenChange(next)
  }

  const setSectionChecked = (section: ExportSection, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(section)
      } else {
        next.delete(section)
      }
      if (section === "conversations") {
        for (const child of CONVERSATION_CHILDREN) {
          if (checked) {
            next.add(child)
          } else {
            next.delete(child)
          }
        }
      }
      return next
    })
  }

  const handleExport = async () => {
    if (!character) return
    if (selected.size === 0) {
      toast.error("Selecciona al menos una sección para exportar.")
      return
    }

    setExporting(true)
    try {
      const data = await exportCharacter(character.id, Array.from(selected))
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `personaje-${slugify(character.name)}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Exportación descargada")
      handleOpenChange(false)
    } catch {
      toast.error("No se pudo exportar el personaje.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestor de exportación</DialogTitle>
          <DialogDescription>
            Elige qué quieres exportar de "{character?.name}". El archivo se
            descargará como JSON y respeta la jerarquía: para exportar
            conversaciones, memorias o resúmenes, su sección padre debe estar
            incluida.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Secciones</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set(ALL_SECTIONS))}
            >
              Marcar todo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Desmarcar todo
            </Button>
          </div>
        </div>

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          <label className="flex items-center gap-2 opacity-60">
            <Checkbox checked disabled />
            <span className="text-sm font-semibold">
              {character?.name ?? "Personaje"}
            </span>
          </label>

          <div className="flex flex-col gap-3 border-l pl-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={selected.has("definition")}
                onCheckedChange={(checked) =>
                  setSectionChecked("definition", checked)
                }
              />
              <span className="text-sm">
                Definición (versión actual, tarjetas incluidas)
              </span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={selected.has("profileImage")}
                onCheckedChange={(checked) =>
                  setSectionChecked("profileImage", checked)
                }
              />
              <span className="text-sm">Imagen de perfil</span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={selected.has("versions")}
                onCheckedChange={(checked) =>
                  setSectionChecked("versions", checked)
                }
              />
              <span className="text-sm">
                Historial de versiones (con sus tarjetas)
              </span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={conversationsSelected}
                onCheckedChange={(checked) =>
                  setSectionChecked("conversations", checked)
                }
              />
              <span className="text-sm">
                Conversaciones y ramas
                <span className="text-muted-foreground">
                  {" "}
                  ({conversationCount})
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-3 border-l pl-4">
              {CONVERSATION_CHILDREN.map((child) => (
                <label
                  key={child}
                  className={
                    conversationsSelected
                      ? "flex items-center gap-2"
                      : "flex items-center gap-2 opacity-50"
                  }
                >
                  <Checkbox
                    checked={selected.has(child)}
                    disabled={!conversationsSelected}
                    onCheckedChange={(checked) =>
                      setSectionChecked(child, checked)
                    }
                  />
                  <span className="text-sm">{CHILD_LABELS[child]}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={selected.has("standaloneSettings")}
                onCheckedChange={(checked) =>
                  setSectionChecked("standaloneSettings", checked)
                }
              />
              <span className="text-sm">
                Solo configuración (plantilla para aplicar a otro personaje)
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={exporting}
          >
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Spinner /> : <DownloadIcon className="size-4" />}
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
