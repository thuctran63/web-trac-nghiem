import type { Question } from '../data'
import type { ExplanationResult } from '../types/explanation'

export function buildExplainPayload(q: Question, selectedAnswer: string) {
  return {
    section: q.section,
    questionNumber: q.questionNumber,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    selectedAnswer,
    type: q.type,
  }
}

export async function fetchExplanation(
  q: Question,
  selectedAnswer: string,
  signal?: AbortSignal,
): Promise<ExplanationResult> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildExplainPayload(q, selectedAnswer)),
    signal,
  })

  const data = (await res.json().catch(() => ({}))) as ExplanationResult & { error?: string }

  if (!res.ok) {
    const err = data.error || `Lỗi máy chủ (${res.status})`
    if (res.status >= 500 && err.includes('<!DOCTYPE')) {
      throw new Error(
        'API giải thích lỗi server (FUNCTION_INVOCATION_FAILED). Kiểm tra DEEPSEEK_API_KEY trên Vercel và deploy lại.',
      )
    }
    throw new Error(err)
  }

  return data
}
