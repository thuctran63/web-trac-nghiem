import { useNavigate } from 'react-router-dom'
import { getSections, currentSet } from '../data'

const sections = getSections()

export function Sections() {
  const navigate = useNavigate()

  const total = currentSet.questions.length

  return (
    <div className="sections-page">
      <header className="page-header">
        <h2>Chọn chuyên mục</h2>
        <p className="sub">
          {currentSet.name} · {total} câu hỏi · {sections.length} chuyên mục
        </p>
      </header>
      <div className="sections-grid">
        <button
          type="button"
          className="section-card section-card-featured"
          onClick={() => navigate('/quiz/tat-ca')}
        >
          <span className="section-card-icon" aria-hidden="true">★</span>
          <span className="section-card-body">
            <span className="name">Tất cả chuyên mục</span>
            <span className="count">Luyện tập toàn bộ · {total} câu</span>
          </span>
          <span className="section-card-arrow" aria-hidden="true">→</span>
        </button>
        {sections.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            className="section-card"
            onClick={() => navigate(`/quiz/${s.slug}`)}
          >
            <span className="section-card-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="section-card-body">
              <span className="name">{s.name}</span>
              <span className="count">{s.count} câu hỏi</span>
            </span>
            <span className="section-card-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
