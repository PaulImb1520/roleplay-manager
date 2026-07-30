import {
  GripVerticalIcon,
  MessageSquarePlusIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { Sortable, SortableItem, SortableItemHandle } from "@workspace/ui/components/sortable"

import type { CharacterDetail } from "@workspace/shared/types/character"
import { useCharacterForm } from "./use-character-form"

interface Props {
  character?: CharacterDetail
}

export function CharacterForm({ character }: Props) {
  const {
    isEditing,
    name, setName,
    subtitle, setSubtitle,
    profileImage, setProfileImage,
    description, setDescription,
    instructions, setInstructions,
    greeting, setGreeting,
    cards,
    versionNumber,
    activeTab, setActiveTab,
    saving,
    showDeleteDialog, setShowDeleteDialog,
    selectedVersionId, handleVersionChange,
    addCard,
    removeCard,
    reorderCards,
    updateCard,
    showError,
    markTouched,
    canSubmit,
    handleSubmit,
    handleDelete,
    handleStartConversation,
  } = useCharacterForm(character)

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Editar personaje" : "Crear personaje"}
          </h1>
          <div className="text-muted-foreground text-sm">
            {isEditing && character && character.versions.length > 1 ? (
              <Select value={selectedVersionId} onValueChange={(v) => { if (v) handleVersionChange(v) }}>
                <SelectTrigger className="h-6 text-xs px-2 w-auto min-w-0 inline-flex">
                  <SelectValue>v{versionNumber}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {character.versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      v{v.versionNumber} · {v.createdAt.slice(0, 10)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              isEditing ? `v${versionNumber}` : "Nuevo personaje"
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="secondary" onClick={handleStartConversation}>
                <MessageSquarePlusIcon />
                Iniciar conversación
              </Button>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger render={<Button variant="destructive" />}>
                    Eliminar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar personaje</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de eliminar "{character?.name}"? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={saving}>
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : null}
          <Button type="submit" disabled={!canSubmit}>
            {isEditing ? "Guardar cambios" : "Crear personaje"}
          </Button>
        </div>
      </header>

      {profileImage ? (
        <div className="flex items-center gap-3">
          <Avatar className="size-16">
            <AvatarImage src={profileImage} alt="Preview" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name || "Sin nombre"}</p>
            {subtitle ? <p className="text-muted-foreground text-xs">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="cards">
            Tarjetas
            {cards.length > 0 ? <Badge variant="secondary" className="ml-2">{cards.length}</Badge> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-4 pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="Ej: Milka Moori"
              />
              <FieldError>{showError("name")}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="subtitle">Subtítulo</FieldLabel>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej: La chica holstaur más agradable."
              />
              <FieldDescription>Opcional. Una frase breve.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="profileImage">Imagen de perfil *</FieldLabel>
              <Input
                id="profileImage"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                onBlur={() => markTouched("profileImage")}
                placeholder="URL o data-URI"
              />
              <FieldError>{showError("profileImage")}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="greeting">Saludo inicial *</FieldLabel>
              <Textarea
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                onBlur={() => markTouched("greeting")}
                placeholder="Ej: ¡Hola! Me alegra verte por aqui."
              />
              <FieldError>{showError("greeting")}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción *</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => markTouched("description")}
                placeholder="Ej: Dueña de una granja y amiga de todos..."
              />
              <FieldError>{showError("description")}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="instructions">Instrucciones</FieldLabel>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Indicaciones adicionales para la IA (opcional)"
              />
              <FieldDescription>
                Instrucciones extra que la IA usará al interpretar este personaje.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="cards" className="flex flex-col gap-4 pt-4">
          <FieldContent>
              <p className="text-muted-foreground text-sm">
                Las tarjetas definen las características del personaje. Se ordenan por importancia. Arrastra para reordenar.
              </p>
          </FieldContent>

          <div className="max-h-96 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-popover py-1">
              <Button type="button" variant="outline" onClick={addCard} className="w-full">
                <PlusIcon />
                Añadir tarjeta
              </Button>
            </div>
            <Sortable
              value={cards}
              onMove={({ activeIndex, overIndex }) => reorderCards(activeIndex, overIndex)}
              getItemValue={(card) => card.id}
              strategy="vertical"
              className="mt-3 flex flex-col gap-3"
            >
              {cards.map((card, idx) => (
                <SortableItem key={card.id} value={card.id}>
                  <div className="flex gap-3 rounded-lg border p-3">
                    <SortableItemHandle className="flex items-center rounded text-muted-foreground hover:text-foreground">
                      <GripVerticalIcon className="size-4" />
                    </SortableItemHandle>
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      value={card.title}
                      onChange={(e) => updateCard(idx, "title", e.target.value)}
                      onBlur={() => markTouched(`card-${idx}`)}
                      placeholder="Título de la tarjeta"
                    />
                    <Textarea
                      value={card.content}
                      onChange={(e) => updateCard(idx, "content", e.target.value)}
                      onBlur={() => markTouched(`card-${idx}`)}
                      placeholder="Contenido de la tarjeta"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={card.active}
                          onChange={(e) => updateCard(idx, "active", e.target.checked)}
                        />
                        Activa
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCard(idx)}
                        className="ml-auto flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2Icon className="size-3" />
                        Eliminar
                      </button>
                    </div>
                    <FieldError>{showError(`card-${idx}`)}</FieldError>
                  </div>
                  </div>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
