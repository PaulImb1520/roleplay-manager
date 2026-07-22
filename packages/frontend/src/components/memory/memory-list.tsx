"use client"

import { useState } from "react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from "@workspace/ui/components/spinner"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import { useMemoryStore } from "@/lib/stores/memory.store"
import type { MemoryDTO } from "@workspace/shared/types/memory"

interface MemoryListProps {
  conversationId: string
}

type DialogMode = null | "create" | "edit" | "delete"

export function MemoryList({ conversationId }: MemoryListProps) {
  const memories = useMemoryStore((s) => s.memories)
  const loading = useMemoryStore((s) => s.loading)
  const createMemory = useMemoryStore((s) => s.createMemory)
  const updateMemory = useMemoryStore((s) => s.updateMemory)
  const deleteMemory = useMemoryStore((s) => s.deleteMemory)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [target, setTarget] = useState<MemoryDTO | null>(null)
  const [actor, setActor] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState(5)

  const resetForm = () => {
    setActor("")
    setTitle("")
    setDescription("")
    setPriority(5)
    setTarget(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogMode("create")
  }

  const openEdit = (memory: MemoryDTO) => {
    setActor(memory.actor)
    setTitle(memory.title)
    setDescription(memory.description)
    setPriority(memory.priority)
    setTarget(memory)
    setDialogMode("edit")
  }

  const openDelete = (memory: MemoryDTO) => {
    setTarget(memory)
    setDialogMode("delete")
  }

  const handleCreate = async () => {
    if (!actor.trim() || !title.trim() || !description.trim()) {
      toast.error("Actor, título y descripción son requeridos")
      return
    }
    try {
      await createMemory(conversationId, { actor, title, description, priority })
      toast.success("Memoria creada")
      setDialogMode(null)
      resetForm()
    } catch {
      toast.error("Error al crear la memoria")
    }
  }

  const handleEdit = async () => {
    if (!target) return
    try {
      await updateMemory(conversationId, target.id, { actor, title, description, priority })
      toast.success("Memoria actualizada")
      setDialogMode(null)
      resetForm()
    } catch {
      toast.error("Error al actualizar la memoria")
    }
  }

  const handleDelete = async () => {
    if (!target) return
    try {
      await deleteMemory(conversationId, target.id)
      toast.success("Memoria eliminada")
      setDialogMode(null)
      resetForm()
    } catch {
      toast.error("Error al eliminar la memoria")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Memoria dinámica</CardTitle>
          <CardAction>
            <Button onClick={openCreate}>Crear memoria</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {memories.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay memorias todavía</EmptyTitle>
                <EmptyDescription>
                  Las memorias se generan automáticamente durante la conversación o puedes crearlas manualmente.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            memories.map((memory) => (
              <div key={memory.id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{memory.actor}</span>
                  <Badge variant="outline">{memory.priority}</Badge>
                </div>
                <span className="text-sm font-semibold">{memory.title}</span>
                <p className="text-sm text-muted-foreground">{memory.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(memory)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => openDelete(memory)}>Eliminar</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => { if (!open) { setDialogMode(null); resetForm() } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Crear memoria" : "Editar memoria"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Añade una nueva memoria para esta conversación."
                : "Modifica los campos de la memoria."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="memory-actor">Actor</Label>
              <Input id="memory-actor" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Nombre del actor" />
            </Field>
            <Field>
              <Label htmlFor="memory-title">Título</Label>
              <Input id="memory-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la memoria" />
            </Field>
            <Field>
              <Label htmlFor="memory-description">Descripción</Label>
              <Textarea id="memory-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contenido de la memoria" />
            </Field>
            <Field>
              <Label htmlFor="memory-priority">Prioridad (1-10)</Label>
              <Input id="memory-priority" type="number" min={1} max={10} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button onClick={dialogMode === "create" ? handleCreate : handleEdit}>
              {dialogMode === "create" ? "Crear" : "Guardar cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => { if (!open) { setDialogMode(null); resetForm() } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar memoria</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta memoria? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {target && (
            <div className="rounded-lg border p-3 text-sm">
              <p><strong>{target.actor}</strong>: {target.title}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
