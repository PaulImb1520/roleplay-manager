import type {
  StreamChunk,
  ToolCallDelta,
} from "../domain/value-objects/prompt-context"

export interface ToolCallState {
  deltas: ToolCallDelta[]
}

export async function* propagateToolCalls(
  stream: AsyncIterable<StreamChunk>,
  state: ToolCallState,
): AsyncGenerator<StreamChunk> {
  for await (const chunk of stream) {
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      state.deltas.push(...chunk.toolCalls)
    }
    yield chunk
  }
}
