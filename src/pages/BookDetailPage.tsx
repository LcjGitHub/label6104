import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FootnoteList from '../components/FootnoteList'
import ProgressBar from '../components/ProgressBar'
import SearchBar from '../components/SearchBar'
import {
  getBookById,
  getFootnotesByBookId,
  getBookmarks,
  toggleBookmark,
  getReadFootnoteIds,
  markFootnoteAsRead,
  calculateProgressPercentage,
} from '../data/mockData'

type SortOrder = 'asc' | 'desc'

function readBookmarkedIds(): Set<string> {
  return new Set(getBookmarks().map((b) => b.footnoteId))
}

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const book = bookId ? getBookById(bookId) : undefined
  const allFootnotes = bookId ? getFootnotesByBookId(bookId) : []

  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => readBookmarkedIds())
  const [readFootnoteIds, setReadFootnoteIds] = useState<Set<string>>(() =>
    bookId ? getReadFootnoteIds(bookId) : new Set(),
  )
  const [progressPercentage, setProgressPercentage] = useState<number>(() =>
    bookId ? calculateProgressPercentage(bookId) : 0,
  )

  const observerRef = useRef<IntersectionObserver | null>(null)
  const processedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!bookId) return
    setReadFootnoteIds(getReadFootnoteIds(bookId))
    setProgressPercentage(calculateProgressPercentage(bookId))
    setQuery('')
    setSortOrder('asc')
    processedRef.current = new Set()
  }, [bookId])

  const filteredFootnotes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let result = allFootnotes

    if (normalized) {
      result = result.filter(
        (fn) =>
          fn.originalText.toLowerCase().includes(normalized) ||
          fn.annotation.toLowerCase().includes(normalized) ||
          String(fn.number).includes(normalized) ||
          String(fn.page).includes(normalized),
      )
    }

    return [...result].sort((a, b) =>
      sortOrder === 'asc' ? a.page - b.page : b.page - a.page,
    )
  }, [allFootnotes, query, sortOrder])

  const refreshBookmarks = useCallback(() => {
    setBookmarkedIds(readBookmarkedIds())
  }, [])

  const refreshProgress = useCallback(() => {
    if (!bookId) return
    setReadFootnoteIds(getReadFootnoteIds(bookId))
    setProgressPercentage(calculateProgressPercentage(bookId))
  }, [bookId])

  const handleToggleBookmark = useCallback(
    (footnoteId: string) => {
      if (!bookId) return
      toggleBookmark(footnoteId, bookId)
      refreshBookmarks()
    },
    [bookId, refreshBookmarks],
  )

  const handleMarkAsRead = useCallback(
    (footnoteId: string) => {
      if (!bookId) return
      if (processedRef.current.has(footnoteId)) return
      processedRef.current.add(footnoteId)
      markFootnoteAsRead(bookId, footnoteId)
      refreshProgress()
    },
    [bookId, refreshProgress],
  )

  useEffect(() => {
    if (!bookId) return

    processedRef.current = new Set(readFootnoteIds)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const footnoteId = entry.target.getAttribute('data-footnote-id')
            if (footnoteId) {
              handleMarkAsRead(footnoteId)
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0.1,
      },
    )

    const elements = document.querySelectorAll<HTMLElement>('[data-footnote-id]')
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [bookId, filteredFootnotes, handleMarkAsRead, readFootnoteIds])

  if (!book) {
    return (
      <div className="page">
        <p className="empty-state">未找到该书目。</p>
        <Link to="/" className="text-link">
          ← 返回书目列表
        </Link>
      </div>
    )
  }

  return (
    <div className="page detail-page">
      <nav className="breadcrumb">
        <Link to="/">书目典藏</Link>
        <span aria-hidden="true"> / </span>
        <span>{book.title}</span>
      </nav>

      <header className="book-header">
        <span className="book-header__type">
          {book.noteType === 'footnote' ? '脚注本' : '尾注本'}
        </span>
        <h1>{book.title}</h1>
        <p className="book-header__author">{book.author}</p>
        <p className="book-header__meta">
          {book.publisher} · {book.year} · 共 {allFootnotes.length} 条
        </p>
        <div className="book-header__progress">
          <ProgressBar
            percentage={progressPercentage}
            readCount={readFootnoteIds.size}
            totalCount={allFootnotes.length}
            size="md"
          />
        </div>
      </header>

      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <div className="toolbar__actions">
          <label className="sort-control">
            <span>页码排序</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              aria-label="按页码排序"
            >
              <option value="asc">升序（小 → 大）</option>
              <option value="desc">降序（大 → 小）</option>
            </select>
          </label>
        </div>
      </div>

      <p className="result-summary" aria-live="polite">
        {query.trim()
          ? `找到 ${filteredFootnotes.length} 条匹配「${query.trim()}」`
          : `显示全部 ${filteredFootnotes.length} 条`}
        {sortOrder === 'asc' ? ' · 按页码升序' : ' · 按页码降序'}
      </p>

      <FootnoteList
        footnotes={filteredFootnotes}
        noteType={book.noteType}
        bookmarkedIds={bookmarkedIds}
        readFootnoteIds={readFootnoteIds}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  )
}
