import { useCallback, useEffect, useState, type ReactElement } from "react"
import { Toaster, toast } from "@workspace/ui/components/sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@workspace/ui/components/empty"
import { Spinner } from "@workspace/ui/components/spinner"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { BookOpenIcon, CheckCircle2Icon, RefreshCwIcon } from "lucide-react"

import type { ConversationDetail, ConversationSettingsUpdate } from "@workspace/shared/types/conversation"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"
import type { ProviderId } from "@workspace/shared/types/provider"

import { updateConversationSettings } from "@/lib/api/conversations"
import { listProviderInstances, validateProviderInstance } from "@/lib/api/provider-instances"
import { listProviderModels } from "@/lib/api/providers"
import { getDefaultProvider } from "@/lib/api/settings"
import { ApiClientError } from "@/lib/api/client"
import { InferenceParamsCard } from "./inference-params-card"
import { InstanceManager } from "./instance-manager"
import { ModelCard } from "./model-card"
import { ContextCard } from "./context-card"

interface SettingsPanelProps {
  conversationId: string
  current: ConversationDetail
  onSettingsChanged: (updated: ConversationDetail) => void
  children?: React.ReactNode
}

type ProviderStatus = "available" | "unavailable" | "unconfigured" | "unknown" | "loading"

const STATUS_LABELS: Record<ProviderStatus, string> = {
  available: "Disponible",
  unavailable: "No disponible",
  unconfigured: "Sin configurar",
  unknown: "Desconocido",
  loading: "Verificando...",
}

const STATUS_VARIANT: Record<ProviderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  unavailable: "destructive",
  unconfigured: "outline",
  unknown: "secondary",
  loading: "secondary",
}

