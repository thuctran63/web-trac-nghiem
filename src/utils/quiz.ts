import type { Question } from '../data'

export interface QuizState {
  currentIndex: number
  answers: Record<string, string>
  showResult: boolean
  finished: boolean
}

export const QUIZ_STORAGE_PREFIX = 'quiz-'

export function questionKey(q: Question): string {
  return `${q.section}-${q.questionNumber}`
}

export function countCorrect(questions: Question[], answers: Record<string, string>): number {
  return questions.filter((q) => answers[questionKey(q)] === q.correctAnswer).length
}

export function getOptionKeys(question: Question): string[] {
  if (question.type === 'true_false') return ['A', 'B']
  return Object.keys(question.options).sort()
}

export function loadQuizState(key: string): QuizState | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as QuizState
    if (
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answers !== 'object' ||
      typeof parsed.showResult !== 'boolean' ||
      typeof parsed.finished !== 'boolean'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveQuizState(key: string, state: QuizState) {
  localStorage.setItem(key, JSON.stringify(state))
}

export function clearQuizState(key: string) {
  localStorage.removeItem(key)
}

export interface QuizProgress {
  slug: string
  answered: number
  total: number
  currentIndex: number
}

export function listInProgressQuizzes(
  slugs: { slug: string; total: number }[],
): QuizProgress[] {
  const out: QuizProgress[] = []
  for (const { slug, total } of slugs) {
    const state = loadQuizState(`${QUIZ_STORAGE_PREFIX}${slug}`)
    if (!state || state.finished || total === 0) continue
    const answered = Object.keys(state.answers).length
    if (answered === 0) continue
    out.push({
      slug,
      answered,
      total,
      currentIndex: Math.min(state.currentIndex, total - 1),
    })
  }
  return out.sort((a, b) => b.answered - a.answered)
}
