import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Slider } from "@workspace/ui/components/slider"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

interface InferenceParamsCardProps {
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  maxTokens: number
  stopSequences: string
  onTemperatureChange: (v: number) => void
  onTopPChange: (v: number) => void
  onFrequencyPenaltyChange: (v: number) => void
  onPresencePenaltyChange: (v: number) => void
  onMaxTokensChange: (v: number) => void
  onStopSequencesChange: (v: string) => void
}

export function InferenceParamsCard({
  temperature,
  topP,
  frequencyPenalty,
  presencePenalty,
  maxTokens,
  stopSequences,
  onTemperatureChange,
  onTopPChange,
  onFrequencyPenaltyChange,
  onPresencePenaltyChange,
  onMaxTokensChange,
  onStopSequencesChange,
}: InferenceParamsCardProps) {
  const sliderHandler = (setter: (v: number) => void) => (v: number | readonly number[]) =>
    setter(Array.isArray(v) ? v[0] : v)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parámetros de inferencia</CardTitle>
        <CardDescription>
          Ajusta como el modelo genera las respuestas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Temperatura ({temperature.toFixed(1)})</FieldLabel>
            <Slider
              value={[temperature]}
              onValueChange={sliderHandler(onTemperatureChange)}
              min={0}
              max={2}
              step={0.1}
              aria-label="Temperature"
            />
            <FieldDescription>Controla la creatividad (0 = determinístico, 2 = muy creativo)</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Top P ({topP.toFixed(2)})</FieldLabel>
            <Slider
              value={[topP]}
              onValueChange={sliderHandler(onTopPChange)}
              min={0}
              max={1}
              step={0.05}
              aria-label="Top P"
            />
            <FieldDescription>Muestreo por núcleo de probabilidad</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Freq. Penalty ({frequencyPenalty.toFixed(1)})</FieldLabel>
            <Slider
              value={[frequencyPenalty]}
              onValueChange={sliderHandler(onFrequencyPenaltyChange)}
              min={-2}
              max={2}
              step={0.1}
              aria-label="Frequency Penalty"
            />
            <FieldDescription>Penaliza tokens repetidos</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Pres. Penalty ({presencePenalty.toFixed(1)})</FieldLabel>
            <Slider
              value={[presencePenalty]}
              onValueChange={sliderHandler(onPresencePenaltyChange)}
              min={-2}
              max={2}
              step={0.1}
              aria-label="Presence Penalty"
            />
            <FieldDescription>Penaliza introducir nuevos tokens</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="max-tokens">Max tokens</FieldLabel>
            <Input
              id="max-tokens"
              type="number"
              min={1}
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(Number(e.target.value))}
            />
            <FieldDescription>Límite máximo de tokens en la respuesta.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="stop-sequences">Stop sequences</FieldLabel>
            <Input
              id="stop-sequences"
              value={stopSequences}
              onChange={(e) => onStopSequencesChange(e.target.value)}
              placeholder="coma, separada, ..."
            />
            <FieldDescription>Separadas por coma</FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
