import { Link, useLocation } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">✚</span>
          <span className="logo-text">Trắc nghiệm TMH</span>
        </Link>
        {!isHome && (
          <Link to="/sections" className="nav-link">
            ← Danh sách chuyên mục
          </Link>
        )}
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
