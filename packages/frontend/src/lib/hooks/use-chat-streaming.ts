import { useCallback, useEffect, useRef } from "react"
import { StreamingBuffer } from "../streaming/streaming-buffer"
import {
  sendMessageStreaming,
  regenerateReplyStreaming,
  continueConversationStreaming,
} from "../api/conversations"
import type { MessageDTO } from "@workspace/shared/types/message"
import { useChatStore } from "../stores/chat.store"

export interface UseChatStreamingOptions {
  onDone?: () => void
  onError?: () => void
  onTitleGenerated?: (title: string) => void
  onSummaryGenerated?: () => void
}

export function useChatStreaming(convId: string, options?: UseChatStreamingOptions) {
  const streamingBuffer = useRef<StreamingBuffer | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  })

  const addMessage = useChatStore((s) => s.addMessage)
  const replaceMessage = useChatStore((s) => s.replaceMessage)
  const appendToStreamingContent = useChatStore((s) => s.appendToStreamingContent)
  const setStreaming = useChatStore((s) => s.setStreaming)
  const setStreamingContent = useChatStore((s) => s.setStreamingContent)
  const setError = useChatStore((s) => s.setError)
  const setRegeneratingMessageId = useChatStore((s) => s.setRegeneratingMessageId)

  useEffect(() => {
    const buf = new StreamingBuffer({
      onFlush: (text) => appendToStreamingContent(text),
    })
    streamingBuffer.current = buf
    return () => buf.clear()
  }, [appendToStreamingContent])

  const handleSend = useCallback(
    async (content: string) => {
      setError(null)
      setStreaming(true)
      setStreamingContent("")

      const buf = streamingBuffer.current!
      buf.clear()
      buf.start()

      await sendMessageStreaming(convId, content, {
        onSaved: (message) => {
          addMessage(message)
        },
        onChunk: (chunk) => {
          buf.push(chunk)
        },
        onDone: (message) => {
          buf.flush(true)
          addMessage(message)
          setStreamingContent("")
          setStreaming(false)
          optionsRef.current?.onDone?.()
        },
        onTitleGenerated: (title) => {
          optionsRef.current?.onTitleGenerated?.(title)
        },
        onSummaryGenerated: () => {
          optionsRef.current?.onSummaryGenerated?.()
        },
        onError: (err) => {
          buf.flush(true)
          setError(err.message)
          setStreaming(false)
          setStreamingContent("")
          optionsRef.current?.onError?.()
        },
      })
    },
    [convId, addMessage, setError, setStreaming, setStreamingContent],
  )

  const handleContinue = useCallback(async () => {
    setError(null)
    setStreaming(true)
    setStreamingContent("")

    const buf = streamingBuffer.current!
    buf.clear()
    buf.start()

    await continueConversationStreaming(convId, {
      onChunk: (chunk) => {
        buf.push(chunk)
      },
      onDone: (message) => {
        buf.flush(true)
        addMessage(message)
        setStreamingContent("")
        setStreaming(false)
        optionsRef.current?.onDone?.()
      },
      onSummaryGenerated: () => {
        optionsRef.current?.onSummaryGenerated?.()
      },
      onError: (err) => {
        buf.flush(true)
        setError(err.message)
        setStreaming(false)
        setStreamingContent("")
        optionsRef.current?.onError?.()
      },
    })
  }, [convId, addMessage, setError, setStreaming, setStreamingContent])

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      setError(null)
      setRegeneratingMessageId(messageId)
      setStreaming(true)
      setStreamingContent("")

      const buf = streamingBuffer.current!
      buf.clear()
      buf.start()

      await regenerateReplyStreaming(convId, messageId, {
        onChunk: (chunk) => {
          buf.push(chunk)
        },
        onDone: (message: MessageDTO) => {
          buf.flush(true)
          replaceMessage(messageId, message)
          setRegeneratingMessageId(null)
          setStreamingContent("")
          setStreaming(false)
          optionsRef.current?.onDone?.()
        },
        onSummaryGenerated: () => {
          optionsRef.current?.onSummaryGenerated?.()
        },
        onError: (err: { code: string; message: string }) => {
          buf.flush(true)
          setError(err.message)
          setRegeneratingMessageId(null)
          setStreaming(false)
          setStreamingContent("")
          optionsRef.current?.onError?.()
        },
      })
    },
    [convId, replaceMessage, setError, setRegeneratingMessageId, setStreaming, setStreamingContent],
  )

  return { handleSend, handleContinue, handleRegenerate }
}