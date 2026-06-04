import { Link, useLocation } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app">
      <div className="app-bg" aria-hidden="true" />
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="logo-text">
            <span className="logo-title">Trắc nghiệm TMH</span>
            <span className="logo-tagline">Tai · Mũi · Họng</span>
          </span>
        </Link>
        {!isHome && (
          <Link to="/sections" className="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Chuyên mục
          </Link>
        )}
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span>Ôn tập trắc nghiệm chuyên khoa TMH</span>
      </footer>
    </div>
  )
}
