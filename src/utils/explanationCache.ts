import type { Question } from '../data'
import { questionKey } from './quiz'
import type { CachedExplanation } from '../types/explanation'
import {
  EXPLAIN_CACHE_VERSION,
  EXPLAIN_STORAGE_PREFIX,
} from '../types/explanation'

function storageKeyFor(q: Question): string {
  return `${EXPLAIN_STORAGE_PREFIX}${questionKey(q)}`
}

export function loadCachedExplanation(q: Question): CachedExplanation | null {
  try {
    const raw = localStorage.getItem(storageKeyFor(q))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedExplanation
    if (
      parsed.version !== EXPLAIN_CACHE_VERSION ||
      parsed.questionKey !== questionKey(q) ||
      parsed.correctAnswer !== q.correctAnswer
    ) {
      return null
    }
    if (!parsed.summary || !parsed.whyCorrect || !Array.isArray(parsed.sources)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveCachedExplanation(
  q: Question,
  selectedAnswer: string,
  result: Omit<CachedExplanation, 'version' | 'questionKey' | 'correctAnswer' | 'selectedAnswer' | 'savedAt'>,
): CachedExplanation {
  const entry: CachedExplanation = {
    ...result,
    version: EXPLAIN_CACHE_VERSION,
    questionKey: questionKey(q),
    correctAnswer: q.correctAnswer,
    selectedAnswer,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(storageKeyFor(q), JSON.stringify(entry))
  return entry
}

export function clearCachedExplanation(q: Question): void {
  localStorage.removeItem(storageKeyFor(q))
}
