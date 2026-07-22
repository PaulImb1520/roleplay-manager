import {
  ArrowDownIcon,
  ArrowUpIcon,
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
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"

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
    dirty,
    addCard,
    removeCard,
    moveCard,
    updateCard,
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
          <p className="text-muted-foreground text-sm">
            {isEditing ? `v${versionNumber}` : "Nuevo personaje"}
          </p>
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
          <Button type="submit" disabled={saving || (isEditing && !dirty)}>
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
                placeholder="Ej: Dr. House"
              />
              <FieldError>El nombre es obligatorio</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="subtitle">Subtítulo</FieldLabel>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej: El mejor diagnosticador"
              />
              <FieldDescription>Opcional. Una frase breve.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="profileImage">Imagen de perfil *</FieldLabel>
              <Input
                id="profileImage"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="URL o data-URI"
              />
              <FieldError>La imagen de perfil es obligatoria</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="greeting">Saludo inicial *</FieldLabel>
              <Textarea
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Ej: ¡Hola! Bienvenido a mi consulta."
              />
              <FieldError>El saludo inicial es obligatorio</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción *</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Un médico genio y cascarrabias..."
              />
              <FieldError>La descripción es obligatoria</FieldError>
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
          <FieldGroup>
            <FieldContent>
              <p className="text-muted-foreground text-sm">
                Las tarjetas definen las características del personaje. Se ordenan por importancia. Arrastra o usa las flechas para reordenar.
              </p>
            </FieldContent>

            <ScrollArea className="max-h-96">
              <div className="flex flex-col gap-3">
                <div className="sticky top-0 z-10 bg-popover py-1">
                  <Button type="button" variant="outline" onClick={addCard} className="w-full">
                    <PlusIcon />
                    Añadir tarjeta
                  </Button>
                </div>
                {cards.map((card, idx) => (
                  <div key={card.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveCard(idx, "up")}
                        disabled={idx === 0}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                        aria-label="Subir"
                      >
                        <ArrowUpIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCard(idx, "down")}
                        disabled={idx === cards.length - 1}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                        aria-label="Bajar"
                      >
                        <ArrowDownIcon className="size-4" />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        value={card.title}
                        onChange={(e) => updateCard(idx, "title", e.target.value)}
                        placeholder="Título de la tarjeta"
                      />
                      <Textarea
                        value={card.content}
                        onChange={(e) => updateCard(idx, "content", e.target.value)}
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
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </FieldGroup>
        </TabsContent>
      </Tabs>
    </form>
  )
}
