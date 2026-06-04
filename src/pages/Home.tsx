import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="home">
      <div className="home-icon">✚</div>
      <h1>Bộ câu hỏi trắc nghiệm<br />Tai Mũi Họng</h1>
      <p>
        Ôn tập toàn bộ câu hỏi trắc nghiệm dành cho bác sĩ chuyên khoa
        Tai Mũi Họng. Hơn 600 câu hỏi từ 18 chuyên mục khác nhau.
      </p>
      <div className="home-actions">
        <Link to="/sections" className="btn btn-primary">
          Chọn chuyên mục →
        </Link>
      </div>
    </div>
  )
}
