const WORD_BOUNDARY = /[\s\n.!?,;:…]$/

export interface StreamingBufferOptions {
  minIntervalMs?: number
  maxChunkSize?: number
  wordBoundary?: RegExp
  onFlush: (text: string) => void
}

export class StreamingBuffer {
  private buffer = ""
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly minIntervalMs: number
  private readonly maxChunkSize: number
  private readonly wordBoundary: RegExp
  private readonly onFlush: (text: string) => void

  constructor(opts: StreamingBufferOptions) {
    this.minIntervalMs = opts.minIntervalMs ?? 50
    this.maxChunkSize = opts.maxChunkSize ?? 80
    this.wordBoundary = opts.wordBoundary ?? WORD_BOUNDARY
    this.onFlush = opts.onFlush
  }

  push(chunk: string): void {
    this.buffer += chunk
  }

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.tick(), this.minIntervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  clear(): void {
    this.stop()
    this.buffer = ""
  }

  flush(force = false): void {
    if (!this.buffer) return

    if (force) {
      const text = this.buffer
      this.buffer = ""
      this.onFlush(text)
      return
    }

    const end = this.findFlushEnd()
    if (end === 0) return

    const text = this.buffer.slice(0, end)
    this.buffer = this.buffer.slice(end)
    this.onFlush(text)
  }

  get pending(): string {
    return this.buffer
  }

  private tick(): void {
    if (!this.buffer) {
      this.stop()
      return
    }
    this.flush(false)
  }

  private findFlushEnd(): number {
    const len = Math.min(this.buffer.length, this.maxChunkSize)

    if (len === this.buffer.length && this.wordBoundary.test(this.buffer[len - 1] ?? "")) {
      return len
    }

    for (let i = len; i > 0; i--) {
      if (this.wordBoundary.test(this.buffer[i - 1])) {
        return i
      }
    }

    return 0
  }
}
