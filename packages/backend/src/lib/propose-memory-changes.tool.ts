import type {
  ToolCall,
  ToolCallDelta,
  ToolDefinition,
} from "../domain/value-objects/prompt-context"
import type { RawProposal } from "./memory-proposal-extractor"

export const PROPOSE_MEMORY_CHANGES_TOOL_NAME = "propose_memory_changes"

export function buildProposeMemoryChangesTool(): ToolDefinition {
  return {
    type: "function",
    function: {
      name: PROPOSE_MEMORY_CHANGES_TOOL_NAME,
      description:
        "Propose changes to the dynamic memory. Call this when you want to create, update, or delete a memory entry. Each call represents a single proposal.",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["CREATE", "UPDATE", "DELETE"],
            description: "The operation to perform on the memory.",
          },
          targetMemoryId: {
            type: "string",
            description:
              "Required for UPDATE and DELETE. The id of the memory entry to modify.",
          },
          actor: {
            type: "string",
            description: "The character or entity this memory is about.",
          },
          title: {
            type: "string",
            description: "Short title summarizing the memory.",
          },
          description: {
            type: "string",
            description: "Detailed description of the memory.",
          },
          priority: {
            type: "number",
            description:
              "Integer between 1 and 10. Higher means more important.",
          },
        },
        required: ["operation", "actor", "title", "description"],
      },
    },
  }
}

export function accumulateToolCallDeltas(
  deltas: ToolCallDelta[],
): ToolCall[] {
  const byIndex = new Map<number, { call: ToolCall; order: number }>()
  let order = 0

  for (const delta of deltas) {
    const existing = byIndex.get(delta.index)
    if (!existing) {
      byIndex.set(delta.index, {
        call: {
          id: delta.id ?? "",
          functionName: delta.functionName ?? "",
          arguments: delta.argumentsDelta ?? "",
        },
        order: order++,
      })
      continue
    }

    if (delta.id && !existing.call.id) existing.call.id = delta.id
    if (delta.functionName && !existing.call.functionName) {
      existing.call.functionName = delta.functionName
    }
    if (delta.argumentsDelta) {
      existing.call.arguments =
        (existing.call.arguments ?? "") + delta.argumentsDelta
    }
  }

  return Array.from(byIndex.values())
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.call)
}

export function toolCallsToRawProposals(calls: ToolCall[]): RawProposal[] {
  const validOps = new Set(["CREATE", "UPDATE", "DELETE"])
  const out: RawProposal[] = []

  for (const call of calls) {
    if (call.functionName !== PROPOSE_MEMORY_CHANGES_TOOL_NAME) continue

    let parsed: unknown
    try {
      parsed = JSON.parse(call.arguments)
    } catch {
      continue
    }

    if (typeof parsed !== "object" || parsed === null) continue

    const obj = parsed as Record<string, unknown>
    const operation = obj.operation
    if (typeof operation !== "string" || !validOps.has(operation)) continue

    const actor = String(obj.actor ?? "").trim()
    const title = String(obj.title ?? "").trim()
    if (!actor || !title) continue

    const description = String(obj.description ?? "")
    const targetMemoryId =
      typeof obj.targetMemoryId === "string" ? obj.targetMemoryId : undefined
    const priority =
      typeof obj.priority === "number" ? obj.priority : undefined

    out.push({
      operation: operation as "CREATE" | "UPDATE" | "DELETE",
      targetMemoryId,
      actor,
      title,
      description,
      priority,
    })
  }

  return out
}
