import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSections, currentSet } from '../data'
import { listInProgressQuizzes } from '../utils/quiz'

const sections = getSections()
const ALL_SLUG = 'tat-ca'
const LARGE_QUIZ_THRESHOLD = 100

export function Sections() {
  const navigate = useNavigate()

  const total = currentSet.questions.length

  const slugTotals = useMemo(
    () => [
      { slug: ALL_SLUG, total },
      ...sections.map((s) => ({ slug: s.slug, total: s.count })),
    ],
    [total],
  )

  const inProgress = useMemo(() => listInProgressQuizzes(slugTotals), [slugTotals])

  const sectionLabel = (slug: string) => {
    if (slug === ALL_SLUG) return 'Tất cả chuyên mục'
    return sections.find((s) => s.slug === slug)?.name ?? slug
  }

  const startQuiz = (slug: string, questionCount: number) => {
    if (slug === ALL_SLUG && questionCount >= LARGE_QUIZ_THRESHOLD) {
      const ok = window.confirm(
        `Bạn sắp làm ${questionCount} câu hỏi. Tiến độ sẽ được lưu tự động.\n\nBắt đầu ôn tập toàn bộ?`,
      )
      if (!ok) return
    }
    navigate(`/quiz/${slug}`)
  }

  return (
    <div className="sections-page">
      <header className="page-header">
        <h2>Chọn chuyên mục</h2>
        <p className="sub">
          {currentSet.name} · {total} câu hỏi · {sections.length} chuyên mục
        </p>
      </header>

      {inProgress.length > 0 && (
        <aside className="resume-panel" aria-label="Bài đang làm dở">
          <h3 className="resume-panel-title">Tiếp tục ôn tập</h3>
          <ul className="resume-list">
            {inProgress.map((p) => (
              <li key={p.slug}>
                <button
                  type="button"
                  className="resume-item"
                  onClick={() => navigate(`/quiz/${p.slug}`)}
                >
                  <span className="resume-item-name">{sectionLabel(p.slug)}</span>
                  <span className="resume-item-progress">
                    {p.answered}/{p.total} câu · đang ở câu {p.currentIndex + 1}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="sections-grid">
        <button
          type="button"
          className="section-card section-card-featured"
          onClick={() => startQuiz(ALL_SLUG, total)}
        >
          <span className="section-card-icon" aria-hidden="true">
            ★
          </span>
          <span className="section-card-body">
            <span className="name">Tất cả chuyên mục</span>
            <span className="count">Luyện tập toàn bộ · {total} câu</span>
          </span>
          <span className="section-card-arrow" aria-hidden="true">
            →
          </span>
        </button>
        {sections.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            className="section-card"
            onClick={() => startQuiz(s.slug, s.count)}
          >
            <span className="section-card-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="section-card-body">
              <span className="name">{s.name}</span>
              <span className="count">{s.count} câu hỏi</span>
            </span>
            <span className="section-card-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
