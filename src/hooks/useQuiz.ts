import { useState, useCallback, useEffect } from 'react'
import type { Question } from '../data'
import {
  type QuizState,
  questionKey,
  countCorrect,
  loadQuizState,
  saveQuizState,
  clearQuizState,
} from '../utils/quiz'

function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(0, index), total - 1)
}

export function useQuiz(questions: Question[], storageKey: string) {
  const [state, setState] = useState<QuizState>(() => {
    const saved = loadQuizState(storageKey)
    const total = questions.length
    if (!saved) {
      return { currentIndex: 0, answers: {}, showResult: false, finished: false }
    }
    return {
      ...saved,
      currentIndex: clampIndex(saved.currentIndex, total),
      finished: saved.finished && total > 0,
    }
  })

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: clampIndex(prev.currentIndex, questions.length),
    }))
  }, [questions.length])

  useEffect(() => {
    saveQuizState(storageKey, state)
  }, [state, storageKey])

  const safeIndex = clampIndex(state.currentIndex, questions.length)
  const current = questions[safeIndex]
  const total = questions.length
  const correctCount = countCorrect(questions, state.answers)
  const answeredCount = Object.keys(state.answers).length

  const selectAnswer = useCallback(
    (answer: string) => {
      if (!current || state.showResult) return
      const key = questionKey(current)
      setState((prev) => ({
        ...prev,
        answers: { ...prev.answers, [key]: answer },
        showResult: true,
      }))
    },
    [current, state.showResult],
  )

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex >= total - 1) {
        return { ...prev, finished: true }
      }
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showResult: false,
      }
    })
  }, [total])

  const reset = useCallback(() => {
    setState({ currentIndex: 0, answers: {}, showResult: false, finished: false })
    clearQuizState(storageKey)
  }, [storageKey])

  return {
    current,
    currentIndex: safeIndex,
    total,
    answers: state.answers,
    answeredCount,
    correctCount,
    showResult: state.showResult,
    finished: state.finished,
    selectAnswer,
    nextQuestion,
    reset,
  }
}
