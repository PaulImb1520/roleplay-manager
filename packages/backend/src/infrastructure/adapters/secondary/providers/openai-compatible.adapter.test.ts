import { describe, it, expect, vi, beforeEach } from "vitest"

import type { Logger } from "../../../../domain/ports/logger.port"
import type { ToolDefinition } from "../../../../domain/value-objects/prompt-context"

const createMock = vi.fn()

vi.mock("openai", () => {
  return {
    default: class FakeOpenAI {
      chat = {
        completions: {
          create: (...args: unknown[]) => createMock(...args),
        },
      }
    },
  }
})

import { OpenAICompatibleAdapter } from "./openai-compatible.adapter"
import type { PromptContext } from "../../../../domain/value-objects/prompt-context"

const silentLogger: Logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(function (this: Logger) {
    return this
  }),
}

const baseContext: PromptContext = {
  systemPrompt: "Eres un asistente.",
  messages: [{ role: "user", content: "Hola" }],
}

function buildAdapter() {
  return new OpenAICompatibleAdapter({
    baseUrl: "http://localhost:1234/v1",
    apiKey: null,
    timeoutMs: 1000,
    streamingTimeoutMs: 1000,
    logger: silentLogger,
  })
}

async function* makeStream<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) {
    yield item
  }
}

describe("OpenAICompatibleAdapter - tool calling", () => {
  beforeEach(() => {
    createMock.mockReset()
  })

  it("pasa tools y tool_choice=auto al client cuando hay tools", async () => {
    createMock.mockReturnValue(makeStream([]))

    const tool: ToolDefinition = {
      type: "function",
      function: { name: "ping", description: "d", parameters: { type: "object", properties: {} } },
    }

    const adapter = buildAdapter()
    for await (const _ of adapter.generateStreaming(baseContext, {
      model: "gpt-4o-mini",
      tools: [tool],
    })) {
      // consume
    }

    expect(createMock).toHaveBeenCalledTimes(1)
    const args = createMock.mock.calls[0][0] as Record<string, unknown>
    expect(args.tools).toEqual([tool])
    expect(args.tool_choice).toBe("auto")
  })

  it("respeta tool_choice custom cuando se pasa", async () => {
    createMock.mockReturnValue(makeStream([]))

    const adapter = buildAdapter()
    for await (const _ of adapter.generateStreaming(baseContext, {
      tools: [
        {
          type: "function",
          function: { name: "ping", description: "d", parameters: { type: "object", properties: {} } },
        },
      ],
      toolChoice: { type: "function", function: { name: "ping" } },
    })) {
      // consume
    }

    const args = createMock.mock.calls[0][0] as Record<string, unknown>
    expect(args.tool_choice).toEqual({ type: "function", function: { name: "ping" } })
  })

  it("NO pasa tools cuando no se proveen", async () => {
    createMock.mockReturnValue(makeStream([]))

    const adapter = buildAdapter()
    for await (const _ of adapter.generateStreaming(baseContext, { model: "gpt-4o-mini" })) {
      // consume
    }

    const args = createMock.mock.calls[0][0] as Record<string, unknown>
    expect(args.tools).toBeUndefined()
    expect(args.tool_choice).toBeUndefined()
  })

  it("emite toolCalls desde chunks con delta.tool_calls", async () => {
    createMock.mockReturnValue(
      makeStream([
        {
          choices: [
            {
              delta: {
                tool_calls: [{ index: 0, id: "c1", function: { name: "ping", arguments: "" } }],
              },
            },
          ],
        },
        {
          choices: [
            {
              delta: {
                tool_calls: [{ index: 0, function: { arguments: '{"x":' } }],
              },
            },
          ],
        },
        {
          choices: [
            {
              delta: {
                tool_calls: [{ index: 0, function: { arguments: "1}" } }],
              },
            },
          ],
        },
        {
          choices: [{ delta: { content: "Listo" } }],
        },
      ]),
    )

    const adapter = buildAdapter()
    const out: Array<{ content?: string; toolCalls?: any[] }> = []
    for await (const chunk of adapter.generateStreaming(baseContext, {
      model: "gpt-4o-mini",
      tools: [
        {
          type: "function",
          function: { name: "ping", description: "d", parameters: { type: "object", properties: {} } },
        },
      ],
    })) {
      out.push(chunk)
    }

    expect(out).toHaveLength(4)
    expect(out[0].toolCalls).toEqual([
      { index: 0, id: "c1", functionName: "ping", argumentsDelta: "" },
    ])
    expect(out[1].toolCalls).toEqual([
      { index: 0, argumentsDelta: '{"x":' },
    ])
    expect(out[2].toolCalls).toEqual([
      { index: 0, argumentsDelta: "1}" },
    ])
    expect(out[3].content).toBe("Listo")
  })

  it("emite chunk solo con content cuando no hay tool_calls", async () => {
    createMock.mockReturnValue(
      makeStream([
        { choices: [{ delta: { content: "Hola" } }] },
        { choices: [{ delta: { content: " mundo" } }] },
      ]),
    )

    const adapter = buildAdapter()
    const out: Array<{ content?: string; toolCalls?: any[] }> = []
    for await (const chunk of adapter.generateStreaming(baseContext, { model: "gpt-4o-mini" })) {
      out.push(chunk)
    }

    expect(out).toEqual([{ content: "Hola" }, { content: " mundo" }])
  })

  it("omite chunks vacios (sin content ni toolCalls)", async () => {
    createMock.mockReturnValue(
      makeStream([
        { choices: [{ delta: {} }] },
        { choices: [{ delta: { content: "x" } }] },
      ]),
    )

    const adapter = buildAdapter()
    const out: Array<{ content?: string; toolCalls?: any[] }> = []
    for await (const chunk of adapter.generateStreaming(baseContext, { model: "gpt-4o-mini" })) {
      out.push(chunk)
    }

    expect(out).toEqual([{ content: "x" }])
  })
})
