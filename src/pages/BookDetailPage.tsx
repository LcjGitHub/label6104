import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FootnoteList from '../components/FootnoteList'
import ProgressBar from '../components/ProgressBar'
import SearchBar from '../components/SearchBar'
import AdvancedSearchModal, { DEFAULT_CONDITIONS } from '../components/AdvancedSearchModal'
import TagFilter from '../components/TagFilter'
import TagCloud from '../components/TagCloud'
import ExportButton from '../components/ExportButton'
import MilestoneToast from '../components/MilestoneToast'
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
  getBookmarkGroups,
  setBookmarkGroup,
  matchesTagWithAlias,
  dismissMilestone,
} from '../data/mockData'
import type { AdvancedSearchConditions, BookmarkGroup, MilestoneLevel, MilestoneMessage } from '../types'
import { useTagAlias } from '../context/TagAliasContext'
import { useReadingMilestone } from '../hooks/useReadingMilestone'

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
  const [groups, setGroups] = useState<BookmarkGroup[]>(() => getBookmarkGroups())
  const [bookmarkRefreshKey, setBookmarkRefreshKey] = useState(0)
  const [advSearchOpen, setAdvSearchOpen] = useState(false)
  const [advConditions, setAdvConditions] = useState<AdvancedSearchConditions>(DEFAULT_CONDITIONS)
  const { getDisplayName } = useTagAlias()

  const milestoneCustomMessages = useMemo<Partial<Record<MilestoneLevel, Partial<MilestoneMessage>>>>(
    () => ({
      25: {
        title: book ? `《${book.title}》初窥门径` : '初窥门径',
        content: book
          ? `恭喜！你已完成《${book.title}》四分之一的注释阅读，继续加油！`
          : '恭喜！你已完成四分之一的阅读，继续加油！',
      },
      50: {
        title: book ? `《${book.title}》渐入佳境` : '渐入佳境',
        content: book
          ? `太棒了！《${book.title}》的阅读进度已过半，坚持就是胜利！`
          : '太棒了！阅读进度已过半，坚持就是胜利！',
      },
      75: {
        title: book ? `《${book.title}》登堂入室` : '登堂入室',
        content: book
          ? `了不起！《${book.title}》只剩最后四分之一，胜利在望！`
          : '了不起！只剩最后四分之一，胜利在望！',
      },
      100: {
        title: book ? `《${book.title}》功德圆满` : '功德圆满',
        content: book
          ? `恭喜你完成了《${book.title}》全部注释的阅读！知识就是力量！`
          : '恭喜你完成了全书阅读！知识就是力量！',
      },
    }),
    [book],
  )

  const {
    activeMilestone,
    pendingLevels,
    dismiss: dismissMilestoneToast,
  } = useReadingMilestone({
    bookId,
    readCount: readFootnoteIds.size,
    totalCount: allFootnotes.length,
    customMessages: milestoneCustomMessages,
  })

  const handleDismissAllMilestones = useCallback(() => {
    if (!bookId) return
    pendingLevels.forEach((level) => {
      dismissMilestone(bookId, level)
    })
    dismissMilestoneToast()
  }, [bookId, pendingLevels, dismissMilestoneToast])

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
    setAdvConditions(DEFAULT_CONDITIONS)
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

  const footnoteGroupMap = useMemo(() => {
    const map: Record<string, string | null> = {}
    const bookmarks = getBookmarks()
    for (const bm of bookmarks) {
      map[bm.footnoteId] = bm.groupId
    }
    return map
  }, [bookmarkRefreshKey])

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
          fn.tags.some((t) => matchesTagWithAlias(t, normalized)),
      )
    }

    if (selectedTags.size > 0) {
      result = result.filter((fn) =>
        Array.from(selectedTags).some((tag) => fn.tags.includes(tag)),
      )
    }

    if (advConditions.pageRange.min !== null) {
      result = result.filter((fn) => fn.page >= advConditions.pageRange.min!)
    }
    if (advConditions.pageRange.max !== null) {
      result = result.filter((fn) => fn.page <= advConditions.pageRange.max!)
    }

    if (advConditions.tags.length > 0) {
      if (advConditions.tagMatchMode === 'all') {
        result = result.filter((fn) =>
          advConditions.tags.every((tag) => fn.tags.includes(tag)),
        )
      } else {
        result = result.filter((fn) =>
          advConditions.tags.some((tag) => fn.tags.includes(tag)),
        )
      }
    }

    if (advConditions.readStatus !== 'all') {
      if (advConditions.readStatus === 'read') {
        result = result.filter((fn) => readFootnoteIds.has(fn.id))
      } else {
        result = result.filter((fn) => !readFootnoteIds.has(fn.id))
      }
    }

    if (advConditions.favoriteStatus !== 'all') {
      if (advConditions.favoriteStatus === 'favorited') {
        result = result.filter((fn) => bookmarkedIds.has(fn.id))
      } else {
        result = result.filter((fn) => !bookmarkedIds.has(fn.id))
      }
    }

    return [...result].sort((a, b) =>
      sortOrder === 'asc' ? a.page - b.page : b.page - a.page,
    )
  }, [allFootnotes, query, sortOrder, selectedTags, advConditions, readFootnoteIds, bookmarkedIds])

  const hasAdvancedConditions =
    advConditions.pageRange.min !== null ||
    advConditions.pageRange.max !== null ||
    advConditions.tags.length > 0 ||
    advConditions.readStatus !== 'all' ||
    advConditions.favoriteStatus !== 'all'

  const handleApplyAdvancedConditions = useCallback(
    (conditions: AdvancedSearchConditions) => {
      setAdvConditions(conditions)
    },
    [],
  )

  const handleClearAdvancedConditions = useCallback(() => {
    setAdvConditions(DEFAULT_CONDITIONS)
  }, [])

  const refreshBookmarks = useCallback(() => {
    setBookmarkedIds(readBookmarkedIds())
    setGroups(getBookmarkGroups())
    setBookmarkRefreshKey((k) => k + 1)
  }, [])

  const handleChangeGroup = useCallback(
    (footnoteId: string, groupId: string | null) => {
      setBookmarkGroup(footnoteId, groupId)
      refreshBookmarks()
    },
    [refreshBookmarks],
  )

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
        <SearchBar
          value={query}
          onChange={setQuery}
          onAdvancedSearch={() => setAdvSearchOpen(true)}
          onClearAdvanced={handleClearAdvancedConditions}
          advancedConditions={advConditions}
        />
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
              isFilterActive={!!query.trim() || selectedTags.size > 0 || hasAdvancedConditions}
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
        {query.trim() || selectedTags.size > 0 || hasAdvancedConditions
          ? `找到 ${filteredFootnotes.length} 条匹配`
          : `显示全部 ${filteredFootnotes.length} 条`}
        {query.trim() ? ` · 关键字「${query.trim()}」` : ''}
        {selectedTags.size > 0
          ? ` · 标签「${Array.from(selectedTags).map(getDisplayName).join('、')}」（满足任一）`
          : ''}
        {advConditions.pageRange.min !== null ? ` · 页码 ≥ ${advConditions.pageRange.min}` : ''}
        {advConditions.pageRange.max !== null ? ` · 页码 ≤ ${advConditions.pageRange.max}` : ''}
        {advConditions.tags.length > 0
          ? ` · 高级标签「${advConditions.tags.map(getDisplayName).join('、')}」${advConditions.tagMatchMode === 'all' ? '（同时满足）' : '（满足任一）'}`
          : ''}
        {advConditions.readStatus === 'read' ? ' · 仅已读' : ''}
        {advConditions.readStatus === 'unread' ? ' · 仅未读' : ''}
        {advConditions.favoriteStatus === 'favorited' ? ' · 仅已收藏' : ''}
        {advConditions.favoriteStatus === 'not-favorited' ? ' · 仅未收藏' : ''}
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
        showGroupSelector
        bookmarkGroups={groups}
        footnoteGroupMap={footnoteGroupMap}
        onChangeGroup={handleChangeGroup}
      />

      <AdvancedSearchModal
        open={advSearchOpen}
        onClose={() => setAdvSearchOpen(false)}
        onApply={handleApplyAdvancedConditions}
        conditions={advConditions}
        allTags={allTags}
      />

      <MilestoneToast
        message={activeMilestone}
        pendingCount={pendingLevels.length - 1}
        onDismiss={dismissMilestoneToast}
        onDismissAll={handleDismissAllMilestones}
      />
    </div>
  )
}
