import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import type { BookProgressSummary } from '../types'
import {
  getAllProgressSummaries,
  getOverallStats,
  resetReadingProgress,
} from '../data/mockData'

function formatDate(timestamp: number): string {
  if (!timestamp) return '未开始'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function ProgressOverview() {
  const [summaries, setSummaries] = useState<BookProgressSummary[]>([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksStarted: 0,
    booksCompleted: 0,
    totalFootnotes: 0,
    footnotesRead: 0,
    overallPercentage: 0,
  })

  const refreshData = useCallback(() => {
    setSummaries(getAllProgressSummaries())
    setStats(getOverallStats())
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleReset = useCallback(
    (bookId: string, title: string) => {
      if (window.confirm(`确定要重置《${title}》的阅读进度吗？此操作不可撤销。`)) {
        resetReadingProgress(bookId)
        refreshData()
      }
    },
    [refreshData],
  )

  const hasAnyProgress = summaries.some((s) => s.readCount > 0)

  return (
    <div className="page progress-overview">
      <section className="page-hero">
        <h1>阅读进度</h1>
        <p className="page-hero__lead">
          追踪你在每本书中的阅读进度。滚动浏览注释条目时，系统会自动标记为已读。
        </p>
        <div className="progress-overview__stats">
          <div className="progress-overview__stat">
            <span className="progress-overview__stat-value">{stats.overallPercentage}%</span>
            <span className="progress-overview__stat-label">总体进度</span>
          </div>
          <div className="progress-overview__stat">
            <span className="progress-overview__stat-value">{stats.footnotesRead}</span>
            <span className="progress-overview__stat-label">已读注释</span>
          </div>
          <div className="progress-overview__stat">
            <span className="progress-overview__stat-value">{stats.booksStarted}</span>
            <span className="progress-overview__stat-label">在读书籍</span>
          </div>
          <div className="progress-overview__stat">
            <span className="progress-overview__stat-value">{stats.booksCompleted}</span>
            <span className="progress-overview__stat-label">已完成</span>
          </div>
        </div>
      </section>

      {!hasAnyProgress ? (
        <div className="progress-empty">
          <div className="progress-empty__icon">📖</div>
          <p>还没有任何阅读进度记录</p>
          <p className="bookmarks-empty__hint">
            进入任意书籍详情页，滚动浏览注释即可自动记录阅读进度
          </p>
          <Link to="/" className="progress-book-card__link">
            浏览书目
          </Link>
        </div>
      ) : (
        <section className="progress-book-list" aria-label="各书籍阅读进度">
          {summaries.map((summary) => (
            <article key={summary.bookId} className="progress-book-card">
              <div className="progress-book-card__header">
                <div>
                  <h3 className="progress-book-card__title">{summary.title}</h3>
                  <p className="progress-book-card__author">{summary.author}</p>
                </div>
                <div className="progress-book-card__actions">
                  <Link to={`/book/${summary.bookId}`} className="progress-book-card__link">
                    继续阅读
                  </Link>
                  {summary.readCount > 0 && (
                    <button
                      type="button"
                      className="progress-book-card__reset"
                      onClick={() => handleReset(summary.bookId, summary.title)}
                    >
                      重置进度
                    </button>
                  )}
                </div>
              </div>
              <ProgressBar
                percentage={summary.percentage}
                readCount={summary.readCount}
                totalCount={summary.totalFootnotes}
                size="md"
              />
              <div className="progress-book-card__meta">
                {summary.startedAt > 0 && (
                  <span>开始阅读：{formatDate(summary.startedAt)}</span>
                )}
                {summary.lastReadAt > 0 && (
                  <span>上次阅读：{formatDate(summary.lastReadAt)}</span>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
