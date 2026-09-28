import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import type * as React from "react"

import { useSwipeNavigation } from "./use-swipe-navigation"

interface FakePointerInit {
  pointerType?: string
  clientX?: number
  clientY?: number
  pointerId?: number
}

const pointerEvent = (init: FakePointerInit = {}) =>
  ({
    pointerType: "touch",
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    currentTarget: { setPointerCapture: vi.fn() },
    ...init,
  }) as unknown as React.PointerEvent<HTMLElement>

const setup = (options: Parameters<typeof useSwipeNavigation>[0] = {}) => {
  const onSwipeLeft = vi.fn()
  const onSwipeRight = vi.fn()
  const view = renderHook(() =>
    useSwipeNavigation({ onSwipeLeft, onSwipeRight, ...options }),
  )
  return { ...view, onSwipeLeft, onSwipeRight }
}

const performSwipe = (
  handlers: ReturnType<typeof useSwipeNavigation>["handlers"],
  from: { x: number; y: number },
  to: { x: number; y: number },
  pointerType = "touch",
) => {
  act(() => {
    handlers.onPointerDown(
      pointerEvent({ pointerType, clientX: from.x, clientY: from.y }),
    )
    handlers.onPointerMove(
      pointerEvent({ pointerType, clientX: to.x, clientY: to.y }),
    )
    handlers.onPointerUp(
      pointerEvent({ pointerType, clientX: to.x, clientY: to.y }),
    )
  })
}

describe("useSwipeNavigation", () => {
  it("dispara onSwipeLeft al deslizar hacia la izquierda", () => {
    const { result, onSwipeLeft, onSwipeRight } = setup()

    performSwipe(result.current.handlers, { x: 200, y: 100 }, { x: 120, y: 100 })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it("dispara onSwipeRight al deslizar hacia la derecha", () => {
    const { result, onSwipeLeft, onSwipeRight } = setup()

    performSwipe(result.current.handlers, { x: 120, y: 100 }, { x: 200, y: 100 })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it("ignora movimientos por debajo del umbral", () => {
    const { result, onSwipeLeft, onSwipeRight } = setup()

    performSwipe(result.current.handlers, { x: 200, y: 100 }, { x: 180, y: 100 })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it("ignora gestos verticales (no rompe el scroll)", () => {
    const { result, onSwipeLeft, onSwipeRight } = setup()

    performSwipe(result.current.handlers, { x: 200, y: 300 }, { x: 190, y: 100 })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it("ignora punteros que no son táctiles", () => {
    const { result, onSwipeLeft } = setup()

    performSwipe(
      result.current.handlers,
      { x: 200, y: 100 },
      { x: 100, y: 100 },
      "mouse",
    )

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it("no arrastra hacia una dirección sin alternativa", () => {
    const { result, onSwipeLeft } = setup({ onSwipeLeft: undefined })

    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({ clientX: 200 }))
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 120 }))
    })

    expect(result.current.dragging).toBe(false)
    expect(result.current.offsetX).toBe(0)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it("reporta dragging y offset durante el gesto y los resetea al soltar", () => {
    const { result, onSwipeLeft } = setup()

    act(() => {
      result.current.handlers.onPointerDown(pointerEvent({ clientX: 200 }))
      result.current.handlers.onPointerMove(pointerEvent({ clientX: 140 }))
    })

    expect(result.current.dragging).toBe(true)
    expect(result.current.offsetX).toBe(-36)

    act(() => {
      result.current.handlers.onPointerUp(pointerEvent({ clientX: 140 }))
    })

    expect(result.current.dragging).toBe(false)
    expect(result.current.offsetX).toBe(0)
    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })

  it("no hace nada cuando está deshabilitado", () => {
    const { result, onSwipeLeft } = setup({ enabled: false })

    performSwipe(result.current.handlers, { x: 200, y: 100 }, { x: 100, y: 100 })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })
})
