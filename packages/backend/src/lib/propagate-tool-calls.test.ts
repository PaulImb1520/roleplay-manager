import { describe, it, expect } from "vitest"

import { propagateToolCalls, type ToolCallState } from "./propagate-tool-calls"

async function* makeStream(chunks: Array<{ content?: string; toolCalls?: any[] }>) {
  for (const chunk of chunks) {
    yield chunk
  }
}

describe("propagateToolCalls", () => {
  it("pasa chunks sin tool calls sin modificar nada", async () => {
    const state: ToolCallState = { deltas: [] }
    const out: any[] = []
    for await (const c of propagateToolCalls(
      makeStream([{ content: "hola" }, { content: " mundo" }]),
      state,
    )) {
      out.push(c)
    }
    expect(out).toEqual([{ content: "hola" }, { content: " mundo" }])
    expect(state.deltas).toEqual([])
  })

  it("acumula tool calls en el state y los propaga", async () => {
    const state: ToolCallState = { deltas: [] }
    const out: any[] = []
    for await (const c of propagateToolCalls(
      makeStream([
        { content: "x" },
        { toolCalls: [{ index: 0, id: "c1" }] },
        { toolCalls: [{ index: 0, argumentsDelta: '{"a":1}' }] },
      ]),
      state,
    )) {
      out.push(c)
    }
    expect(out).toHaveLength(3)
    expect(state.deltas).toEqual([
      { index: 0, id: "c1" },
      { index: 0, argumentsDelta: '{"a":1}' },
    ])
  })

  it("mezcla chunks con content y toolCalls sin perder nada", async () => {
    const state: ToolCallState = { deltas: [] }
    const out: any[] = []
    for await (const c of propagateToolCalls(
      makeStream([
        { content: "Hola", toolCalls: [{ index: 0, id: "c1" }] },
        { content: " mundo" },
      ]),
      state,
    )) {
      out.push(c)
    }
    expect(out[0]).toEqual({ content: "Hola", toolCalls: [{ index: 0, id: "c1" }] })
    expect(out[1]).toEqual({ content: " mundo" })
    expect(state.deltas).toHaveLength(1)
  })

  it("no acumula si toolCalls es array vacio", async () => {
    const state: ToolCallState = { deltas: [] }
    const out: any[] = []
    for await (const c of propagateToolCalls(
      makeStream([{ content: "x", toolCalls: [] }]),
      state,
    )) {
      out.push(c)
    }
    expect(state.deltas).toEqual([])
    expect(out[0]).toEqual({ content: "x", toolCalls: [] })
  })
})
