import { useRef, useState } from "react"
import type * as React from "react"

export interface SwipeNavigationOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  enabled?: boolean
  threshold?: number
}

export interface SwipeNavigationHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void
}

export interface SwipeNavigationResult {
  handlers: SwipeNavigationHandlers
  dragging: boolean
  offsetX: number
}

const DEFAULT_THRESHOLD = 50
const AXIS_LOCK_THRESHOLD = 10
const MAX_OFFSET = 72
const OFFSET_DAMPING = 0.6

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  threshold = DEFAULT_THRESHOLD,
}: SwipeNavigationOptions = {}): SwipeNavigationResult {
  const origin = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const axis = useRef<"pending" | "horizontal" | "vertical">("pending")
  const [offsetX, setOffsetX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const canDrag = (deltaX: number) =>
    deltaX < 0 ? Boolean(onSwipeLeft) : Boolean(onSwipeRight)

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType !== "touch") return
    origin.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    axis.current = "pending"
    setDragging(false)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const start = origin.current
    if (!start || event.pointerId !== start.pointerId) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y

    if (axis.current === "pending") {
      if (
        Math.abs(deltaX) < AXIS_LOCK_THRESHOLD &&
        Math.abs(deltaY) < AXIS_LOCK_THRESHOLD
      ) {
        return
      }
      if (Math.abs(deltaX) > Math.abs(deltaY) && canDrag(deltaX)) {
        axis.current = "horizontal"
        setDragging(true)
        event.currentTarget.setPointerCapture?.(event.pointerId)
      } else {
        axis.current = "vertical"
        return
      }
    }

    if (axis.current !== "horizontal") return

    const clamped = Math.max(
      -MAX_OFFSET,
      Math.min(MAX_OFFSET, deltaX * OFFSET_DAMPING),
    )
    setOffsetX(clamped)
  }

  const finish = (event: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
    const start = origin.current
    if (!start || event.pointerId !== start.pointerId) return

    const deltaX = event.clientX - start.x
    const wasHorizontal = axis.current === "horizontal"

    origin.current = null
    axis.current = "pending"
    setDragging(false)
    setOffsetX(0)

    if (!wasHorizontal || cancelled) return
    if (deltaX <= -threshold && onSwipeLeft) {
      onSwipeLeft()
    } else if (deltaX >= threshold && onSwipeRight) {
      onSwipeRight()
    }
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => finish(event, false),
      onPointerCancel: (event) => finish(event, true),
    },
    dragging,
    offsetX,
  }
}