export function SettingsPanel({
  conversationId,
  current,
  onSettingsChanged,
  children,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false)

  const [provider, setProvider] = useState<ProviderId | string | null>(current.provider ?? "ollama")
  const [providerInstanceId, setProviderInstanceId] = useState<string | null>(current.providerInstanceId ?? null)
  const [model, setModel] = useState<string | null>(current.model)
  const [temperature, setTemperature] = useState(current.temperature ?? 0.7)
  const [maxTokens, setMaxTokens] = useState(current.maxTokens ?? 2048)
  const [topP, setTopP] = useState(current.topP ?? 0.9)
  const [frequencyPenalty, setFrequencyPenalty] = useState(current.frequencyPenalty ?? 0)
  const [presencePenalty, setPresencePenalty] = useState(current.presencePenalty ?? 0)
  const [stopSequences, setStopSequences] = useState(current.stopSequences?.join(", ") ?? "")
  const [recentMessageCount, setRecentMessageCount] = useState(current.recentMessageCount ?? 15)
  const [summaryFrequency, setSummaryFrequency] = useState(current.summaryFrequency ?? 15)

  const [instances, setInstances] = useState<ProviderInstance[]>([])
  const [instancesLoading, setInstancesLoading] = useState(false)
  const [modelsList, setModelsList] = useState<{ id: string; name?: string }[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsManualEntry, setModelsManualEntry] = useState(false)
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>("unknown")
  const [saving, setSaving] = useState(false)

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const isDefaultValues =
    temperature === 0.7 && maxTokens === 2048 && topP === 0.9 &&
    frequencyPenalty === 0 && presencePenalty === 0 &&
    stopSequences === "" && recentMessageCount === 15 &&
    summaryFrequency === 15

  const hasChanges =
    provider !== (current.provider ?? "ollama") ||
    providerInstanceId !== current.providerInstanceId ||
    model !== current.model ||
    temperature !== (current.temperature ?? 0.7) ||
    maxTokens !== (current.maxTokens ?? 2048) ||
    topP !== (current.topP ?? 0.9) ||
    frequencyPenalty !== (current.frequencyPenalty ?? 0) ||
    presencePenalty !== (current.presencePenalty ?? 0) ||
    stopSequences !== (current.stopSequences?.join(", ") ?? "") ||
    recentMessageCount !== (current.recentMessageCount ?? 15) ||
    summaryFrequency !== (current.summaryFrequency ?? 15)

  const loadInstances = useCallback(async () => {
    setInstancesLoading(true)
    try {
      const result = await listProviderInstances()
      setInstances(result)
    } catch (e) {
      toast.error("No se pudieron cargar las instancias")
    } finally {
      setInstancesLoading(false)
    }
  }, [])

  const loadModels = useCallback(async (kind: ProviderId | string, instanceId?: string | null) => {
    if (kind === "ollama") {
      setModelsLoading(true)
      try {
        const result = await listProviderModels("ollama")
        setModelsList(result.models)
        setModelsManualEntry(result.manualEntryRequired)
      } catch {
        setModelsList([])
        setModelsManualEntry(true)
      } finally {
        setModelsLoading(false)
      }
    } else if (kind === "openai-compatible" && instanceId) {
      setModelsLoading(true)
      try {
        const result = await listProviderModels("openai-compatible")
        setModelsList(result.models)
        setModelsManualEntry(result.manualEntryRequired)
      } catch {
        setModelsList([])
        setModelsManualEntry(true)
      } finally {
        setModelsLoading(false)
      }
    }
  }, [])

  const verifyConnection = useCallback(async () => {
    setProviderStatus("loading")
    try {
      if (provider === "ollama") {
        const { validateProvider } = await import("@/lib/api/providers")
        const result = await validateProvider("ollama")
        setProviderStatus(result.status)
      } else if (providerInstanceId) {
        const result = await validateProviderInstance(providerInstanceId)
        setProviderStatus(result.status)
      }
    } catch {
      setProviderStatus("unavailable")
    }
  }, [provider, providerInstanceId])

  useEffect(() => {
    if (!open) return
    if (!current.provider) {
      getDefaultProvider().then((def) => {
        if (def.provider) {
          setProvider(def.provider)
          if (def.providerInstanceId) setProviderInstanceId(def.providerInstanceId)
          if (def.model && !current.model) setModel(def.model)
        }
      })
    }
    loadModels(provider ?? "ollama", providerInstanceId)
    verifyConnection()
  }, [open, provider, providerInstanceId, loadModels, verifyConnection, current.provider, current.model])

  useEffect(() => {
    if (open) {
      loadInstances()
    }
  }, [open, loadInstances])

  const handleSave = async () => {
    setSaving(true)
    const settings: ConversationSettingsUpdate = {}
    if (provider !== (current.provider ?? "ollama")) {
      settings.provider = provider ?? undefined
    }
    if (providerInstanceId !== current.providerInstanceId) {
      settings.providerInstanceId = providerInstanceId
    }
    if (model !== current.model) settings.model = model
    if (temperature !== (current.temperature ?? 0.7)) settings.temperature = temperature
    if (maxTokens !== (current.maxTokens ?? 2048)) settings.maxTokens = maxTokens
    if (topP !== (current.topP ?? 0.9)) settings.topP = topP
    if (frequencyPenalty !== (current.frequencyPenalty ?? 0))
      settings.frequencyPenalty = frequencyPenalty
    if (presencePenalty !== (current.presencePenalty ?? 0))
      settings.presencePenalty = presencePenalty
    if (stopSequences !== (current.stopSequences?.join(", ") ?? ""))
      settings.stopSequences = stopSequences.split(",").map((s) => s.trim()).filter(Boolean)
    if (recentMessageCount !== (current.recentMessageCount ?? 15))
      settings.recentMessageCount = recentMessageCount
    if (summaryFrequency !== (current.summaryFrequency ?? 15))
      settings.summaryFrequency = summaryFrequency
    try {
      const updated = await updateConversationSettings(conversationId, settings)
      onSettingsChanged(updated)
      toast.success("Configuracion guardada", {
        description: "Los cambios se aplicaran en la proxima respuesta.",
      })
    } catch (e) {
      const message = e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
      toast.error("No se pudo guardar la configuracion", { description: message })
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    setTemperature(0.7)
    setMaxTokens(2048)
    setTopP(0.9)
    setFrequencyPenalty(0)
    setPresencePenalty(0)
    setStopSequences("")
    setRecentMessageCount(15)
    setSummaryFrequency(15)
  }

  const doReset = () => {
    handleResetDefaults()
    setResetConfirmOpen(false)
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <Sheet open={open} onOpenChange={setOpen}>
        {children ? <SheetTrigger render={children as ReactElement} /> : null}
        <SheetContent side="right" className="flex h-full flex-col w-full max-w-md sm:max-w-lg">
          <SheetHeader className="shrink-0 px-4 pt-4">
            <SheetTitle>Configuracion del chat</SheetTitle>
            <SheetDescription>
              Ajusta los parametros de la conversacion y del modelo.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="modelo" className="flex min-h-0 flex-col">
            <div className="sticky top-0 z-10 bg-popover px-4 pt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="historia">Historia</TabsTrigger>
                <TabsTrigger value="modelo">Modelo</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
              <TabsContent value="historia" className="flex flex-col gap-4 mt-4">
                <Empty>
                  <EmptyMedia>
                    <BookOpenIcon />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>Proximamente</EmptyTitle>
                    <EmptyDescription>
                      Aqui podras gestionar las memorias y resumenes de esta conversacion.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TabsContent>

              <TabsContent value="modelo" className="flex flex-col gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Proveedor
                      <Badge variant={STATUS_VARIANT[providerStatus]}>
                        {providerStatus === "available" ? (
                          <CheckCircle2Icon className="size-3" />
                        ) : providerStatus === "loading" ? (
                          <Spinner />
                        ) : null}
                        {STATUS_LABELS[providerStatus]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Selecciona el proveedor de IA para esta conversación.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="provider-select">Proveedor</FieldLabel>
                        <Select
                          value={provider === "openai-compatible" && providerInstanceId ? providerInstanceId : provider}
                          onValueChange={(v) => {
                            if (v === "ollama") {
                              setProvider("ollama")
                              setProviderInstanceId(null)
                            } else {
                              setProvider("openai-compatible")
                              setProviderInstanceId(v)
                            }
                          }}
                        >
                          <SelectTrigger id="provider-select">
                            <SelectValue placeholder="Selecciona un proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ollama">Ollama (local)</SelectItem>
                            {instances.map((inst) => (
                              <SelectItem key={inst.id} value={inst.id}>
                                {inst.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>

                    {provider === "openai-compatible" ? (
                      <InstanceManager
                        instances={instances}
                        loading={instancesLoading}
                        selectedInstanceId={providerInstanceId}
                        onSelect={(id) => {
                          setProvider("openai-compatible")
                          setProviderInstanceId(id)
                        }}
                        onInstancesChange={setInstances}
                      />
                    ) : null}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={verifyConnection}>
                        <RefreshCwIcon /> Verificar conexion
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <ModelCard
                  model={model}
                  modelsList={modelsList}
                  modelsLoading={modelsLoading}
                  modelsManualEntry={modelsManualEntry}
                  onModelChange={setModel}
                />

                <InferenceParamsCard
                  temperature={temperature}
                  topP={topP}
                  frequencyPenalty={frequencyPenalty}
                  presencePenalty={presencePenalty}
                  maxTokens={maxTokens}
                  stopSequences={stopSequences}
                  onTemperatureChange={setTemperature}
                  onTopPChange={setTopP}
                  onFrequencyPenaltyChange={setFrequencyPenalty}
                  onPresencePenaltyChange={setPresencePenalty}
                  onMaxTokensChange={setMaxTokens}
                  onStopSequencesChange={setStopSequences}
                />

                <ContextCard
                  recentMessageCount={recentMessageCount}
                  summaryFrequency={summaryFrequency}
                  onRecentMessageCountChange={setRecentMessageCount}
                  onSummaryFrequencyChange={setSummaryFrequency}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="shrink-0 border-t px-4 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (isDefaultValues) {
                  handleResetDefaults()
                } else {
                  setResetConfirmOpen(true)
                }
              }}
              disabled={saving}
            >
              Restablecer valores
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? <Spinner /> : null}
              Aplicar cambios
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer valores</DialogTitle>
            <DialogDescription>
              Se perderán los cambios sin guardar. Esta acción no afecta los datos guardados en el servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={doReset}>Restablecer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
