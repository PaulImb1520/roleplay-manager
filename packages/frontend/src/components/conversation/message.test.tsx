import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"

import { MessageBubble } from "./message"

afterEach(() => {
  cleanup()
})

const buildMessage = (
  alternativesCursor: number,
  alternatives: string[] = ["Alternativa A"],
) => ({
  id: "msg-1",
  role: "assistant" as const,
  content: "Hola",
  createdAt: "2026-08-12T10:00:00.000Z",
  position: 1,
  alternatives,
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

const swipeLeft = () => swipe(220, 140)
const swipeRight = () => swipe(140, 220)

describe("MessageBubble swipe navigation", () => {
  it("deslizar a la izquierda avanza a la siguiente alternativa", () => {
    const onCycleNext = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(1)}
        isLastMessage
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
        onRegenerate={onRegenerate}
      />,
    )

    swipeLeft()

    expect(onCycleNext).toHaveBeenCalledWith("msg-1")
    expect(onRegenerate).not.toHaveBeenCalled()
  })

  it("deslizar a la derecha vuelve a la alternativa anterior", () => {
    const onCyclePrev = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(0)}
        isLastMessage
        onCycleNext={vi.fn()}
        onCyclePrev={onCyclePrev}
        onRegenerate={onRegenerate}
      />,
    )

    swipeRight()

    expect(onCyclePrev).toHaveBeenCalledWith("msg-1")
    expect(onRegenerate).not.toHaveBeenCalled()
  })

  it("regenera al avanzar cuando ya está en la alternativa más reciente", () => {
    const onCycleNext = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(0)}
        isLastMessage
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
        onRegenerate={onRegenerate}
      />,
    )

    swipeLeft()

    expect(onRegenerate).toHaveBeenCalledWith("msg-1")
    expect(onCycleNext).not.toHaveBeenCalled()
  })

  it("regenera al avanzar aunque el mensaje no tenga alternativas", () => {
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(0, [])}
        isLastMessage
        onRegenerate={onRegenerate}
      />,
    )

    swipeLeft()

    expect(onRegenerate).toHaveBeenCalledWith("msg-1")
  })

  it("no regenera si el mensaje no es el último", () => {
    const onCycleNext = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(0)}
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
        onRegenerate={onRegenerate}
      />,
    )

    swipeLeft()

    expect(onRegenerate).not.toHaveBeenCalled()
    expect(onCycleNext).not.toHaveBeenCalled()
  })

  it("ignora gestos verticales", () => {
    const onCycleNext = vi.fn()
    const onRegenerate = vi.fn()
    render(
      <MessageBubble
        message={buildMessage(1)}
        isLastMessage
        onCycleNext={onCycleNext}
        onCyclePrev={vi.fn()}
        onRegenerate={onRegenerate}
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
    expect(onRegenerate).not.toHaveBeenCalled()
  })
})
