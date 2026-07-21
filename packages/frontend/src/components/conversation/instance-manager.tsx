import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@workspace/ui/components/dialog"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"

import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

import {
  createProviderInstance,
  updateProviderInstance,
  deleteProviderInstance,
} from "@/lib/api/provider-instances"
import { ApiClientError } from "@/lib/api/client"

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
  const [newInstanceDialogOpen, setNewInstanceDialogOpen] = useState(false)
  const [editInstanceId, setEditInstanceId] = useState<string | null>(null)
  const [instanceFormName, setInstanceFormName] = useState("")
  const [instanceFormUrl, setInstanceFormUrl] = useState("")
  const [instanceFormApiKey, setInstanceFormApiKey] = useState("")

  const formatError = (e: unknown): string => {
    if (e instanceof ApiClientError) return `[${e.code}] ${e.message}`
    if (e instanceof Error) return e.message
    return "Error desconocido"
  }

  const handleCreateInstance = async () => {
    try {
      const instance = await createProviderInstance({
        kind: "openai-compatible",
        name: instanceFormName.trim(),
        url: instanceFormUrl.trim(),
        apiKey: instanceFormApiKey.trim() || undefined,
      })
      onInstancesChange([...instances, instance])
      setNewInstanceDialogOpen(false)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia creada", { description: instance.name })
    } catch (e) {
      toast.error("No se pudo crear la instancia", { description: formatError(e) })
    }
  }

  const handleUpdateInstance = async () => {
    if (!editInstanceId) return
    try {
      const updated = await updateProviderInstance(editInstanceId, {
        name: instanceFormName.trim() || undefined,
        url: instanceFormUrl.trim() || undefined,
        apiKey: instanceFormApiKey.trim() || undefined,
      })
      onInstancesChange(instances.map((i) => (i.id === editInstanceId ? updated : i)))
      setEditInstanceId(null)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia actualizada")
    } catch (e) {
      toast.error("No se pudo actualizar la instancia", { description: formatError(e) })
    }
  }

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteProviderInstance(id)
      onInstancesChange(instances.filter((i) => i.id !== id))
      if (selectedInstanceId === id) {
        onSelect(null)
      }
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
                    setEditInstanceId(inst.id)
                    setInstanceFormName(inst.name)
                    setInstanceFormUrl(inst.url)
                    setInstanceFormApiKey("")
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
          setEditInstanceId(null)
          setInstanceFormName("")
          setInstanceFormUrl("")
          setInstanceFormApiKey("")
          setNewInstanceDialogOpen(true)
        }}
      >
        <PlusIcon /> Nueva instancia
      </Button>

      <Dialog open={newInstanceDialogOpen} onOpenChange={setNewInstanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva instancia OpenAI-compatible</DialogTitle>
            <DialogDescription>
              Configura una conexion a un proveedor compatible con OpenAI.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="inst-name">Nombre</FieldLabel>
              <Input
                id="inst-name"
                value={instanceFormName}
                onChange={(e) => setInstanceFormName(e.target.value)}
                placeholder="LM Studio local"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="inst-url">URL base</FieldLabel>
              <Input
                id="inst-url"
                type="url"
                value={instanceFormUrl}
                onChange={(e) => setInstanceFormUrl(e.target.value)}
                placeholder="http://localhost:1234/v1"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="inst-key">API key (opcional)</FieldLabel>
              <Input
                id="inst-key"
                type="password"
                value={instanceFormApiKey}
                onChange={(e) => setInstanceFormApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleCreateInstance}>Crear instancia</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editInstanceId !== null} onOpenChange={(o) => { if (!o) setEditInstanceId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar instancia</DialogTitle>
            <DialogDescription>
              Modifica los datos de la conexion.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-name">Nombre</FieldLabel>
              <Input
                id="edit-name"
                value={instanceFormName}
                onChange={(e) => setInstanceFormName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-url">URL base</FieldLabel>
              <Input
                id="edit-url"
                type="url"
                value={instanceFormUrl}
                onChange={(e) => setInstanceFormUrl(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-key">API key (dejar vacio para mantener)</FieldLabel>
              <Input
                id="edit-key"
                type="password"
                value={instanceFormApiKey}
                onChange={(e) => setInstanceFormApiKey(e.target.value)}
                placeholder="(dejar vacio para mantener)"
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleUpdateInstance}>Guardar cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
