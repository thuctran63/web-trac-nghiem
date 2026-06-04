import type { ExplanationResult } from '../../shared/explanation'

export type { ExplanationResult, ExplanationSource } from '../../shared/explanation'

export const EXPLAIN_CACHE_VERSION = 1
export const EXPLAIN_STORAGE_PREFIX = 'ai-explain-v1:'

export interface CachedExplanation extends ExplanationResult {
  version: typeof EXPLAIN_CACHE_VERSION
  questionKey: string
  correctAnswer: string
  selectedAnswer: string
  savedAt: string
}
