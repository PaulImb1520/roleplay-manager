export class GeneratedResponse {
  private constructor(
    public readonly content: string,
    public readonly finishReason: string,
  ) {}

  static create(props: { content: string; finishReason: string }): GeneratedResponse {
    return new GeneratedResponse(props.content, props.finishReason)
  }
}
