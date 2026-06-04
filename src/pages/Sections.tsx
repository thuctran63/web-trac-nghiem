import { useNavigate } from 'react-router-dom'
import { getSections, currentSet } from '../data'

const sections = getSections()

export function Sections() {
  const navigate = useNavigate()

  const total = currentSet.questions.length

  return (
    <div className="sections-page">
      <h2>Chọn chuyên mục</h2>
      <p className="sub">
        {currentSet.name} &middot; {total} câu hỏi
      </p>
      <div className="sections-grid">
        <button className="section-card" onClick={() => navigate('/quiz/tat-ca')}>
          <span className="name">📋 Tất cả chuyên mục</span>
          <span className="count">{total} câu hỏi</span>
        </button>
        {sections.map((s) => (
          <button
            key={s.slug}
            className="section-card"
            onClick={() => navigate(`/quiz/${s.slug}`)}
          >
            <span className="name">{s.name}</span>
            <span className="count">{s.count} câu hỏi</span>
          </button>
        ))}
      </div>
    </div>
  )
}
