import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

interface ContextCardProps {
  recentMessageCount: number
  summaryFrequency: number
  onRecentMessageCountChange: (v: number) => void
  onSummaryFrequencyChange: (v: number) => void
}

export function ContextCard({
  recentMessageCount,
  summaryFrequency,
  onRecentMessageCountChange,
  onSummaryFrequencyChange,
}: ContextCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contexto narrativo</CardTitle>
        <CardDescription>
          Controla como se construye el contexto de la conversación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="recent-count">Mensajes recientes</FieldLabel>
            <Input
              id="recent-count"
              type="number"
              min={1}
              value={recentMessageCount}
              onChange={(e) => onRecentMessageCountChange(Number(e.target.value))}
            />
            <FieldDescription>Cantidad de mensajes recientes incluidos en el contexto.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="summary-freq">Frecuencia de resumen</FieldLabel>
            <Input
              id="summary-freq"
              type="number"
              min={1}
              value={summaryFrequency}
              onChange={(e) => onSummaryFrequencyChange(Number(e.target.value))}
            />
            <FieldDescription>Cada cuantos mensajes se genera un resumen automatico.</FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
