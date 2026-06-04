import { Link } from 'react-router-dom'
import { getSections, currentSet } from '../data'

const sectionCount = getSections().length
const questionCount = currentSet.questions.length

export function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <span className="home-badge">Bác sĩ chuyên khoa</span>
        <div className="home-icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h1>
          Bộ câu hỏi trắc nghiệm
          <span className="home-title-accent">Tai Mũi Họng</span>
        </h1>
        <p>
          Ôn tập toàn bộ ngân hàng câu hỏi dành cho bác sĩ chuyên khoa TMH — làm
          theo từng chuyên mục hoặc luyện tập toàn bộ.
        </p>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">{questionCount}+</span>
            <span className="home-stat-label">câu hỏi</span>
          </div>
          <div className="home-stat-divider" aria-hidden="true" />
          <div className="home-stat">
            <span className="home-stat-num">{sectionCount}</span>
            <span className="home-stat-label">chuyên mục</span>
          </div>
        </div>
        <div className="home-actions">
          <Link to="/sections" className="btn btn-primary">
            Bắt đầu ôn tập
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
