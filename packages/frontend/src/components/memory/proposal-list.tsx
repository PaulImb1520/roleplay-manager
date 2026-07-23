"use client"

import { useState } from "react"
import { FieldLegend, FieldSet } from "@workspace/ui/components/field"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from "@workspace/ui/components/spinner"
import { Empty, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
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
import type { MemoryChangeProposalDTO } from "@workspace/shared/types/memory-change-proposal"

interface ProposalListProps {
  conversationId: string
}

const operationBadgeClass: Record<string, string> = {
  CREATE: "bg-green-600 text-white",
  UPDATE: "bg-blue-600 text-white",
  DELETE: "bg-red-600 text-white",
}

export function ProposalList({ conversationId }: ProposalListProps) {
  const proposals = useMemoryStore((s) => s.proposals)
  const loading = useMemoryStore((s) => s.loading)
  const applyProposals = useMemoryStore((s) => s.applyProposals)
  const loadMemories = useMemoryStore((s) => s.loadMemories)

  const [editingProposal, setEditingProposal] = useState<MemoryChangeProposalDTO | null>(null)
  const [actor, setActor] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState(1)

  const pendingProposals = proposals.filter((p) => p.status === "pending")

  const handleApplyAll = async () => {
    try {
      const decisions = pendingProposals.map((p) => ({
        proposalId: p.id,
        action: "apply" as const,
      }))
      await applyProposals(conversationId, decisions)
      await loadMemories(conversationId)
      toast.success("Todas las propuestas aplicadas")
    } catch {
      toast.error("Error al aplicar todas las propuestas")
    }
  }

  const handleApply = async (proposal: MemoryChangeProposalDTO) => {
    try {
      await applyProposals(conversationId, [{ proposalId: proposal.id, action: "apply" }])
      await loadMemories(conversationId)
      toast.success("Propuesta aplicada")
    } catch {
      toast.error("Error al aplicar la propuesta")
    }
  }

  const handleDiscard = async (proposal: MemoryChangeProposalDTO) => {
    try {
      await applyProposals(conversationId, [{ proposalId: proposal.id, action: "discard" }])
      toast.success("Propuesta descartada")
    } catch {
      toast.error("Error al descartar la propuesta")
    }
  }

  const openEditDialog = (proposal: MemoryChangeProposalDTO) => {
    setActor(proposal.actor)
    setTitle(proposal.title)
    setDescription(proposal.description)
    setPriority(proposal.priority)
    setEditingProposal(proposal)
  }

  const handleEditSubmit = async () => {
    if (!editingProposal) return
    try {
      await applyProposals(conversationId, [
        {
          proposalId: editingProposal.id,
          action: "apply",
          overrides: { actor, title, description, priority },
        },
      ])
      await loadMemories(conversationId)
      toast.success("Propuesta aplicada con cambios")
      setEditingProposal(null)
    } catch {
      toast.error("Error al aplicar la propuesta")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (pendingProposals.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No hay propuestas pendientes.</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <FieldSet>
        <FieldLegend>Propuestas pendientes</FieldLegend>
        {pendingProposals.length > 1 && (
          <Button onClick={handleApplyAll} className="self-start">Aceptar todo</Button>
        )}
        <div className="flex flex-col gap-3">
          {pendingProposals.map((proposal) => (
            <div key={proposal.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Badge className={operationBadgeClass[proposal.operation]}>
                  {proposal.operation}
                </Badge>
                <span className="text-sm font-medium">{proposal.actor}</span>
                <Badge variant="outline">{proposal.priority}</Badge>
              </div>
              <span className="text-sm font-semibold">{proposal.title}</span>
              <p className="text-sm text-muted-foreground">{proposal.description}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApply(proposal)}>Aceptar</Button>
                <Button size="sm" variant="outline" onClick={() => openEditDialog(proposal)}>
                  Editar y aceptar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDiscard(proposal)}>Descartar</Button>
              </div>
            </div>
          ))}
        </div>
      </FieldSet>

      <Dialog open={!!editingProposal} onOpenChange={(open) => { if (!open) setEditingProposal(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar y aceptar propuesta</DialogTitle>
            <DialogDescription>
              Revisa y modifica los campos antes de aceptar la propuesta.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="edit-actor">Actor</Label>
              <Input id="edit-actor" value={actor} onChange={(e) => setActor(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="edit-title">Título</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="edit-priority">Prioridad (1-10)</Label>
              <Input id="edit-priority" type="number" min={1} max={10} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button onClick={handleEditSubmit}>Aceptar cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
