import { describe, it, expect } from "vitest"

import { Message } from "./message.entity"

const now = new Date()
const validProps = {
  id: "msg-1",
  conversationId: "conv-1",
  role: "user" as const,
  content: "Hello",
  position: 0,
  alternatives: [],
  alternativesCursor: 0,
  createdAt: now,
  editedAt: null,
}

describe("Message.create", () => {
  it("creates a message with valid props", () => {
    const msg = Message.create(validProps)
    expect(msg.content).toBe("Hello")
  })

  it("throws when content is empty", () => {
    expect(() => Message.create({ ...validProps, content: "" })).toThrow("Message content is required")
  })

  it("throws when content is only whitespace", () => {
    expect(() => Message.create({ ...validProps, content: "   " })).toThrow("Message content is required")
  })

  it("throws when role is invalid", () => {
    expect(() => Message.create({ ...validProps, role: "system" as never })).toThrow("Invalid role")
  })
})

describe("Message.fromPersistence", () => {
  it("creates a message with valid props", () => {
    const msg = Message.fromPersistence(validProps)
    expect(msg.content).toBe("Hello")
  })

  it("accepts empty content", () => {
    const msg = Message.fromPersistence({ ...validProps, content: "" })
    expect(msg.content).toBe("")
  })

  it("accepts whitespace-only content", () => {
    const msg = Message.fromPersistence({ ...validProps, content: "   " })
    expect(msg.content).toBe("   ")
  })

  it("throws when role is invalid (structural invariant)", () => {
    expect(() => Message.fromPersistence({ ...validProps, role: "system" as never })).toThrow("Invalid role")
  })
})

describe("Message.rawContent", () => {
  it("returns props.content when cursor is 0", () => {
    const msg = Message.create(validProps)
    expect(msg.rawContent).toBe("Hello")
    expect(msg.rawContent).toBe(msg.content) // same as display when cursor=0
  })

  it("returns props.content even when cursor > 0", () => {
    const assistantMsg = Message.create({ ...validProps, role: "assistant", content: "v2", alternatives: ["v1", "v0"], alternativesCursor: 0 })
    const prev = assistantMsg.cyclePrev()
    expect(prev.alternativesCursor).toBe(1)
    expect(prev.content).toBe("v1") // displayed content
    expect(prev.rawContent).toBe("v2") // original content preserved
    const prev2 = prev.cyclePrev()
    expect(prev2.alternativesCursor).toBe(2)
    expect(prev2.content).toBe("v0")
    expect(prev2.rawContent).toBe("v2")
  })

  it("is preserved through cycleNext back to cursor 0", () => {
    const msg = Message.create({ ...validProps, role: "assistant", content: "original", alternatives: ["alt1"], alternativesCursor: 0 })
    const cycled = msg.cyclePrev()
    expect(cycled.rawContent).toBe("original")
    expect(cycled.content).toBe("alt1")
    const back = cycled.cycleNext()
    expect(back.rawContent).toBe("original")
    expect(back.content).toBe("original")
  })
})

describe("Message.regenerate", () => {
  it("saves previous content as first alternative", () => {
    const msg = Message.create(validProps)
    const regenerated = msg.regenerate("New content")
    expect(regenerated.content).toBe("New content")
    expect(regenerated.alternatives).toEqual(["Hello"])
  })

  it("throws if new content is empty", () => {
    const msg = Message.create(validProps)
    expect(() => msg.regenerate("")).toThrow("Message content is required")
  })

  it("throws if new content is whitespace", () => {
    const msg = Message.create(validProps)
    expect(() => msg.regenerate("   ")).toThrow("Message content is required")
  })
})

describe("Message.withContent", () => {
  it("sets new content", () => {
    const msg = Message.create(validProps)
    const edited = msg.withContent("Edited")
    expect(edited.content).toBe("Edited")
  })

  it("clears alternatives after editing", () => {
    const msg = Message.create(validProps)
    const reg = msg.regenerate("Alt")
    const edited = reg.withContent("Final")
    expect(edited.content).toBe("Final")
    expect(edited.alternatives).toEqual([])
  })

  it("throws if new content is empty", () => {
    const msg = Message.create(validProps)
    expect(() => msg.withContent("")).toThrow("Message content is required")
  })
})
