export function filledKey(value?: string): boolean {
  return (value?.trim().length ?? 0) > 8
}

export function hasGoogleOAuth(): boolean {
  return filledKey(process.env.GOOGLE_CLIENT_ID) && filledKey(process.env.GOOGLE_CLIENT_SECRET)
}

export function hasLiveModel(): boolean {
  return (
    filledKey(process.env.OPENAI_API_KEY) ||
    filledKey(process.env.ANTHROPIC_API_KEY) ||
    filledKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    filledKey(process.env.GROQ_API_KEY)
  )
}
