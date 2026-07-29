import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"

import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

import {
  createProviderInstance,
  updateProviderInstance,
  deleteProviderInstance,
} from "@/lib/api/provider-instances"
import { ApiClientError } from "@/lib/api/client"
import { InstanceFormDialog } from "@/components/provider/instance-form-dialog"

interface InstanceManagerProps {
  instances: ProviderInstance[]
  loading: boolean
  selectedInstanceId: string | null
  onSelect: (id: string | null) => void
  onInstancesChange: (instances: ProviderInstance[]) => void
}

export function InstanceManager({
  instances,
  loading,
  selectedInstanceId,
  onSelect,
  onInstancesChange,
}: InstanceManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingInstance, setEditingInstance] = useState<ProviderInstance | null>(null)

  const formatError = (e: unknown): string => {
    if (e instanceof ApiClientError) return `[${e.code}] ${e.message}`
    if (e instanceof Error) return e.message
    return "Error desconocido"
  }

  const handleCreateInstance = async (name: string, url: string, apiKey: string) => {
    if (import.meta.env.DEV) {
      console.log("[InstanceManager] handleCreateInstance called with:", { name: name.trim(), url: url.trim(), apiKey: apiKey.trim() || undefined })
    }
    try {
      const instance = await createProviderInstance({
        kind: "openai-compatible",
        name: name.trim(),
        url: url.trim(),
        apiKey: apiKey.trim() || undefined,
      })
      onInstancesChange([...instances, instance])
      setDialogOpen(false)
      toast.success("Instancia creada", { description: instance.name })
    } catch (e) {
      toast.error("No se pudo crear la instancia", { description: formatError(e) })
    }
  }

  const handleUpdateInstance = async (id: string, name: string, url: string, apiKey: string) => {
    try {
      const updated = await updateProviderInstance(id, {
        name: name.trim() || undefined,
        url: url.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
      })
      onInstancesChange(instances.map((i) => (i.id === id ? updated : i)))
      setDialogOpen(false)
      toast.success("Instancia actualizada")
    } catch (e) {
      toast.error("No se pudo actualizar la instancia", { description: formatError(e) })
    }
  }

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteProviderInstance(id)
      onInstancesChange(instances.filter((i) => i.id !== id))
      if (selectedInstanceId === id) onSelect(null)
      toast.success("Instancia eliminada")
    } catch (e) {
      toast.error("No se pudo eliminar la instancia", { description: formatError(e) })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Separator />
      <p className="text-sm font-medium">Instancias disponibles</p>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando instancias...
        </div>
      ) : instances.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay instancias configuradas. Crea una nueva.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {instances.map((inst) => (
            <div
              key={inst.id}
              className={`flex items-center justify-between rounded-lg border p-2 cursor-pointer transition-colors ${
                selectedInstanceId === inst.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onSelect(inst.id)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{inst.name}</span>
                <span className="text-xs text-muted-foreground">
                  {inst.url || "Sin URL"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDialogMode("edit")
                    setEditingInstance(inst)
                    setDialogOpen(true)
                  }}
                >
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteInstance(inst.id)
                  }}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDialogMode("create")
          setEditingInstance(null)
          setDialogOpen(true)
        }}
      >
        <PlusIcon /> Nueva instancia
      </Button>

      <InstanceFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialName={editingInstance?.name ?? ""}
        initialUrl={editingInstance?.url ?? ""}
        initialApiKey=""
        onClose={() => {
          setDialogOpen(false)
          setEditingInstance(null)
        }}
        onSave={(name, url, apiKey) => {
          if (dialogMode === "edit" && editingInstance) {
            handleUpdateInstance(editingInstance.id, name, url, apiKey)
          } else {
            handleCreateInstance(name, url, apiKey)
          }
        }}
      />
    </div>
  )
}
