import { useParams, useNavigate } from 'react-router-dom'
import { getSections, getQuestionsBySection, currentSet } from '../data'
import { useQuiz } from '../hooks/useQuiz'
import { OptionButton } from '../components/OptionButton'
import { ProgressBar } from '../components/ProgressBar'

export function Quiz() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const sectionInfo = getSections().find((s) => s.slug === slug)
  const questions =
    slug === 'tat-ca'
      ? currentSet.questions
      : sectionInfo
        ? getQuestionsBySection(sectionInfo.name)
        : []

  const sectionName =
    slug === 'tat-ca'
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
    reset,
  } = useQuiz(questions, storageKey)

  if (finished) {
    navigate(`/results/${slug}`, { state: { correctCount, total, sectionName } })
    return null
  }

  if (!current || total === 0) {
    return (
      <div className="quiz-page">
        <p>Không tìm thấy câu hỏi cho chuyên mục này.</p>
      </div>
    )
  }

  const answeredKey = `${current.section}-${current.questionNumber}`
  const selectedAnswer = answers[answeredKey]

  const isTrueFalse = current.type === 'true_false'
  const optionKeys = isTrueFalse ? ['A', 'B'] : Object.keys(current.options)

  return (
    <div className="quiz-page">
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
            const text = isTrueFalse
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
      </div>

      {showResult && (
        <div className="next-wrap">
          <button className="btn-next" onClick={nextQuestion}>
            {currentIndex >= total - 1 ? 'Xem kết quả →' : 'Câu tiếp theo →'}
          </button>
        </div>
      )}
    </div>
  )
}
