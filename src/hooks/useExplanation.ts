import { useState, useEffect, useCallback, useRef } from 'react'
import type { Question } from '../data'
import type { CachedExplanation } from '../types/explanation'
import {
  loadCachedExplanation,
  saveCachedExplanation,
  clearCachedExplanation,
} from '../utils/explanationCache'
import { fetchExplanation } from '../services/explainApi'

export type ExplanationStatus = 'idle' | 'loading' | 'cached' | 'success' | 'error'

export function useExplanation(
  question: Question | undefined,
  selectedAnswer: string | undefined,
  enabled: boolean,
) {
  const [status, setStatus] = useState<ExplanationStatus>('idle')
  const [data, setData] = useState<CachedExplanation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const runFetch = useCallback(
    async (forceRefresh: boolean) => {
      if (!question || !selectedAnswer || !enabled) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (!forceRefresh) {
        const cached = loadCachedExplanation(question)
        if (cached && cached.selectedAnswer === selectedAnswer) {
          setData(cached)
          setStatus('cached')
          setError(null)
          return
        }
        if (cached && cached.selectedAnswer !== selectedAnswer) {
          clearCachedExplanation(question)
        }
      } else {
        clearCachedExplanation(question)
        setData(null)
      }

      setStatus('loading')
      setError(null)

      try {
        const result = await fetchExplanation(question, selectedAnswer, controller.signal)
        if (controller.signal.aborted) return

        const saved = saveCachedExplanation(question, selectedAnswer, result)
        setData(saved)
        setStatus('success')
      } catch (e) {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Không tải được giải thích')
        setStatus('error')
      }
    },
    [question, selectedAnswer, enabled],
  )

  useEffect(() => {
    if (!enabled || !question || !selectedAnswer) {
      setStatus('idle')
      setData(null)
      setError(null)
      abortRef.current?.abort()
      return
    }

    runFetch(false)

    return () => {
      abortRef.current?.abort()
    }
  }, [enabled, question, selectedAnswer, runFetch])

  const retry = useCallback(() => {
    runFetch(true)
  }, [runFetch])

  return {
    status,
    data,
    error,
    retry,
    fromCache: status === 'cached',
  }
}
