export type ReasoningEffort = 'low' | 'medium' | 'high' | 'max'

export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
  thinkingEnabled: boolean
  reasoningEffort: ReasoningEffort
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-v4-flash'

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value === '') return defaultValue
  return value === 'true' || value === '1'
}

function parseReasoningEffort(value: string | undefined): ReasoningEffort {
  const v = value?.toLowerCase()
  if (v === 'low' || v === 'medium' || v === 'high' || v === 'max') return v
  return 'medium'
}

/** Đọc cấu hình DeepSeek từ biến môi trường (Vercel / .env.local). */
export function getDeepSeekConfig(
  env: NodeJS.ProcessEnv | Record<string, string> = process.env,
): DeepSeekConfig {
  const apiKey =
    env.DEEPSEEK_API_KEY?.trim() ||
    env.API_KEY?.trim() ||
    ''

  const baseUrl = (
    env.DEEPSEEK_BASE_URL?.trim() ||
    env.BASE_URL?.trim() ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, '')

  const model =
    env.DEEPSEEK_MODEL?.trim() ||
    env.MODEL?.trim() ||
    DEFAULT_MODEL

  // Giải thích trắc nghiệm cần JSON ổn định → mặc định tắt thinking (nhanh, rẻ hơn)
  const thinkingEnabled = parseBool(
    env.DEEPSEEK_THINKING ?? env.THINKING_ENABLED,
    false,
  )

  const reasoningEffort = parseReasoningEffort(
    env.DEEPSEEK_REASONING_EFFORT ?? env.REASONING_EFFORT,
  )

  return { apiKey, baseUrl, model, thinkingEnabled, reasoningEffort }
}

export function getChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}
