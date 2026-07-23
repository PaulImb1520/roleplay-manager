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
