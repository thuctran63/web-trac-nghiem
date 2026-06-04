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
    throw new Error(data.error || `Lỗi máy chủ (${res.status})`)
  }

  return data
}
