import { describe, it, expect } from "vitest"
import { buildSnapshot, hasChanges } from "./character-form-utils"

const base = {
  name: "Dr. House",
  subtitle: "Diagnosticador",
  profileImage: "img.jpg",
  description: "Un médico genio",
  instructions: "Sé sarcástico",
  greeting: "¡Hola!",
  cards: [
    { title: "Card 1", content: "Content 1", active: true },
    { title: "Card 2", content: "Content 2", active: false },
  ],
}

describe("buildSnapshot", () => {
  it("trims all string fields", () => {
    const snap = buildSnapshot(
      "  Dr. House  ", "  sub  ", "  img.jpg  ",
      "  desc  ", "  instr  ", "  hello  ",
      [{ title: "  Card  ", content: "  Content  ", active: true }],
    )
    expect(snap).toEqual({
      name: "Dr. House",
      subtitle: "sub",
      profileImage: "img.jpg",
      description: "desc",
      instructions: "instr",
      greeting: "hello",
      cards: [{ title: "Card", content: "Content", active: true }],
    })
  })

  it("converts empty subtitle to null", () => {
    const snap = buildSnapshot("n", "", "i", "d", "instr", "g", [])
    expect(snap.subtitle).toBeNull()
  })

  it("converts null subtitle to null", () => {
    const snap = buildSnapshot("n", null, "i", "d", "instr", "g", [])
    expect(snap.subtitle).toBeNull()
  })

  it("converts whitespace-only subtitle to null", () => {
    const snap = buildSnapshot("n", "  ", "i", "d", "instr", "g", [])
    expect(snap.subtitle).toBeNull()
  })

  it("converts empty instructions to null", () => {
    const snap = buildSnapshot("n", "sub", "i", "d", "", "g", [])
    expect(snap.instructions).toBeNull()
  })

  it("converts null instructions to null", () => {
    const snap = buildSnapshot("n", "sub", "i", "d", null, "g", [])
    expect(snap.instructions).toBeNull()
  })

  it("preserves non-empty subtitle", () => {
    const snap = buildSnapshot("n", "  sub  ", "i", "d", "instr", "g", [])
    expect(snap.subtitle).toBe("sub")
  })
})

describe("hasChanges", () => {
  it("returns false for identical snapshots", () => {
    expect(hasChanges(base, { ...base })).toBe(false)
  })

  it("returns true when name changes", () => {
    expect(hasChanges({ ...base, name: "Wilson" }, base)).toBe(true)
  })

  it("returns true when subtitle changes", () => {
    expect(hasChanges({ ...base, subtitle: "Oncólogo" }, base)).toBe(true)
  })

  it("returns true when subtitle goes from null to a value", () => {
    expect(hasChanges({ ...base, subtitle: "New" }, { ...base, subtitle: null })).toBe(true)
  })

  it("returns false when both subtitles are null-equivalent (null vs null)", () => {
    expect(hasChanges({ ...base, subtitle: null }, { ...base, subtitle: null })).toBe(false)
  })

  it("returns true when profileImage changes", () => {
    expect(hasChanges({ ...base, profileImage: "new.jpg" }, base)).toBe(true)
  })

  it("returns true when description changes", () => {
    expect(hasChanges({ ...base, description: "New" }, base)).toBe(true)
  })

  it("returns true when instructions changes", () => {
    expect(hasChanges({ ...base, instructions: "New" }, base)).toBe(true)
  })

  it("returns true when greeting changes", () => {
    expect(hasChanges({ ...base, greeting: "New" }, base)).toBe(true)
  })

  it("returns true when card content changes", () => {
    const cards = [{ ...base.cards[0], content: "Modified" }, base.cards[1]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("returns true when card title changes", () => {
    const cards = [{ ...base.cards[0], title: "Modified" }, base.cards[1]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("returns true when card active toggles", () => {
    const cards = [{ ...base.cards[0], active: false }, base.cards[1]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("returns true when card count increases", () => {
    const cards = [...base.cards, { title: "C3", content: "C3", active: true }]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("returns true when card count decreases", () => {
    const cards = [base.cards[0]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("returns true when a new card replaces an old one at same index", () => {
    const cards = [{ title: "New", content: "New", active: true }, base.cards[1]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })

  it("detects change when all cards are removed", () => {
    expect(hasChanges({ ...base, cards: [] }, base)).toBe(true)
  })

  it("returns false when card order changes but content is same", () => {
    const cards = [base.cards[1], base.cards[0]]
    expect(hasChanges({ ...base, cards }, base)).toBe(true)
  })
})
