export type MessageSegmentType = "dialogue" | "action" | "ooc"

export interface MessageSegment {
  type: MessageSegmentType
  content: string
}

export function parseMessage(content: string): MessageSegment[] {
  const segments: MessageSegment[] = []
  const regex = /(\*[^*]+\*)|(\/\/[^\n]*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const before = content.slice(lastIndex, match.index)
      if (before) segments.push({ type: "dialogue", content: before })
    }

    if (match[1]) {
      segments.push({ type: "action", content: match[1].slice(1, -1) })
    } else if (match[2]) {
      segments.push({ type: "ooc", content: match[2].slice(2) })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex)
    if (remaining) segments.push({ type: "dialogue", content: remaining })
  }

  return segments.length === 0 ? [{ type: "dialogue", content }] : segments
}
