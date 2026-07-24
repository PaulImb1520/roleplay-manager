const PROPOSAL_REGEX = /```memory_proposals\s*([\s\S]*?)```/

export interface RawProposal {
  operation: "CREATE" | "UPDATE" | "DELETE"
  targetMemoryId?: string
  actor: string
  title: string
  description: string
  priority?: number
}

export interface ExtractedProposals {
  cleanedContent: string
  proposals: RawProposal[]
  foundBlock: boolean
}

export function extractProposals(content: string): ExtractedProposals {
  const match = content.match(PROPOSAL_REGEX)
  if (!match) {
    return { cleanedContent: content, proposals: [], foundBlock: false }
  }

  const cleanedContent = content.replace(PROPOSAL_REGEX, "").trim()
  const raw = match[1].trim()

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return { cleanedContent, proposals: [], foundBlock: true }
    }

    const proposals: RawProposal[] = parsed
      .filter(
        (p: unknown): p is Record<string, unknown> =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as Record<string, unknown>).operation === "string" &&
          ["CREATE", "UPDATE", "DELETE"].includes(
            (p as Record<string, unknown>).operation as string,
          ),
      )
      .map((p) => ({
        operation: p.operation as "CREATE" | "UPDATE" | "DELETE",
        targetMemoryId: p.targetMemoryId as string | undefined,
        actor: String(p.actor ?? ""),
        title: String(p.title ?? ""),
        description: String(p.description ?? ""),
        priority:
          typeof p.priority === "number" ? p.priority : undefined,
      }))

    return { cleanedContent, proposals, foundBlock: true }
  } catch {
    return { cleanedContent, proposals: [], foundBlock: true }
  }
}

export interface CleanStreamState {
  fullContent: string
}

export async function* createCleanStream(
  stream: AsyncIterable<{ content?: string }>,
  state: CleanStreamState,
): AsyncGenerator<{ content: string }> {
  let lastYieldedPos = 0
  let blockStart = -1
  let blockEnd = -1

  for await (const chunk of stream) {
    if (chunk.content) {
      state.fullContent += chunk.content
    }
    if (blockEnd === -1) {
      if (blockStart === -1) {
        blockStart = state.fullContent.indexOf("```memory_proposals", lastYieldedPos)
      }
      if (blockStart !== -1) {
        blockEnd = state.fullContent.indexOf("```", blockStart + 3)
      }

      if (blockStart !== -1 && blockEnd !== -1) {
        const afterBlock = state.fullContent.slice(blockEnd + 3)
        if (afterBlock) {
          yield { content: afterBlock }
        }
        lastYieldedPos = state.fullContent.length
      } else if (blockStart !== -1) {
        const beforeBlock = state.fullContent.slice(lastYieldedPos, blockStart)
        if (beforeBlock) {
          yield { content: beforeBlock }
        }
        lastYieldedPos = blockStart
      } else {
        const newContent = state.fullContent.slice(lastYieldedPos)
        if (newContent) {
          yield { content: newContent }
        }
        lastYieldedPos = state.fullContent.length
      }
    } else {
      const newContent = state.fullContent.slice(lastYieldedPos)
      if (newContent) {
        yield { content: newContent }
      }
      lastYieldedPos = state.fullContent.length
    }
  }
}
