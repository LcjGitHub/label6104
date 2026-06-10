import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { theme, toggleTheme } = useTheme()

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
              to="/progress"
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
              }
            >
              阅读进度
            </NavLink>
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
              }
            >
              我的收藏
            </NavLink>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="切换主题">
              <span className="theme-toggle__icon">{theme === 'light' ? '☀' : '☾'}</span>
              <span>{theme === 'light' ? '日间模式' : '夜间模式'}</span>
            </button>
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
