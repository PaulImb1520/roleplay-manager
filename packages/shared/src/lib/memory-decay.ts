export function turnsSince(
  updatedAt: string | Date,
  messages: readonly { role: string; createdAt: string | Date }[],
): number {
  const updated = new Date(updatedAt).getTime()
  return messages.filter(
    (m) => m.role === "user" && new Date(m.createdAt).getTime() > updated,
  ).length
}

export function effectivePriority(
  storedPriority: number,
  turnsSinceUpdate: number,
  decaySpeed: number,
): number {
  return Math.max(1, storedPriority - Math.floor(turnsSinceUpdate / decaySpeed))
}

export function isPromptEligible(
  storedPriority: number,
  turnsSinceUpdate: number,
  threshold: number,
  decaySpeed: number,
): boolean {
  return effectivePriority(storedPriority, turnsSinceUpdate, decaySpeed) > threshold
}

export function isDeletionCandidate(
  storedPriority: number,
  turnsSinceUpdate: number,
  threshold: number,
  ageThreshold: number,
  decaySpeed: number,
): boolean {
  return (
    effectivePriority(storedPriority, turnsSinceUpdate, decaySpeed) <= threshold &&
    turnsSinceUpdate >= ageThreshold
  )
}
