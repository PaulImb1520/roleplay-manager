import { useCallback, useEffect, useState } from "react"
import { Toaster, toast } from "@workspace/ui/components/sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Empty } from "@workspace/ui/components/empty"
import { Separator } from "@workspace/ui/components/separator"
import { Spinner } from "@workspace/ui/components/spinner"
import { Slider } from "@workspace/ui/components/slider"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/dialog"
import {
  BookOpenIcon,
  SettingsIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  RefreshCwIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import type {
  ConversationDetail,
  ConversationSettingsUpdate,
} from "@workspace/shared/types/conversation"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"
import type { ProviderId } from "@workspace/shared/types/provider"

import {
  updateConversationSettings,
  getConversation,
} from "@/lib/api/conversations"
import {
  listProviderInstances,
  createProviderInstance,
  updateProviderInstance,
  deleteProviderInstance,
  validateProviderInstance,
} from "@/lib/api/provider-instances"
import { listProviderModels } from "@/lib/api/providers"
import { configureDefaultProvider, getDefaultProvider } from "@/lib/api/settings"
import { ApiClientError } from "@/lib/api/client"

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

type ProviderOption = {
  id: ProviderId | string
  label: string
  instanceId?: string
}

export function SettingsPanel({
  conversationId,
  current,
  onSettingsChanged,
  children,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false)

  const [provider, setProvider] = useState<ProviderId | string>(current.provider ?? "ollama")
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

  const [newInstanceDialogOpen, setNewInstanceDialogOpen] = useState(false)
  const [editInstanceId, setEditInstanceId] = useState<string | null>(null)
  const [instanceFormName, setInstanceFormName] = useState("")
  const [instanceFormUrl, setInstanceFormUrl] = useState("")
  const [instanceFormApiKey, setInstanceFormApiKey] = useState("")

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
    const kind = provider as ProviderId | string
    loadModels(kind, providerInstanceId)
    verifyConnection()
  }, [open, provider, providerInstanceId, loadModels, verifyConnection])

  useEffect(() => {
    if (open) {
      loadInstances()
    }
  }, [open, loadInstances])

  const handleSave = async () => {
    setSaving(true)
    const settings: ConversationSettingsUpdate = {}
    if (provider !== (current.provider ?? "ollama")) {
      settings.provider = provider as ProviderId
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

  const handleCreateInstance = async () => {
    try {
      const instance = await createProviderInstance({
        kind: "openai-compatible",
        name: instanceFormName.trim(),
        url: instanceFormUrl.trim(),
        apiKey: instanceFormApiKey.trim() || undefined,
      })
      setInstances((prev) => [...prev, instance])
      setNewInstanceDialogOpen(false)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia creada", { description: instance.name })
    } catch (e) {
      const message = e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
      toast.error("No se pudo crear la instancia", { description: message })
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
      setInstances((prev) =>
        prev.map((i) => (i.id === editInstanceId ? updated : i)),
      )
      setEditInstanceId(null)
      setInstanceFormName("")
      setInstanceFormUrl("")
      setInstanceFormApiKey("")
      toast.success("Instancia actualizada")
    } catch (e) {
      const message = e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
      toast.error("No se pudo actualizar la instancia", { description: message })
    }
  }

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteProviderInstance(id)
      setInstances((prev) => prev.filter((i) => i.id !== id))
      if (providerInstanceId === id) {
        setProviderInstanceId(null)
      }
      toast.success("Instancia eliminada")
    } catch (e) {
      const message = e instanceof ApiClientError ? `[${e.code}] ${e.message}` : "Error desconocido"
      toast.error("No se pudo eliminar la instancia", { description: message })
    }
  }

  const providerOptions: ProviderOption[] = [
    { id: "ollama", label: "Ollama (local)" },
    ...instances.map((inst) => ({
      id: `openai-compatible`,
      label: inst.name,
      instanceId: inst.id,
    })),
  ]

  const selectedInstance = instances.find((i) => i.id === providerInstanceId)

  return (
    <>
      <Toaster richColors position="top-right" />
      <Sheet open={open} onOpenChange={setOpen}>
        {children ? (
          <SheetTrigger asChild>{children}</SheetTrigger>
        ) : null}
        <SheetContent side="right" className="w-full max-w-md sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Configuracion del chat</SheetTitle>
            <SheetDescription>
              Ajusta los parametros de la conversacion y del modelo.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="modelo" className="mt-4 flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="historia">Historia</TabsTrigger>
              <TabsTrigger value="modelo">Modelo</TabsTrigger>
            </TabsList>

            <TabsContent value="historia" className="flex flex-col gap-4">
              <Empty
                icon={BookOpenIcon}
                title="Proximamente"
                description="Aqui podras gestionar las memorias y resumenes de esta conversacion."
              />
            </TabsContent>

            <TabsContent value="modelo" className="flex flex-col gap-4">
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
                    Selecciona el proveedor de IA para esta conversacion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="provider-select">Proveedor</FieldLabel>
                      <Select
                        value={provider}
                        onValueChange={(v) => {
                          setProvider(v)
                          if (v === "ollama") {
                            setProviderInstanceId(null)
                          }
                        }}
                      >
                        <SelectTrigger id="provider-select">
                          <SelectValue placeholder="Selecciona un proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ollama">Ollama (local)</SelectItem>
                          {instances.length > 0 ? (
                            <SelectItem value="openai-compatible" disabled>
                              --- Instancias OpenAI-compatible ---
                            </SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>

                  {provider === "openai-compatible" ? (
                    <div className="flex flex-col gap-2">
                      <Separator />
                      <p className="text-sm font-medium">Instancias disponibles</p>
                      {instancesLoading ? (
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
                                providerInstanceId === inst.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => {
                                setProvider("openai-compatible")
                                setProviderInstanceId(inst.id)
                              }}
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
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={verifyConnection}
                    >
                      <RefreshCwIcon /> Verificar conexion
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modelo</CardTitle>
                  <CardDescription>
                    {modelsManualEntry
                      ? "Introduce el identificador del modelo manualmente."
                      : "Selecciona un modelo de la lista."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    {modelsLoading ? (
                      <Field>
                        <FieldLabel>Cargando modelos...</FieldLabel>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner /> Consultando al proveedor
                        </div>
                      </Field>
                    ) : modelsManualEntry || modelsList.length === 0 ? (
                      <Field>
                        <FieldLabel htmlFor="model-input">
                          Identificador del modelo
                        </FieldLabel>
                        <Input
                          id="model-input"
                          value={model ?? ""}
                          onChange={(e) => setModel(e.target.value || null)}
                          placeholder="gpt-4o-mini, llama3:latest, ..."
                        />
                        {modelsManualEntry ? (
                          <FieldDescription>
                            El proveedor no soporta descubrimiento automatico.
                          </FieldDescription>
                        ) : null}
                      </Field>
                    ) : (
                      <Field>
                        <FieldLabel htmlFor="model-select">Modelo</FieldLabel>
                        <Select
                          value={model ?? ""}
                          onValueChange={(v) => setModel(v || null)}
                        >
                          <SelectTrigger id="model-select">
                            <SelectValue placeholder="Selecciona un modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modelsList.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name ?? m.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {modelsList.length} modelos disponibles.
                        </FieldDescription>
                      </Field>
                    )}
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parametros de inferencia</CardTitle>
                  <CardDescription>
                    Ajusta como el modelo genera las respuestas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Temperature ({temperature.toFixed(1)})</FieldLabel>
                      <Slider
                        value={[temperature]}
                        onValueChange={([v]) => setTemperature(v)}
                        min={0}
                        max={2}
                        step={0.1}
                        aria-label="Temperature"
                      />
                      <FieldDescription>Controla la creatividad (0 = deterministico, 2 = muy creativo)</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Top P ({topP.toFixed(2)})</FieldLabel>
                      <Slider
                        value={[topP]}
                        onValueChange={([v]) => setTopP(v)}
                        min={0}
                        max={1}
                        step={0.05}
                        aria-label="Top P"
                      />
                      <FieldDescription>Muestreo por nucleo de probabilidad</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Freq. Penalty ({frequencyPenalty.toFixed(1)})</FieldLabel>
                      <Slider
                        value={[frequencyPenalty]}
                        onValueChange={([v]) => setFrequencyPenalty(v)}
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
                        onValueChange={([v]) => setPresencePenalty(v)}
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
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                      />
                      <FieldDescription>Limite maximo de tokens en la respuesta</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="stop-sequences">Stop sequences</FieldLabel>
                      <Input
                        id="stop-sequences"
                        value={stopSequences}
                        onChange={(e) => setStopSequences(e.target.value)}
                        placeholder="coma, separada, ..."
                      />
                      <FieldDescription>Separadas por coma</FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contexto narrativo</CardTitle>
                  <CardDescription>
                    Controla como se construye el contexto de la conversacion.
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
                        onChange={(e) => setRecentMessageCount(Number(e.target.value))}
                      />
                      <FieldDescription>
                        Cantidad de mensajes recientes incluidos en el contexto
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="summary-freq">Frecuencia de resumen</FieldLabel>
                      <Input
                        id="summary-freq"
                        type="number"
                        min={1}
                        value={summaryFrequency}
                        onChange={(e) => setSummaryFrequency(Number(e.target.value))}
                      />
                      <FieldDescription>
                        Cada cuantos mensajes se genera un resumen automatico
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
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
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
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
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleUpdateInstance}>Guardar cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
