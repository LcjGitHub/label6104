import { Outlet, Link, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-logo">
            <span className="site-logo__mark">†</span>
            <div>
              <span className="site-logo__title">脚注索引</span>
              <span className="site-logo__subtitle">Footnote &amp; Endnote Archive</span>
            </div>
          </Link>
          <nav className="site-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
              }
            >
              书目典藏
            </NavLink>
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
              }
            >
              我的收藏
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Mock 数据仅供演示 · 文库风格脚注检索小站</p>
      </footer>
    </div>
  )
}
