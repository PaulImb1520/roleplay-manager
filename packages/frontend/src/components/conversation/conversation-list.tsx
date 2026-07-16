import { useEffect, useState } from "react"

import type { ConversationSummary } from "@workspace/shared/types/conversation"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"

import { listConversations, archiveConversation, unarchiveConversation } from "@/lib/api/conversations"
import { ConversationCard } from "./conversation-card"

export function ConversationList() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"active" | "archived" | undefined>("active")

  const fetchConversations = async (status?: "active" | "archived") => {
    setLoading(true)
    try {
      const result = await listConversations(status)
      setConversations(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations(filter)
  }, [filter])

  const handleToggleArchive = async (id: string, action: "archive" | "unarchive") => {
    if (action === "archive") {
      await archiveConversation(id)
    } else {
      await unarchiveConversation(id)
    }
    fetchConversations(filter)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Conversaciones</h1>
          <p className="text-muted-foreground text-sm">
            {conversations.length} conversación{conversations.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "active" || filter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Activas
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
          >
            Archivadas
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Spinner />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            {filter === "archived"
              ? "No hay conversaciones archivadas."
              : "Aún no tienes conversaciones activas. Crea una desde la ficha de un personaje."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conversations.map((c) => (
            <ConversationCard
              key={c.id}
              conversation={c}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
