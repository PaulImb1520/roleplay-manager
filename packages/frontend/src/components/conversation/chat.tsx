import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ConversationDetail } from "@workspace/shared/types/conversation"
import type { PromptContextDTO } from "@workspace/shared/types/context"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "@workspace/ui/components/message-scroller"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"
import { SettingsIcon, Pencil, RefreshCw } from "lucide-react"

import { useChatStore } from "../../lib/stores/chat.store"
import {
  sendMessageStreaming,
  regenerateReplyStreaming,
  continueConversationStreaming,
  editMessage,
  deleteMessage,
  rewindConversation,
  cycleAlternative,
  setConversationTitle,
} from "../../lib/api/conversations"
import { getPromptContext } from "../../lib/api/context"
import { MessageBubble } from "./message"
import { MessageInput } from "./message-input"
import { ContextPreviewDialog } from "./context-preview-dialog"
import { SettingsPanel } from "./settings-panel"
import { ChatConfirmDialogs } from "./chat-confirm-dialogs"
import { useMemoryStore } from "@/lib/stores/memory.store"
import { useSummaryStore } from "@/lib/stores/summary.store"

export function Chat({ conversation }: { conversation: ConversationDetail }) {
  const [conv, setConv] = useState(conversation)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmRewind, setConfirmRewind] = useState<string | null>(null)
  const [rewindDraft, setRewindDraft] = useState("")
  const [inputKey, setInputKey] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContext, setPreviewContext] = useState<PromptContextDTO | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewContent, setPreviewContent] = useState<string | undefined>()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState("")

  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    editingMessageId,
    editingContent,
    setMessages,
    addMessage,
    replaceMessage,
    removeMessage,
    appendToStreamingContent,
    setStreaming,
    setStreamingContent,
    startEditing,
    setEditingContent,
    cancelEditing,
    setError,
  } = useChatStore()

  const loadMemories = useMemoryStore((s) => s.loadMemories)
  const loadProposals = useMemoryStore((s) => s.loadProposals)
  const proposals = useMemoryStore((s) => s.proposals)
  const summaries = useSummaryStore((s) => s.summaries)
  const loadSummaries = useSummaryStore((s) => s.loadSummaries)
  const summaryCount = summaries.length

  const pendingCount = useMemo(
    () => proposals.filter(p => p.status === "pending").length,
    [proposals],
  )

  const affectedSummariesCount = useMemo(() => {
    if (!confirmRewind) return 0
    const targetMsg = messages.find((m) => m.id === confirmRewind)
    if (!targetMsg) return 0
    const deletedIds = new Set<string>()
    for (const m of messages) {
      if (m.position > targetMsg.position) {
        deletedIds.add(m.id)
      }
    }
    if (targetMsg.role === "user") {
      deletedIds.add(targetMsg.id)
    }
    return summaries.filter(
      (s) => deletedIds.has(s.firstMessageId) || deletedIds.has(s.lastMessageId),
    ).length
  }, [confirmRewind, messages, summaries])

  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      setMessages(conv.messages)
      loadMemories(conv.id)
      loadProposals(conv.id)
      loadSummaries(conv.id)
      initialized.current = true
    }
  }, [conv, setMessages, loadMemories, loadProposals, loadSummaries])

  const handleSend = useCallback(
    async (content: string) => {
      setError(null)
      setStreaming(true)
      setStreamingContent("")

      await sendMessageStreaming(conv.id, content, {
        onSaved: (message) => {
          addMessage(message)
        },
        onChunk: (chunk) => {
          appendToStreamingContent(chunk)
        },
        onDone: (message) => {
          addMessage(message)
          setStreamingContent("")
          setStreaming(false)
          loadMemories(conv.id)
          loadProposals(conv.id)
          loadSummaries(conv.id)
        },
        onTitleGenerated: (title, _titleSource) => {
          setConv((prev) => ({ ...prev, title }))
        },
        onSummaryGenerated: () => {
          loadSummaries(conv.id)
        },
        onError: (err) => {
          setError(err.message)
          setStreaming(false)
          setStreamingContent("")
        },
      })
    },
    [conv.id, addMessage, appendToStreamingContent, loadMemories, loadProposals, loadSummaries, setError, setStreaming, setStreamingContent],
  )

  const handleContinue = useCallback(async () => {
    setError(null)
    setStreaming(true)
    setStreamingContent("")

    await continueConversationStreaming(conv.id, {
      onChunk: (chunk) => {
        appendToStreamingContent(chunk)
      },
      onDone: (message) => {
        addMessage(message)
        setStreamingContent("")
        setStreaming(false)
        loadMemories(conv.id)
        loadProposals(conv.id)
        loadSummaries(conv.id)
      },
      onSummaryGenerated: () => {
        loadSummaries(conv.id)
      },
      onError: (err) => {
        setError(err.message)
        setStreaming(false)
        setStreamingContent("")
      },
    })
  }, [conv.id, addMessage, appendToStreamingContent, loadMemories, loadProposals, loadSummaries, setError, setStreaming, setStreamingContent])

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      setError(null)
      setStreaming(true)
      setStreamingContent("")

      await regenerateReplyStreaming(conv.id, messageId, {
        onChunk: (chunk) => {
          appendToStreamingContent(chunk)
        },
        onDone: (message) => {
          replaceMessage(messageId, message)
          setStreamingContent("")
          setStreaming(false)
          loadMemories(conv.id)
          loadProposals(conv.id)
          loadSummaries(conv.id)
        },
        onSummaryGenerated: () => {
          loadSummaries(conv.id)
        },
        onError: (err) => {
          setError(err.message)
          setStreaming(false)
          setStreamingContent("")
        },
      })
    },
    [conv.id, appendToStreamingContent, loadMemories, loadProposals, loadSummaries, replaceMessage, setError, setStreaming, setStreamingContent],
  )

  const handleEdit = useCallback(
    async (messageId: string, content: string) => {
      try {
        const updated = await editMessage(conv.id, messageId, content)
        replaceMessage(messageId, updated)
        cancelEditing()
      } catch (err) {
        setError((err as Error).message)
      }
    },
    [conv.id, replaceMessage, cancelEditing, setError],
  )

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return
    try {
      await deleteMessage(conv.id, confirmDelete)
      removeMessage(confirmDelete)
      setConfirmDelete(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [conv.id, confirmDelete, removeMessage, setError])

  const handleRewind = useCallback(async () => {
    if (!confirmRewind) return
    try {
      const targetMsg = messages.find(m => m.id === confirmRewind)

      const result = await rewindConversation(conv.id, confirmRewind)
      setMessages(result.messages)

      setMessages(result.messages)

      if (targetMsg?.role === "user") {
        setRewindDraft(targetMsg.content)
        setInputKey(k => k + 1)
      }

      loadSummaries(conv.id)
      setConfirmRewind(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [conv.id, confirmRewind, messages, setMessages, setError, loadSummaries])

  const handleCyclePrev = useCallback(
    async (messageId: string) => {
      try {
        const updated = await cycleAlternative(conv.id, messageId, "prev")
        replaceMessage(messageId, updated)
      } catch (err) {
        setError((err as Error).message)
      }
    },
    [conv.id, replaceMessage, setError],
  )

  const handleCycleNext = useCallback(
    async (messageId: string) => {
      try {
        const updated = await cycleAlternative(conv.id, messageId, "next")
        replaceMessage(messageId, updated)
      } catch (err) {
        setError((err as Error).message)
      }
    },
    [conv.id, replaceMessage, setError],
  )

  const handleRegenerateTitle = useCallback(async () => {
    try {
      const result = await setConversationTitle(conv.id)
      setConv((prev) => ({ ...prev, title: result.title }))
    } catch (err) {
      setError((err as Error).message)
    }
  }, [conv.id, setError])

  const handleManualTitle = useCallback(async () => {
    if (!titleInput.trim()) return
    try {
      const result = await setConversationTitle(conv.id, titleInput.trim())
      setConv((prev) => ({ ...prev, title: result.title }))
      setEditingTitle(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [conv.id, titleInput, setError])

  const handlePreview = useCallback(
    async (content?: string) => {
      setPreviewContent(content)
      setPreviewLoading(true)
      setPreviewOpen(true)
      try {
        const ctx = await getPromptContext(conv.id, content)
        setPreviewContext(ctx)
      } catch (err) {
        setError((err as Error).message)
        setPreviewOpen(false)
      } finally {
        setPreviewLoading(false)
      }
    },
    [conv.id, setError],
  )

  const handleSendFromPreview = useCallback(() => {
    setPreviewOpen(false)
    if (previewContent !== undefined) {
      handleSend(previewContent)
    } else {
      handleContinue()
    }
  }, [previewContent, handleSend, handleContinue])

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="size-8 overflow-hidden rounded-full bg-muted">
          {conv.characterProfileImage ? (
            <img
              src={conv.characterProfileImage}
              alt={`${conv.characterName} avatar`}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col">
          {editingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleManualTitle()
              }}
              className="flex items-center gap-1"
            >
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onBlur={() => setEditingTitle(false)}
              />
            </form>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger>
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  {conv.title ?? conv.characterName}
                  {pendingCount > 0 && (
                    <Badge variant="destructive">{pendingCount}</Badge>
                  )}
                </h2>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    setTitleInput(conv.title ?? "")
                    setEditingTitle(true)
                  }}
                >
                  <Pencil className="size-4" />
                  Editar manualmente
                </ContextMenuItem>
                <ContextMenuItem onClick={handleRegenerateTitle}>
                  <RefreshCw className="size-4" />
                  Regenerar automáticamente
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {conv.characterName}
            <Badge variant={conv.status === "active" ? "default" : "secondary"}>
              {conv.status === "active" ? "Activa" : "Archivada"}
            </Badge>
          </p>
        </div>
        <div className="ml-auto">
          <SettingsPanel
            conversationId={conv.id}
            current={conv}
            onSettingsChanged={setConv}
          >
            <Button variant="ghost" size="icon" data-icon="inline-start">
              <SettingsIcon className="size-4" />
            </Button>
          </SettingsPanel>
        </div>
      </header>

      <MessageScrollerProvider autoScroll={isStreaming}>
        <MessageScroller className="flex-1 p-2 pr-0">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {messages.length === 0 && !streamingContent ? (
                <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">
                  No hay mensajes en esta conversación.
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageScrollerItem
                      key={msg.id}
                      scrollAnchor={i === messages.length - 1 && !isStreaming}
                    >
                      <MessageBubble
                        message={msg}
                        isLastMessage={i === messages.length - 1 && !streamingContent}
                        isEditing={editingMessageId === msg.id}
                        editContent={editingMessageId === msg.id ? editingContent : undefined}
                        onEditContentChange={setEditingContent}
                        onStartEdit={(id, content) => startEditing(id, content)}
                        onCancelEdit={cancelEditing}
                        onSaveEdit={handleEdit}
                        onDelete={(id) => setConfirmDelete(id)}
                        onRegenerate={handleRegenerate}
                        onRewind={(id) => setConfirmRewind(id)}
                        onCyclePrev={handleCyclePrev}
                        onCycleNext={handleCycleNext}
                      />
                    </MessageScrollerItem>
                  ))}
                  {streamingContent && (
                    <MessageScrollerItem key="streaming" scrollAnchor>
                      <MessageBubble
                        message={{
                          id: "streaming",
                          role: "assistant",
                          content: streamingContent,
                          position: 0,
                          createdAt: "",
                          alternatives: [],
                          alternativesCursor: 0,
                        }}
                        isStreaming
                      />
                    </MessageScrollerItem>
                  )}
                </>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>

      <footer className="border-t">
        <MessageInput
          key={inputKey}
          onSend={handleSend}
          onContinue={handleContinue}
          onPreview={handlePreview}
          disabled={isStreaming || conv.status === "archived"}
          rewindDraft={rewindDraft}
        />
      </footer>

      <ChatConfirmDialogs
        confirmDelete={confirmDelete}
        confirmRewind={confirmRewind}
        affectedSummariesCount={affectedSummariesCount}
        onCloseDelete={() => setConfirmDelete(null)}
        onCloseRewind={() => setConfirmRewind(null)}
        onConfirmDelete={handleDelete}
        onConfirmRewind={handleRewind}
      />

      <ContextPreviewDialog
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open) setPreviewOpen(false)
        }}
        context={previewContext}
        onSend={handleSendFromPreview}
        loading={previewLoading}
      />
    </div>
  )
}
