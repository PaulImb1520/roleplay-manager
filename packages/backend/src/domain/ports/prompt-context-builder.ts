import type { CharacterVersion } from "../entities/character-version.entity"
import type { Message } from "../entities/message.entity"
import type { PromptContext } from "../value-objects/prompt-context"

export interface PromptContextBuilder {
  build(params: {
    characterVersion: CharacterVersion
    messages: Message[]
    recentMessageCount: number
  }): Promise<PromptContext>
}
