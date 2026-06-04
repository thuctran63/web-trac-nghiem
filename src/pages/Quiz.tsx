import { useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getSections, getQuestionsBySection, currentSet } from '../data'
import { useQuiz } from '../hooks/useQuiz'
import { OptionButton } from '../components/OptionButton'
import { ProgressBar } from '../components/ProgressBar'
import { ExplanationPanel } from '../components/ExplanationPanel'
import { useExplanation } from '../hooks/useExplanation'
import { getOptionKeys } from '../utils/quiz'

const ALL_SLUG = 'tat-ca'
const LARGE_QUIZ_THRESHOLD = 100

export function Quiz() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  const sectionInfo = getSections().find((s) => s.slug === slug)
  const isAllSections = slug === ALL_SLUG
  const isValidSlug = isAllSections || sectionInfo != null

  const questions = isAllSections
    ? currentSet.questions
    : sectionInfo
      ? getQuestionsBySection(sectionInfo.name)
      : []

  const sectionName = isAllSections
    ? 'Tất cả chuyên mục'
    : sectionInfo?.name ?? 'Không tìm thấy'

  const storageKey = `quiz-${slug}`
  const {
    current,
    currentIndex,
    total,
    answers,
    correctCount,
    showResult,
    finished,
    selectAnswer,
    nextQuestion,
  } = useQuiz(questions, storageKey)

  const selectedAnswer = current
    ? answers[`${current.section}-${current.questionNumber}`]
    : undefined

  const explanation = useExplanation(current, selectedAnswer, showResult)

  const goToResults = useCallback(() => {
    navigate(`/results/${slug}`, {
      state: { correctCount, total, sectionName },
      replace: true,
    })
  }, [navigate, slug, correctCount, total, sectionName])

  useEffect(() => {
    if (finished) goToResults()
  }, [finished, goToResults])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex])

  useEffect(() => {
    if (!showResult || explanation.status === 'loading') return
    nextBtnRef.current?.focus({ preventScroll: true })
  }, [showResult, currentIndex, explanation.status])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (showResult && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        nextQuestion()
        return
      }

      if (showResult || !current) return

      const key = e.key.toUpperCase()
      const optionKeys = getOptionKeys(current)
      if (optionKeys.includes(key)) {
        e.preventDefault()
        selectAnswer(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showResult, current, nextQuestion, selectAnswer])

  if (finished) return null

  if (!isValidSlug || total === 0) {
    return (
      <div className="quiz-page">
        <div className="empty-state">
          <h2>Không tìm thấy chuyên mục</h2>
          <p>Đường dẫn không hợp lệ hoặc chuyên mục không có câu hỏi.</p>
          <Link to="/sections" className="btn btn-primary">
            Về danh sách chuyên mục
          </Link>
        </div>
      </div>
    )
  }

  if (!current) return null

  const answeredKey = `${current.section}-${current.questionNumber}`
  const optionKeys = getOptionKeys(current)
  const isUserCorrect = selectedAnswer === current.correctAnswer

  return (
    <div className="quiz-page">
      {isAllSections && total >= LARGE_QUIZ_THRESHOLD && (
        <p className="quiz-hint" role="status">
          Bộ đề lớn ({total} câu) — tiến độ được lưu tự động, bạn có thể thoát và quay lại sau.
        </p>
      )}

      <div className="quiz-header">
        <span className="section-name">{sectionName}</span>
        <ProgressBar current={currentIndex} total={total} />
      </div>

      <div className="question-card" key={answeredKey + currentIndex}>
        <div className="question-number">
          Câu hỏi {current.questionNumber}
          {current.section !== sectionName && (
            <span className="question-section-tag"> · {current.section}</span>
          )}
        </div>

        <div className="question-text">{current.question}</div>

        <div className="options-list">
          {optionKeys.map((key) => {
            const text =
              current.type === 'true_false'
                ? key === 'A'
                  ? 'Đúng'
                  : 'Sai'
                : current.options[key]

            const isSelected = selectedAnswer === key
            const isCorrect = key === current.correctAnswer

            return (
              <OptionButton
                key={key}
                label={key}
                text={text}
                selected={isSelected}
                correct={isCorrect}
                wrong={isSelected && !isCorrect}
                disabled={showResult}
                onSelect={() => selectAnswer(key)}
              />
            )
          })}
        </div>

        {!showResult && (
          <p className="quiz-keyboard-hint">
            Phím {optionKeys.join(', ')} để chọn đáp án
          </p>
        )}
      </div>

      {showResult && selectedAnswer && (
        <ExplanationPanel
          status={explanation.status}
          data={explanation.data}
          error={explanation.error}
          fromCache={explanation.fromCache}
          isUserCorrect={isUserCorrect}
          onRetry={explanation.retry}
        />
      )}

      {showResult && (
        <div className="next-wrap">
          <button
            ref={nextBtnRef}
            type="button"
            className="btn-next"
            onClick={nextQuestion}
          >
            {currentIndex >= total - 1 ? 'Xem kết quả →' : 'Câu tiếp theo →'}
          </button>
          <p className="quiz-keyboard-hint quiz-keyboard-hint--next">Enter để tiếp tục</p>
        </div>
      )}
    </div>
  )
}
