export type ReasoningEffort = 'low' | 'medium' | 'high' | 'max'

/** Cố định trong code — không đọc từ env */
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
export const DEEPSEEK_MODEL = 'deepseek-v4-flash'

export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
  thinkingEnabled: boolean
  reasoningEffort: ReasoningEffort
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value === '') return defaultValue
  return value === 'true' || value === '1'
}

function parseReasoningEffort(value: string | undefined): ReasoningEffort {
  const v = value?.toLowerCase()
  if (v === 'low' || v === 'medium' || v === 'high' || v === 'max') return v
  return 'medium'
}

/** Chỉ API key (và tùy chọn thinking) lấy từ env. */
export function getDeepSeekConfig(
  env: NodeJS.ProcessEnv | Record<string, string> = process.env,
): DeepSeekConfig {
  const apiKey =
    env.DEEPSEEK_API_KEY?.trim() ||
    env.API_KEY?.trim() ||
    ''

  const thinkingEnabled = parseBool(
    env.DEEPSEEK_THINKING ?? env.THINKING_ENABLED,
    false,
  )

  const reasoningEffort = parseReasoningEffort(
    env.DEEPSEEK_REASONING_EFFORT ?? env.REASONING_EFFORT,
  )

  return {
    apiKey,
    baseUrl: DEEPSEEK_BASE_URL,
    model: DEEPSEEK_MODEL,
    thinkingEnabled,
    reasoningEffort,
  }
}

export function getChatCompletionsUrl(baseUrl: string = DEEPSEEK_BASE_URL): string {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}
