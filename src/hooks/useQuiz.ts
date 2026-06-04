import { useState, useCallback, useEffect } from 'react'
import type { Question } from '../data'

interface QuizState {
  currentIndex: number
  answers: Record<string, string>
  showResult: boolean
  finished: boolean
}

function loadState(key: string): QuizState | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveState(key: string, state: QuizState) {
  localStorage.setItem(key, JSON.stringify(state))
}

export function useQuiz(questions: Question[], storageKey: string) {
  const saved = loadState(storageKey)
  const [state, setState] = useState<QuizState>(
    saved ?? {
      currentIndex: 0,
      answers: {},
      showResult: false,
      finished: false,
    },
  )

  useEffect(() => {
    saveState(storageKey, state)
  }, [state, storageKey])

  const current = questions[state.currentIndex]
  const total = questions.length
  const correctCount = questions.filter(
    (q) => state.answers[`${q.section}-${q.questionNumber}`] === q.correctAnswer,
  ).length

  const selectAnswer = useCallback(
    (answer: string) => {
      if (state.showResult) return
      const key = `${current!.section}-${current!.questionNumber}`
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
      return { ...prev, currentIndex: prev.currentIndex + 1, showResult: false }
    })
  }, [total])

  const reset = useCallback(() => {
    setState({ currentIndex: 0, answers: {}, showResult: false, finished: false })
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return {
    current,
    currentIndex: state.currentIndex,
    total,
    answers: state.answers,
    correctCount,
    showResult: state.showResult,
    finished: state.finished,
    selectAnswer,
    nextQuestion,
    reset,
  }
}
