"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle, FieldContent } from "@workspace/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import type { ConversationDetail, MemoryDecayMode } from "@workspace/shared/types/conversation"

import { updateConversationSettings } from "@/lib/api/conversations"
import { ApiClientError } from "@/lib/api/client"
import { useMemoryStore } from "@/lib/stores/memory.store"

interface MemoryDecayCardProps {
  conversationId: string
  current: ConversationDetail
  onSettingsChanged: (updated: ConversationDetail) => void
}

const MODE_LABELS: Record<MemoryDecayMode, { title: string; description: string }> = {
  silent: {
    title: "Silencioso",
    description: "Las memorias que pierden relevancia se eliminan automáticamente después de cada mensaje",
  },
  manual: {
    title: "Manual",
    description: "Tú decides cuándo limpiar: elimina todas las candidatas con el botón o borra las que consideres necesarias",
  },
  off: {
    title: "Desactivado",
    description: "No se elimina ninguna memoria, pero las de baja importancia siguen excluidas del prompt",
  },
}

export function MemoryDecayCard({
  conversationId,
  current,
  onSettingsChanged,
}: MemoryDecayCardProps) {
  const runDecay = useMemoryStore((s) => s.runDecay)

  const [mode, setMode] = useState<MemoryDecayMode>(current.memoryDecayMode)
  const [threshold, setThreshold] = useState(current.memoryDecayThreshold)
  const [ageThreshold, setAgeThreshold] = useState(current.memoryDecayAgeThreshold)
  const [decaySpeed, setDecaySpeed] = useState(current.memoryDecaySpeed)
  const [saving, setSaving] = useState(false)
  const [decaying, setDecaying] = useState(false)

  const hasChanges =
    mode !== current.memoryDecayMode ||
    threshold !== current.memoryDecayThreshold ||
    ageThreshold !== current.memoryDecayAgeThreshold ||
    decaySpeed !== current.memoryDecaySpeed

  const handleSave = async () => {
    if (threshold < 1 || threshold > 10) {
      toast.error("El umbral de importancia debe estar entre 1 y 10")
      return
    }
    if (ageThreshold < 1) {
      toast.error("Los turnos para borrar deben ser al menos 1")
      return
    }
    if (decaySpeed < 1) {
      toast.error("Los turnos por -1 de prioridad deben ser al menos 1")
      return
    }
    setSaving(true)
    try {
      const updated = await updateConversationSettings(conversationId, {
        memoryDecayMode: mode,
        memoryDecayThreshold: threshold,
        memoryDecayAgeThreshold: ageThreshold,
        memoryDecaySpeed: decaySpeed,
      })
      onSettingsChanged(updated)
      toast.success("Configuración de auto-degradación guardada")
    } catch (e) {
      const message = e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
      toast.error("No se pudo guardar la configuración", { description: message })
    } finally {
      setSaving(false)
    }
  }

  const handleRunDecay = async () => {
    setDecaying(true)
    try {
      const result = await runDecay(conversationId)
      if (result.deleted > 0) {
        toast.success(`Limpieza completada: ${result.deleted} memoria(s) eliminada(s).`)
      } else {
        toast.info("No hay memorias candidatas para eliminar.")
      }
    } catch {
      toast.error("No se pudo ejecutar la limpieza.")
    } finally {
      setDecaying(false)
    }
  }

  return (
    <FieldGroup>
      <FieldSet>
        <FieldDescription>
          Las memorias pierden -1 de importancia cada {decaySpeed} mensaje(s) tuyo(s) sin actualizarse. Las que caen bajo el umbral de ({threshold}) se excluyen del prompt y son candidatas a eliminación.
        </FieldDescription>
        <RadioGroup value={mode} onValueChange={(value) => setMode(value as MemoryDecayMode)}>
          {(Object.keys(MODE_LABELS) as MemoryDecayMode[]).map((m) => (
            <FieldLabel key={m} htmlFor={`decay-${m}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{MODE_LABELS[m].title}</FieldTitle>
                  <FieldDescription>{MODE_LABELS[m].description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={m} id={`decay-${m}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 p-1">
        <Field>
          <FieldLabel htmlFor="decay-threshold">Umbral (1-10)</FieldLabel>
          <Input
            id="decay-threshold"
            type="number"
            min={1}
            max={10}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="decay-age">Turnos para borrar</FieldLabel>
          <Input
            id="decay-age"
            type="number"
            min={1}
            value={ageThreshold}
            onChange={(e) => setAgeThreshold(Number(e.target.value))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="decay-speed">Turnos para -1</FieldLabel>
          <Input
            id="decay-speed"
            type="number"
            min={1}
            value={decaySpeed}
            onChange={(e) => setDecaySpeed(Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? <Spinner /> : null}
          Guardar configuración
        </Button>
        <Button
          variant="outline"
          onClick={handleRunDecay}
          disabled={mode === "off" || decaying}
        >
          {decaying ? <Spinner /> : null}
          Ejecutar limpieza ahora
        </Button>
      </div>
    </FieldGroup>
  )
}
