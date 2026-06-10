import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FootnoteList from '../components/FootnoteList'
import SearchBar from '../components/SearchBar'
import TagFilter from '../components/TagFilter'
import type { BookmarkGroup } from '../types'
import { useTagAlias } from '../context/TagAliasContext'
import {
  getBookById,
  getBookmarkedFootnotes,
  getBookmarks,
  getBookmarkGroups,
  toggleBookmark,
  addUserTag,
  removeUserTag,
  isDefaultTag,
  setBookmarkGroup,
  createBookmarkGroup,
  updateBookmarkGroup,
  deleteBookmarkGroup,
  getBookmarkCountByGroup,
  matchesTagWithAlias,
} from '../data/mockData'

type SortOrder = 'newest' | 'oldest' | 'page'

const GROUP_COLORS = ['#d4a840', '#5a7c3a', '#8b6914', '#a04030', '#5060a0', '#604080', '#308080']
const UNGROUPED_ID = '__ungrouped__' as const

function readBookmarkedIds(): Set<string> {
  return new Set(getBookmarks().map((b) => b.footnoteId))
}

export default function BookmarksPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => readBookmarkedIds())
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groups, setGroups] = useState<BookmarkGroup[]>(() => getBookmarkGroups())
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0])
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupColor, setEditGroupColor] = useState('')
  const { getDisplayName } = useTagAlias()

  const bookmarkedItems = useMemo(() => getBookmarkedFootnotes(), [refreshKey])

  const ungroupedCount = useMemo(() => {
    return bookmarkedItems.filter((item) => item.bookmark.groupId === null).length
  }, [bookmarkedItems])

  const footnoteGroupMap = useMemo(() => {
    const map: Record<string, string | null> = {}
    for (const item of bookmarkedItems) {
      map[item.footnote.id] = item.bookmark.groupId
    }
    return map
  }, [bookmarkedItems])

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

  const refreshGroups = useCallback(() => {
    setGroups(getBookmarkGroups())
  }, [])

  const refreshTags = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let result = bookmarkedItems

    if (selectedGroupId === UNGROUPED_ID) {
      result = result.filter((item) => item.bookmark.groupId === null)
    } else if (selectedGroupId !== null) {
      result = result.filter((item) => item.bookmark.groupId === selectedGroupId)
    }

    if (normalized) {
      result = result.filter(
        ({ footnote, book }) =>
          footnote.originalText.toLowerCase().includes(normalized) ||
          footnote.annotation.toLowerCase().includes(normalized) ||
          String(footnote.number).includes(normalized) ||
          String(footnote.page).includes(normalized) ||
          book.title.toLowerCase().includes(normalized) ||
          footnote.tags.some((t) => matchesTagWithAlias(t, normalized)),
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
  }, [bookmarkedItems, query, sortOrder, selectedTags, selectedGroupId])

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

  const handleChangeGroup = useCallback(
    (footnoteId: string, groupId: string | null) => {
      setBookmarkGroup(footnoteId, groupId)
      refreshBookmarks()
    },
    [refreshBookmarks],
  )

  const handleSelectGroup = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId)
  }, [])

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

  const handleStartCreateGroup = useCallback(() => {
    setIsCreatingGroup(true)
    setNewGroupName('')
    setNewGroupColor(GROUP_COLORS[0])
  }, [])

  const handleCancelCreateGroup = useCallback(() => {
    setIsCreatingGroup(false)
    setNewGroupName('')
  }, [])

  const handleSubmitCreateGroup = useCallback(() => {
    const name = newGroupName.trim()
    if (!name) return
    createBookmarkGroup(name, newGroupColor)
    setIsCreatingGroup(false)
    setNewGroupName('')
    refreshGroups()
  }, [newGroupName, newGroupColor, refreshGroups])

  const handleStartEditGroup = useCallback((group: BookmarkGroup) => {
    setEditingGroupId(group.id)
    setEditGroupName(group.name)
    setEditGroupColor(group.color)
  }, [])

  const handleCancelEditGroup = useCallback(() => {
    setEditingGroupId(null)
    setEditGroupName('')
  }, [])

  const handleSubmitEditGroup = useCallback(() => {
    if (!editingGroupId) return
    const name = editGroupName.trim()
    if (!name) return
    updateBookmarkGroup(editingGroupId, { name, color: editGroupColor })
    setEditingGroupId(null)
    setEditGroupName('')
    refreshGroups()
  }, [editingGroupId, editGroupName, editGroupColor, refreshGroups])

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId)
      if (!group || group.isDefault) return
      const confirmed = window.confirm(`确定删除分组「${group.name}」吗？该分组下的书签将变为未分组状态。`)
      if (!confirmed) return
      deleteBookmarkGroup(groupId)
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null)
      }
      refreshGroups()
      refreshBookmarks()
    },
    [groups, selectedGroupId, refreshGroups, refreshBookmarks],
  )

  const selectedGroup =
    selectedGroupId !== null && selectedGroupId !== UNGROUPED_ID
      ? groups.find((g) => g.id === selectedGroupId)
      : null
  const isUngroupedSelected = selectedGroupId === UNGROUPED_ID
  const totalCount = bookmarkedItems.length
  const currentGroupCount =
    selectedGroupId === null
      ? totalCount
      : selectedGroupId === UNGROUPED_ID
        ? ungroupedCount
        : getBookmarkCountByGroup(selectedGroupId)

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
          已收藏 <strong>{totalCount}</strong> 条注释
        </p>
      </header>

      <div className="group-manager">
        <div className="group-manager__header">
          <span className="group-manager__title">书签分组</span>
          <button
            type="button"
            className="group-manager__add-btn"
            onClick={handleStartCreateGroup}
          >
            + 新建分组
          </button>
        </div>

        <div className="group-filter">
          <button
            type="button"
            className={`group-chip ${selectedGroupId === null ? 'group-chip--active' : ''}`}
            onClick={() => handleSelectGroup(null)}
          >
            <span className="group-chip__dot" style={{ backgroundColor: '#8a7355' }} />
            <span className="group-chip__name">全部</span>
            <span className="group-chip__count">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`group-chip ${isUngroupedSelected ? 'group-chip--active' : ''}`}
            onClick={() => handleSelectGroup(UNGROUPED_ID)}
          >
            <span className="group-chip__dot" style={{ backgroundColor: '#8a7355' }} />
            <span className="group-chip__name">未分组</span>
            <span className="group-chip__count">{ungroupedCount}</span>
          </button>
          {groups.map((group) => (
            <div key={group.id} className="group-chip-wrapper">
              {editingGroupId === group.id ? (
                <div className="group-edit-form">
                  <input
                    type="text"
                    className="group-edit-input"
                    value={editGroupName}
                    autoFocus
                    onChange={(e) => setEditGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitEditGroup()
                      else if (e.key === 'Escape') handleCancelEditGroup()
                    }}
                  />
                  <div className="group-color-picker">
                    {GROUP_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`group-color-option ${editGroupColor === color ? 'group-color-option--selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditGroupColor(color)}
                        aria-label={`选择颜色 ${color}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="group-edit-btn group-edit-btn--confirm"
                    onClick={handleSubmitEditGroup}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="group-edit-btn group-edit-btn--cancel"
                    onClick={handleCancelEditGroup}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`group-chip ${selectedGroupId === group.id ? 'group-chip--active' : ''}`}
                  onClick={() => handleSelectGroup(group.id)}
                  style={selectedGroupId === group.id ? { borderColor: group.color } : undefined}
                >
                  <span className="group-chip__dot" style={{ backgroundColor: group.color }} />
                  <span className="group-chip__name">{group.name}</span>
                  <span className="group-chip__count">{getBookmarkCountByGroup(group.id)}</span>
                  {!group.isDefault && (
                    <span
                      className="group-chip__actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="group-chip__action"
                        onClick={() => handleStartEditGroup(group)}
                        aria-label="编辑分组"
                        title="编辑"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="group-chip__action group-chip__action--delete"
                        onClick={() => handleDeleteGroup(group.id)}
                        aria-label="删除分组"
                        title="删除"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {isCreatingGroup && (
          <div className="group-create-form">
            <input
              type="text"
              className="group-create-input"
              placeholder="输入分组名称..."
              value={newGroupName}
              autoFocus
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitCreateGroup()
                else if (e.key === 'Escape') handleCancelCreateGroup()
              }}
            />
            <div className="group-color-picker">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`group-color-option ${newGroupColor === color ? 'group-color-option--selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewGroupColor(color)}
                  aria-label={`选择颜色 ${color}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="group-edit-btn group-edit-btn--confirm"
              onClick={handleSubmitCreateGroup}
              disabled={!newGroupName.trim()}
            >
              创建
            </button>
            <button
              type="button"
              className="group-edit-btn group-edit-btn--cancel"
              onClick={handleCancelCreateGroup}
            >
              取消
            </button>
          </div>
        )}
      </div>

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
            {selectedGroup ? (
              <>
                分组「<span style={{ color: selectedGroup.color }}>{selectedGroup.name}</span>」
              </>
            ) : isUngroupedSelected ? (
              '未分组'
            ) : (
              '全部分组'
            )}
            {query.trim() || selectedTags.size > 0
              ? ` · 找到 ${filteredItems.length} / ${currentGroupCount} 条匹配`
              : ` · 显示 ${currentGroupCount} 条`}
            {query.trim() ? ` · 关键字「${query.trim()}」` : ''}
            {selectedTags.size > 0
              ? ` · 标签「${Array.from(selectedTags).map(getDisplayName).join('、')}」（满足任一）`
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
            showGroupSelector
            bookmarkGroups={groups}
            footnoteGroupMap={footnoteGroupMap}
            onChangeGroup={handleChangeGroup}
            emptyText={
              selectedGroupId !== null
                ? selectedGroupId === UNGROUPED_ID
                  ? '未分组暂无书签'
                  : '该分组暂无书签'
                : undefined
            }
          />
        </>
      )}
    </div>
  )
}
