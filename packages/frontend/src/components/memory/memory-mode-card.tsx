"use client"

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@workspace/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import type { MemoryProposalMode } from "@workspace/shared/types/conversation"

interface MemoryModeCardProps {
  current: MemoryProposalMode
  onChange: (mode: MemoryProposalMode) => void
}

export function MemoryModeCard({ current, onChange }: MemoryModeCardProps) {
  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">Modo de memorias</FieldLegend>
        <FieldDescription>
          Controla cómo se gestionan las propuestas de memorias.
        </FieldDescription>
        <RadioGroup value={current} onValueChange={(value) => onChange(value as MemoryProposalMode)}>
          <FieldLabel htmlFor="mode-auto">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Auto</FieldTitle>
                <FieldDescription>
                  El sistema acepta y aplica automáticamente las propuestas de memorias después de cada mensaje
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="auto" id="mode-auto" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="mode-manual">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Manual</FieldTitle>
                <FieldDescription>
                  Tú revisas y decides aceptar, editar o descartar cada propuesta
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="manual" id="mode-manual" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  )
}
