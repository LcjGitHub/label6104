import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FootnoteList from '../components/FootnoteList'
import SearchBar from '../components/SearchBar'
import TagFilter from '../components/TagFilter'
import {
  getBookById,
  getBookmarkedFootnotes,
  getBookmarks,
  toggleBookmark,
  addUserTag,
  removeUserTag,
  isDefaultTag,
} from '../data/mockData'

type SortOrder = 'newest' | 'oldest' | 'page'

function readBookmarkedIds(): Set<string> {
  return new Set(getBookmarks().map((b) => b.footnoteId))
}

export default function BookmarksPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => readBookmarkedIds())
  const [refreshKey, setRefreshKey] = useState(0)

  const bookmarkedItems = useMemo(() => getBookmarkedFootnotes(), [refreshKey])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const item of bookmarkedItems) {
      for (const tag of item.footnote.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [bookmarkedItems])

  const refreshBookmarks = useCallback(() => {
    setBookmarkedIds(readBookmarkedIds())
    setRefreshKey((k) => k + 1)
  }, [])

  const refreshTags = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let result = bookmarkedItems

    if (normalized) {
      result = result.filter(
        ({ footnote, book }) =>
          footnote.originalText.toLowerCase().includes(normalized) ||
          footnote.annotation.toLowerCase().includes(normalized) ||
          String(footnote.number).includes(normalized) ||
          String(footnote.page).includes(normalized) ||
          book.title.toLowerCase().includes(normalized) ||
          footnote.tags.some((t) => t.toLowerCase().includes(normalized)),
      )
    }

    if (selectedTags.size > 0) {
      result = result.filter(({ footnote }) =>
        Array.from(selectedTags).some((tag) => footnote.tags.includes(tag)),
      )
    }

    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.bookmark.createdAt - a.bookmark.createdAt
        case 'oldest':
          return a.bookmark.createdAt - b.bookmark.createdAt
        case 'page':
          return a.footnote.page - b.footnote.page
        default:
          return 0
      }
    })
  }, [bookmarkedItems, query, sortOrder, selectedTags])

  const handleToggleBookmark = useCallback(
    (footnoteId: string) => {
      const item = bookmarkedItems.find((x) => x.footnote.id === footnoteId)
      if (!item) return
      toggleBookmark(footnoteId, item.book.id)
      refreshBookmarks()
    },
    [bookmarkedItems, refreshBookmarks],
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

  const getBookTitle = useCallback((bookId: string) => {
    const book = getBookById(bookId)
    return book?.title ?? '未知书籍'
  }, [])

  const getBookNoteType = useCallback((bookId: string) => {
    const book = getBookById(bookId)
    return book?.noteType
  }, [])

  const handleBookClick = useCallback(
    (bookId: string) => {
      navigate(`/book/${bookId}`)
    },
    [navigate],
  )

  return (
    <div className="page bookmarks-page">
      <nav className="breadcrumb">
        <Link to="/">书目典藏</Link>
        <span aria-hidden="true"> / </span>
        <span>我的收藏</span>
      </nav>

      <header className="bookmarks-header">
        <h1>我的书签收藏</h1>
        <p className="bookmarks-header__count">
          已收藏 <strong>{bookmarkedItems.length}</strong> 条注释
        </p>
      </header>

      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} placeholder="搜索收藏内容、书名或标签..." />
        <div className="toolbar__actions">
          <label className="sort-control">
            <span>排序方式</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              aria-label="排序方式"
            >
              <option value="newest">最新收藏</option>
              <option value="oldest">最早收藏</option>
              <option value="page">按页码排序</option>
            </select>
          </label>
        </div>
      </div>

      {bookmarkedItems.length === 0 ? (
        <div className="bookmarks-empty">
          <div className="bookmarks-empty__icon">☆</div>
          <p>还没有收藏任何注释。</p>
          <p className="bookmarks-empty__hint">
            浏览书籍详情页，点击注释条目右上角的 ☆ 按钮即可收藏。
          </p>
          <Link to="/" className="text-link">
            → 去书库看看
          </Link>
        </div>
      ) : (
        <>
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onClearAll={handleClearTags}
          />

          <p className="result-summary" aria-live="polite">
            {query.trim() || selectedTags.size > 0
              ? `找到 ${filteredItems.length} 条匹配`
              : `显示全部 ${filteredItems.length} 条收藏`}
            {query.trim() ? ` · 关键字「${query.trim()}」` : ''}
            {selectedTags.size > 0
              ? ` · 标签「${Array.from(selectedTags).join('、')}」（满足任一）`
              : ''}
          </p>

          <FootnoteList
            footnotes={filteredItems.map((item) => item.footnote)}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onTagClick={handleTagClick}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            isTagRemovable={handleIsTagRemovable}
            showBookLink
            getBookTitle={getBookTitle}
            getBookNoteType={getBookNoteType}
            onBookClick={handleBookClick}
          />
        </>
      )}
    </div>
  )
}
