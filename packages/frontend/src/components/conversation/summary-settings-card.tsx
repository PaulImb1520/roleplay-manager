import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

interface SummarySettingsCardProps {
  recentMessageCount: number
  summaryFrequency: number
  onRecentMessageCountChange: (v: number) => void
  onSummaryFrequencyChange: (v: number) => void
}

export function SummarySettingsCard({
  recentMessageCount,
  summaryFrequency,
  onRecentMessageCountChange,
  onSummaryFrequencyChange,
}: SummarySettingsCardProps) {
  const handleSummaryFrequencyChange = (raw: number) => {
    const next = Math.max(1, Math.floor(raw) || 1)
    onSummaryFrequencyChange(next)
    if (recentMessageCount >= next) {
      onRecentMessageCountChange(Math.max(1, next - 1))
    }
  }

  const recentMax = Math.max(1, summaryFrequency - 1)

  return (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="summary-freq">Frecuencia de resumen</FieldLabel>
            <Input
              id="summary-freq"
              type="number"
              min={1}
              value={summaryFrequency}
              onChange={(e) => handleSummaryFrequencyChange(Number(e.target.value))}
            />
            <FieldDescription>
              Cada cuántos mensajes nuevos se regenera el resumen acumulativo.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="recent-count">Mensajes recientes</FieldLabel>
            <Input
              id="recent-count"
              type="number"
              min={1}
              max={recentMax}
              value={recentMessageCount}
              onChange={(e) => onRecentMessageCountChange(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
            />
            <FieldDescription>
              Mensajes recientes que se envían verbatim. Debe ser menor que la
              frecuencia de resumen (máx. {recentMax}).
            </FieldDescription>
          </Field>
        </FieldGroup>
  )
}
