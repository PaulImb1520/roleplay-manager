export interface FormSnapshot {
  name: string
  subtitle: string | null
  profileImage: string
  description: string
  instructions: string | null
  greeting: string
  cards: { title: string; content: string; active: boolean }[]
}

export function buildSnapshot(
  name: string,
  subtitle: string | null | undefined,
  profileImage: string,
  description: string,
  instructions: string | null | undefined,
  greeting: string,
  cards: { title: string; content: string; active: boolean }[],
): FormSnapshot {
  return {
    name: name.trim(),
    subtitle: (subtitle ?? "").trim() || null,
    profileImage: profileImage.trim(),
    description: description.trim(),
    instructions: (instructions ?? "").trim() || null,
    greeting: greeting.trim(),
    cards: cards.map(c => ({
      title: c.title.trim(),
      content: c.content.trim(),
      active: c.active,
    })),
  }
}

export function hasChanges(
  current: FormSnapshot,
  previous: FormSnapshot,
): boolean {
  if (current.name !== previous.name) return true
  if (current.subtitle !== previous.subtitle) return true
  if (current.profileImage !== previous.profileImage) return true
  if (current.description !== previous.description) return true
  if (current.instructions !== previous.instructions) return true
  if (current.greeting !== previous.greeting) return true
  if (current.cards.length !== previous.cards.length) return true
  return current.cards.some((c, i) => {
    const orig = previous.cards[i]
    return !orig || c.title !== orig.title || c.content !== orig.content || c.active !== orig.active
  })
}
