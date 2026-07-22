"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@workspace/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { toast } from "@workspace/ui/components/sonner"
import type { MemoryProposalMode } from "@workspace/shared/types/conversation"
import { updateConversationSettings } from "@/lib/api/conversations"

interface MemoryModeCardProps {
  conversationId: string
  current: MemoryProposalMode
  onChange: (mode: MemoryProposalMode) => void
}

export function MemoryModeCard({ conversationId, current, onChange }: MemoryModeCardProps) {
  const handleValueChange = async (value: string) => {
    const mode = value as MemoryProposalMode
    try {
      await updateConversationSettings(conversationId, { memoryProposalMode: mode })
      onChange(mode)
      toast.success("Modo de memorias actualizado")
    } catch {
      toast.error("Error al actualizar el modo de memorias")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modo de memorias</CardTitle>
        <CardDescription>
          Controla cómo se gestionan las propuestas de memorias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={current} onValueChange={handleValueChange}>
          <FieldLabel>
            <Field className="flex-row items-center gap-3">
              <RadioGroupItem value="auto" />
              <FieldContent>
                <span className="text-sm font-medium">Auto</span>
                <FieldDescription>
                  El sistema acepta y aplica automáticamente las propuestas de memorias después de cada mensaje
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
          <FieldLabel>
            <Field className="flex-row items-center gap-3">
              <RadioGroupItem value="manual" />
              <FieldContent>
                <span className="text-sm font-medium">Manual</span>
                <FieldDescription>
                  Tú revisas y decides aceptar, editar o descartar cada propuesta
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
