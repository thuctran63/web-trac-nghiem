import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { getQuestionsBySection, getSections, currentSet } from '../data'

export function Results() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as { correctCount: number; total: number; sectionName: string } | null

  const sectionInfo = getSections().find((s) => s.slug === slug)
  const questions =
    slug === 'tat-ca'
      ? currentSet.questions
      : sectionInfo
        ? getQuestionsBySection(sectionInfo.name)
        : []

  const storageKey = `quiz-${slug}`
  const { reset } = useQuiz(questions, storageKey)

  const correct = state?.correctCount ?? 0
  const total = state?.total ?? 0
  const sectionName = state?.sectionName ?? (slug === 'tat-ca' ? 'Tất cả chuyên mục' : sectionInfo?.name ?? '')
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const wrong = total - correct

  const handleRetry = () => {
    reset()
    navigate(`/quiz/${slug}`)
  }

  const handleBack = () => {
    reset()
    navigate('/sections')
  }

  let verdict = ''
  if (pct >= 80) verdict = 'Xuất sắc'
  else if (pct >= 60) verdict = 'Khá tốt'
  else if (pct >= 40) verdict = 'Cần ôn thêm'
  else verdict = 'Cần ôn lại kỹ'

  return (
    <div className="results-page">
      <div className="results-card">
        <div className="results-score">{pct}%</div>
        <div className="results-sub">
          {verdict} &middot; {sectionName}
        </div>

        <div className="results-bar">
          <div className="results-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="results-detail">
          <div className="results-stat good">
            <div className="num">{correct}</div>
            <div className="label">Đúng</div>
          </div>
          <div className="results-stat bad">
            <div className="num">{wrong}</div>
            <div className="label">Sai</div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary" onClick={handleRetry}>
            Làm lại
          </button>
          <button className="btn btn-secondary" onClick={handleBack}>
            Chọn chuyên mục khác
          </button>
        </div>
      </div>
    </div>
  )
}
