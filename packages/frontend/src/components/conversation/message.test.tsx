import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"

import { MessageBubble } from "./message"

afterEach(() => {
  cleanup()
})

const buildMessage = (alternativesCursor: number) => ({
  id: "msg-1",
  role: "assistant" as const,
  content: "Hola",
  createdAt: "2026-08-12T10:00:00.000Z",
  position: 1,
  alternatives: ["Alternativa A"],
  alternativesCursor,
})

const getBubble = () =>
  screen.getByText("Hola").closest("[data-slot=bubble]") as HTMLElement

const swipe = (from: number, to: number) => {
  fireEvent.pointerDown(getBubble(), {
    pointerType: "touch",
    pointerId: 1,
    clientX: from,
    clientY: 100,
  })
  fireEvent.pointerMove(getBubble(), {
    pointerType: "touch",
    pointerId: 1,
    clientX: to,
    clientY: 100,
  })
  fireEvent.pointerUp(getBubble(), {
    pointerType: "touch",
    pointerId: 1,
    clientX: to,
    clientY: 100,
  })
}

describe("MessageBubble swipe navigation", () => {
  it("deslizar a la izquierda avanza a la siguiente alternativa", () => {
    const onCycleNext = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(1)}
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
      />,
    )

    swipe(220, 140)

    expect(onCycleNext).toHaveBeenCalledWith("msg-1")
  })

  it("deslizar a la derecha vuelve a la alternativa anterior", () => {
    const onCyclePrev = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(0)}
        onCycleNext={vi.fn()}
        onCyclePrev={onCyclePrev}
      />,
    )

    swipe(140, 220)

    expect(onCyclePrev).toHaveBeenCalledWith("msg-1")
  })

  it("ignora gestos verticales", () => {
    const onCycleNext = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(1)}
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
      />,
    )

    fireEvent.pointerDown(getBubble(), {
      pointerType: "touch",
      pointerId: 1,
      clientX: 200,
      clientY: 300,
    })
    fireEvent.pointerMove(getBubble(), {
      pointerType: "touch",
      pointerId: 1,
      clientX: 200,
      clientY: 120,
    })
    fireEvent.pointerUp(getBubble(), {
      pointerType: "touch",
      pointerId: 1,
      clientX: 200,
      clientY: 120,
    })

    expect(onCycleNext).not.toHaveBeenCalled()
  })

  it("no activa el swipe si el mensaje no tiene alternativas", () => {
    const onCycleNext = vi.fn()
    render(
      <MessageBubble
        message={{ ...buildMessage(0), alternatives: [] }}
        onCycleNext={onCycleNext}
      />,
    )

    swipe(220, 140)

    expect(onCycleNext).not.toHaveBeenCalled()
  })
})
