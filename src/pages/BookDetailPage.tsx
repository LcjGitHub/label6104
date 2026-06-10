import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FootnoteList from '../components/FootnoteList'
import ProgressBar from '../components/ProgressBar'
import SearchBar from '../components/SearchBar'
import TagFilter from '../components/TagFilter'
import TagCloud from '../components/TagCloud'
import ExportButton from '../components/ExportButton'
import {
  getBookById,
  getFootnotesByBookId,
  getBookmarks,
  toggleBookmark,
  getReadFootnoteIds,
  markFootnoteAsRead,
  calculateProgressPercentage,
  addUserTag,
  removeUserTag,
  isDefaultTag,
} from '../data/mockData'

type SortOrder = 'asc' | 'desc'

function readBookmarkedIds(): Set<string> {
  return new Set(getBookmarks().map((b) => b.footnoteId))
}

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const book = bookId ? getBookById(bookId) : undefined
  const [tagRefreshKey, setTagRefreshKey] = useState(0)
  const allFootnotes = useMemo(
    () => (bookId ? getFootnotesByBookId(bookId) : []),
    [bookId, tagRefreshKey],
  )

  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
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
    setSelectedTags(new Set())
    setTagRefreshKey((k) => k + 1)
    processedRef.current = new Set()
  }, [bookId])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const fn of allFootnotes) {
      for (const tag of fn.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [allFootnotes])

  const filteredFootnotes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let result = allFootnotes

    if (normalized) {
      result = result.filter(
        (fn) =>
          fn.originalText.toLowerCase().includes(normalized) ||
          fn.annotation.toLowerCase().includes(normalized) ||
          String(fn.number).includes(normalized) ||
          String(fn.page).includes(normalized) ||
          fn.tags.some((t) => t.toLowerCase().includes(normalized)),
      )
    }

    if (selectedTags.size > 0) {
      result = result.filter((fn) =>
        Array.from(selectedTags).some((tag) => fn.tags.includes(tag)),
      )
    }

    return [...result].sort((a, b) =>
      sortOrder === 'asc' ? a.page - b.page : b.page - a.page,
    )
  }, [allFootnotes, query, sortOrder, selectedTags])

  const refreshBookmarks = useCallback(() => {
    setBookmarkedIds(readBookmarkedIds())
  }, [])

  const refreshProgress = useCallback(() => {
    if (!bookId) return
    setReadFootnoteIds(getReadFootnoteIds(bookId))
    setProgressPercentage(calculateProgressPercentage(bookId))
  }, [bookId])

  const refreshTags = useCallback(() => {
    setTagRefreshKey((k) => k + 1)
  }, [])

  const handleToggleBookmark = useCallback(
    (footnoteId: string) => {
      if (!bookId) return
      toggleBookmark(footnoteId, bookId)
      refreshBookmarks()
    },
    [bookId, refreshBookmarks],
  )

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }, [])

  const handleClearTags = useCallback(() => {
    setSelectedTags(new Set())
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    handleToggleTag(tag)
  }, [handleToggleTag])

  const handleAddTag = useCallback(
    (footnoteId: string, tag: string) => {
      addUserTag(footnoteId, tag)
      refreshTags()
    },
    [refreshTags],
  )

  const handleRemoveTag = useCallback(
    (footnoteId: string, tag: string) => {
      removeUserTag(footnoteId, tag)
      refreshTags()
    },
    [refreshTags],
  )

  const handleIsTagRemovable = useCallback(
    (footnoteId: string, tag: string) => {
      return !isDefaultTag(footnoteId, tag)
    },
    [],
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

      <TagCloud
        footnotes={allFootnotes}
        onTagClick={handleTagClick}
        selectedTags={selectedTags}
      />

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
          {book && (
            <ExportButton
              book={book}
              filteredFootnotes={filteredFootnotes}
              allFootnotes={allFootnotes}
              isFilterActive={!!query.trim() || selectedTags.size > 0}
            />
          )}
        </div>
      </div>

      <TagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClearAll={handleClearTags}
      />

      <p className="result-summary" aria-live="polite">
        {query.trim() || selectedTags.size > 0
          ? `找到 ${filteredFootnotes.length} 条匹配`
          : `显示全部 ${filteredFootnotes.length} 条`}
        {query.trim() ? ` · 关键字「${query.trim()}」` : ''}
        {selectedTags.size > 0
          ? ` · 标签「${Array.from(selectedTags).join('、')}」（满足任一）`
          : ''}
        {sortOrder === 'asc' ? ' · 按页码升序' : ' · 按页码降序'}
      </p>

      <FootnoteList
        footnotes={filteredFootnotes}
        noteType={book.noteType}
        bookmarkedIds={bookmarkedIds}
        readFootnoteIds={readFootnoteIds}
        onToggleBookmark={handleToggleBookmark}
        onTagClick={handleTagClick}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        isTagRemovable={handleIsTagRemovable}
      />
    </div>
  )
}
