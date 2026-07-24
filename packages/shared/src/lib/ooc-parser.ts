export interface OocParseResult {
  cleanedContent: string
  oocSegments: string[]
}

export const OOC_REGEX_SOURCE = "\\/\\/([^\\n]*?)\\/\\/"
const OOC_REGEX = new RegExp(OOC_REGEX_SOURCE, "g")

export function extractOocInner(match: string): string {
  return match.slice(2, -2).trim()
}

export function parseOoc(content: string): OocParseResult {
  if (!content) {
    return { cleanedContent: "", oocSegments: [] }
  }

  const oocSegments: string[] = []
  const cleaned = content.replace(OOC_REGEX, (_match, inner: string) => {
    const trimmed = inner.trim()
    if (trimmed.length === 0) {
      return ""
    }
    oocSegments.push(trimmed)
    return ""
  })

  const cleanedContent = cleaned
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return { cleanedContent, oocSegments }
}
