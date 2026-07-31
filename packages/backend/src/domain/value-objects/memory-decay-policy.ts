import type { Conversation } from "../entities/conversation.entity"

export const MAX_MEMORIES_DECAYED_PER_SWEEP = 100

export class MemoryDecayPolicy {
  constructor(
    readonly mode: "silent" | "manual" | "off",
    readonly threshold: number,
    readonly ageThreshold: number,
    readonly decaySpeed: number,
  ) {
    if (threshold < 1 || threshold > 10) {
      throw new Error("Memory decay threshold must be between 1 and 10")
    }
    if (ageThreshold < 1) {
      throw new Error("Memory decay age threshold must be at least 1")
    }
    if (decaySpeed < 1) {
      throw new Error("Memory decay speed must be at least 1")
    }
  }

  static fromConversation(conversation: Conversation): MemoryDecayPolicy {
    return new MemoryDecayPolicy(
      conversation.memoryDecayMode,
      conversation.memoryDecayThreshold,
      conversation.memoryDecayAgeThreshold,
      conversation.memoryDecaySpeed,
    )
  }

  turnsSince(updatedAt: Date, messageTimestamps: readonly Date[]): number {
    return messageTimestamps.filter((t) => t > updatedAt).length
  }

  effectivePriority(storedPriority: number, turnsSinceUpdate: number): number {
    return Math.max(1, storedPriority - Math.floor(turnsSinceUpdate / this.decaySpeed))
  }

  isPromptEligible(storedPriority: number, turnsSinceUpdate: number): boolean {
    return this.effectivePriority(storedPriority, turnsSinceUpdate) > this.threshold
  }

  isDeletionCandidate(storedPriority: number, turnsSinceUpdate: number): boolean {
    return (
      this.effectivePriority(storedPriority, turnsSinceUpdate) <= this.threshold &&
      turnsSinceUpdate >= this.ageThreshold
    )
  }
}
