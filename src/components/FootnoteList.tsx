import { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react'
import type { BookmarkGroup, Footnote } from '../types'
import { useTagAlias } from '../context/TagAliasContext'

const ITEM_HEIGHT_ESTIMATE = 120
const BUFFER_ITEMS = 5

interface TagButtonProps {
  tag: string
  footnoteId: string
  removable: boolean
  getDisplayName: (tag: string) => string
  onTagClick?: (tag: string) => void
  onRemoveTag?: (footnoteId: string, tag: string) => void
}

const TagButton = memo(function TagButton({
  tag,
  footnoteId,
  removable,
  getDisplayName,
  onTagClick,
  onRemoveTag,
}: TagButtonProps) {
  const displayName = getDisplayName(tag)

  const handleTagClick = useCallback(() => {
    onTagClick?.(tag)
  }, [onTagClick, tag])

  const handleRemoveClick = useCallback(() => {
    onRemoveTag?.(footnoteId, tag)
  }, [onRemoveTag, footnoteId, tag])

  return (
    <span className="footnote-tag-wrapper">
      <button
        type="button"
        className="footnote-tag"
        onClick={handleTagClick}
      >
        #{displayName}
      </button>
      {removable && onRemoveTag && (
        <button
          type="button"
          className="footnote-tag__remove"
          onClick={handleRemoveClick}
          aria-label={`删除标签「${displayName}」`}
          title={`删除标签「${displayName}」`}
        >
          ×
        </button>
      )}
    </span>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.tag === nextProps.tag &&
    prevProps.footnoteId === nextProps.footnoteId &&
    prevProps.removable === nextProps.removable &&
    prevProps.onTagClick === nextProps.onTagClick &&
    prevProps.onRemoveTag === nextProps.onRemoveTag
  )
})

interface FootnoteItemProps {
  footnote: Footnote
  isBookmarked: boolean
  isRead: boolean
  bookNoteType?: 'footnote' | 'endnote'
  isAddingTag: boolean
  newTagText: string
  activeGroupDropdown: string | null
  bookmarkGroups: BookmarkGroup[]
  footnoteGroupMap: Record<string, string | null>
  showBookLink?: boolean
  showGroupSelector: boolean
  getDisplayName: (tag: string) => string
  getBookTitle?: (bookId: string) => string
  isTagRemovable?: (footnoteId: string, tag: string) => boolean
  onToggleBookmark?: (footnoteId: string) => void
  onTagClick?: (tag: string) => void
  onAddTag?: (footnoteId: string, tag: string) => void
  onRemoveTag?: (footnoteId: string, tag: string) => void
  onBookClick?: (bookId: string) => void
  onStartAddTag: (footnoteId: string) => void
  onCancelAddTag: () => void
  onSubmitAddTag: (footnoteId: string) => void
  onToggleGroupDropdown: (footnoteId: string) => void
  onSelectGroup: (footnoteId: string, groupId: string | null) => void
  onTagInputChange: (value: string) => void
  onGroupDropdownRef: (footnoteId: string, el: HTMLDivElement | null) => void
}

const FootnoteItem = memo(function FootnoteItem({
  footnote,
  isBookmarked,
  isRead,
  bookNoteType,
  isAddingTag,
  newTagText,
  activeGroupDropdown,
  bookmarkGroups,
  footnoteGroupMap,
  showBookLink,
  showGroupSelector,
  getDisplayName,
  getBookTitle,
  isTagRemovable,
  onToggleBookmark,
  onTagClick,
  onAddTag,
  onRemoveTag,
  onBookClick,
  onStartAddTag,
  onCancelAddTag,
  onSubmitAddTag,
  onToggleGroupDropdown,
  onSelectGroup,
  onTagInputChange,
  onGroupDropdownRef,
}: FootnoteItemProps) {
  const handleBookClick = useCallback(() => {
    onBookClick?.(footnote.bookId)
  }, [onBookClick, footnote.bookId])

  const handleToggleBookmark = useCallback(() => {
    onToggleBookmark?.(footnote.id)
  }, [onToggleBookmark, footnote.id])

  const handleStartAddTag = useCallback(() => {
    onStartAddTag(footnote.id)
  }, [onStartAddTag, footnote.id])

  const handleSubmitAddTag = useCallback(() => {
    onSubmitAddTag(footnote.id)
  }, [onSubmitAddTag, footnote.id])

  const handleToggleGroupDropdown = useCallback(() => {
    onToggleGroupDropdown(footnote.id)
  }, [onToggleGroupDropdown, footnote.id])

  const handleSelectGroup = useCallback((groupId: string | null) => {
    onSelectGroup(footnote.id, groupId)
  }, [onSelectGroup, footnote.id])

  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTagInputChange(e.target.value)
  }, [onTagInputChange])

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmitAddTag(footnote.id)
    } else if (e.key === 'Escape') {
      onCancelAddTag()
    }
  }, [onSubmitAddTag, onCancelAddTag, footnote.id])

  const currentGroup = useMemo(() => {
    const groupId = footnoteGroupMap[footnote.id]
    if (!groupId) return undefined
    return bookmarkGroups.find((g) => g.id === groupId)
  }, [footnoteGroupMap, footnote.id, bookmarkGroups])

  const isDropdownActive = activeGroupDropdown === footnote.id

  return (
    <li
      key={footnote.id}
      id={`footnote-${footnote.id}`}
      data-footnote-id={footnote.id}
      className={`footnote-item ${isRead ? 'footnote-item--read' : ''}`}
    >
      <div className="footnote-item__meta">
        <span className="footnote-item__number">#{footnote.number}</span>
        <span className="footnote-item__page">p. {footnote.page}</span>
        {bookNoteType && (
          <span className="footnote-item__type">
            {bookNoteType === 'footnote' ? '脚注' : '尾注'}
          </span>
        )}
        {isRead && <span className="footnote-item__read-tag">已读</span>}
        {showBookLink && getBookTitle && onBookClick && (
          <button
            type="button"
            className="footnote-item__book-link"
            onClick={handleBookClick}
          >
            出自《{getBookTitle(footnote.bookId)}》
          </button>
        )}
        <div className="footnote-item__spacer" />
        {showGroupSelector && isBookmarked && bookmarkGroups.length > 0 && (
          <div
            className="group-selector-wrapper"
            ref={(el) => {
              onGroupDropdownRef(footnote.id, el)
            }}
          >
            <button
              type="button"
              className={`group-selector-btn ${isDropdownActive ? 'group-selector-btn--active' : ''}`}
              onClick={handleToggleGroupDropdown}
              aria-label="选择分组"
              title="选择分组"
            >
              {currentGroup ? (
                <>
                  <span className="group-selector-btn__dot" style={{ backgroundColor: currentGroup.color }} />
                  <span className="group-selector-btn__name">{currentGroup.name}</span>
                </>
              ) : (
                <span className="group-selector-btn__placeholder">选择分组</span>
              )}
              <span className="group-selector-btn__arrow">▾</span>
            </button>
            {isDropdownActive && (
              <div className="group-dropdown" role="menu">
                <button
                  type="button"
                  className={`group-dropdown__item ${footnoteGroupMap[footnote.id] === null ? 'group-dropdown__item--active' : ''}`}
                  onClick={() => handleSelectGroup(null)}
                >
                  <span className="group-dropdown__dot" style={{ backgroundColor: '#8a7355' }} />
                  <span>未分组</span>
                </button>
                {bookmarkGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`group-dropdown__item ${footnoteGroupMap[footnote.id] === group.id ? 'group-dropdown__item--active' : ''}`}
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    <span className="group-dropdown__dot" style={{ backgroundColor: group.color }} />
                    <span>{group.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {onToggleBookmark && (
          <button
            type="button"
            className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? '取消收藏' : '收藏此条注释'}
            title={isBookmarked ? '取消收藏' : '收藏此条注释'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        )}
      </div>
      <blockquote className="footnote-item__original">
        {footnote.originalText}
      </blockquote>
      <p className="footnote-item__annotation">{footnote.annotation}</p>
      {(footnote.tags && footnote.tags.length > 0) || onAddTag ? (
        <div className="footnote-item__tags">
          {footnote.tags &&
            footnote.tags.map((tag) => {
              const removable = isTagRemovable ? isTagRemovable(footnote.id, tag) : true
              return (
                <TagButton
                  key={tag}
                  tag={tag}
                  footnoteId={footnote.id}
                  removable={removable}
                  getDisplayName={getDisplayName}
                  onTagClick={onTagClick}
                  onRemoveTag={onRemoveTag}
                />
              )
            })}
          {onAddTag && !isAddingTag && (
            <button
              type="button"
              className="footnote-tag-add"
              onClick={handleStartAddTag}
            >
              + 添加标签
            </button>
          )}
          {onAddTag && isAddingTag && (
            <span className="footnote-tag-input-wrapper">
              <input
                type="text"
                className="footnote-tag-input"
                placeholder="输入标签名..."
                value={newTagText}
                autoFocus
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
              />
              <button
                type="button"
                className="footnote-tag-input__btn footnote-tag-input__btn--confirm"
                onClick={handleSubmitAddTag}
              >
                添加
              </button>
              <button
                type="button"
                className="footnote-tag-input__btn footnote-tag-input__btn--cancel"
                onClick={onCancelAddTag}
              >
                取消
              </button>
            </span>
          )}
        </div>
      ) : null}
    </li>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.footnote.id === nextProps.footnote.id &&
    prevProps.footnote.number === nextProps.footnote.number &&
    prevProps.footnote.page === nextProps.footnote.page &&
    prevProps.footnote.originalText === nextProps.footnote.originalText &&
    prevProps.footnote.annotation === nextProps.footnote.annotation &&
    prevProps.footnote.tags === nextProps.footnote.tags &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.isRead === nextProps.isRead &&
    prevProps.bookNoteType === nextProps.bookNoteType &&
    prevProps.isAddingTag === nextProps.isAddingTag &&
    prevProps.newTagText === nextProps.newTagText &&
    prevProps.activeGroupDropdown === nextProps.activeGroupDropdown &&
    prevProps.bookmarkGroups === nextProps.bookmarkGroups &&
    prevProps.footnoteGroupMap === nextProps.footnoteGroupMap &&
    prevProps.showBookLink === nextProps.showBookLink &&
    prevProps.showGroupSelector === nextProps.showGroupSelector &&
    prevProps.onToggleBookmark === nextProps.onToggleBookmark &&
    prevProps.onTagClick === nextProps.onTagClick &&
    prevProps.onAddTag === nextProps.onAddTag &&
    prevProps.onRemoveTag === nextProps.onRemoveTag &&
    prevProps.onBookClick === nextProps.onBookClick
  )
})

interface FootnoteListProps {
  footnotes: Footnote[]
  noteType?: 'footnote' | 'endnote'
  bookmarkedIds?: Set<string>
  readFootnoteIds?: Set<string>
  onToggleBookmark?: (footnoteId: string) => void
  onTagClick?: (tag: string) => void
  onAddTag?: (footnoteId: string, tag: string) => void
  onRemoveTag?: (footnoteId: string, tag: string) => void
  isTagRemovable?: (footnoteId: string, tag: string) => boolean
  showBookLink?: boolean
  getBookTitle?: (bookId: string) => string
  getBookNoteType?: (bookId: string) => 'footnote' | 'endnote' | undefined
  onBookClick?: (bookId: string) => void
  emptyText?: string
  showGroupSelector?: boolean
  bookmarkGroups?: BookmarkGroup[]
  footnoteGroupMap?: Record<string, string | null>
  onChangeGroup?: (footnoteId: string, groupId: string | null) => void
}

export default function FootnoteList({
  footnotes,
  noteType,
  bookmarkedIds,
  readFootnoteIds,
  onToggleBookmark,
  onTagClick,
  onAddTag,
  onRemoveTag,
  isTagRemovable,
  showBookLink,
  getBookTitle,
  getBookNoteType,
  onBookClick,
  emptyText,
  showGroupSelector = false,
  bookmarkGroups = [],
  footnoteGroupMap = {},
  onChangeGroup,
}: FootnoteListProps) {
  const [addingTagFor, setAddingTagFor] = useState<string | null>(null)
  const [newTagText, setNewTagText] = useState('')
  const [activeGroupDropdown, setActiveGroupDropdown] = useState<string | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const groupDropdownRef = useRef<HTMLDivElement | null>(null)
  const { getDisplayName } = useTagAlias()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateViewportHeight = () => {
      setViewportHeight(container.clientHeight)
    }

    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
    return () => {
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [])

  useEffect(() => {
    if (activeGroupDropdown === null) return

    function handleClickOutside(event: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setActiveGroupDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeGroupDropdown])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT_ESTIMATE) - BUFFER_ITEMS)
    const endIndex = Math.min(
      footnotes.length,
      Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT_ESTIMATE) + BUFFER_ITEMS
    )
    return { startIndex, endIndex }
  }, [scrollTop, viewportHeight, footnotes.length])

  const totalHeight = useMemo(() => {
    return footnotes.length * ITEM_HEIGHT_ESTIMATE
  }, [footnotes.length])

  const offsetY = useMemo(() => {
    return visibleRange.startIndex * ITEM_HEIGHT_ESTIMATE
  }, [visibleRange.startIndex])

  const visibleFootnotes = useMemo(() => {
    return footnotes.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [footnotes, visibleRange.startIndex, visibleRange.endIndex])

  const handleStartAddTag = useCallback((footnoteId: string) => {
    setAddingTagFor(footnoteId)
    setNewTagText('')
  }, [])

  const handleCancelAddTag = useCallback(() => {
    setAddingTagFor(null)
    setNewTagText('')
  }, [])

  const handleSubmitAddTag = useCallback((footnoteId: string) => {
    const tag = newTagText.trim()
    if (tag && onAddTag) {
      onAddTag(footnoteId, tag)
      setAddingTagFor(null)
      setNewTagText('')
    }
  }, [newTagText, onAddTag])

  const handleToggleGroupDropdown = useCallback((footnoteId: string) => {
    setActiveGroupDropdown((prev) => (prev === footnoteId ? null : footnoteId))
  }, [])

  const handleSelectGroup = useCallback((footnoteId: string, groupId: string | null) => {
    if (onChangeGroup) {
      onChangeGroup(footnoteId, groupId)
    }
    setActiveGroupDropdown(null)
  }, [onChangeGroup])

  const handleTagInputChange = useCallback((value: string) => {
    setNewTagText(value)
  }, [])

  const handleGroupDropdownRef = useCallback((footnoteId: string, el: HTMLDivElement | null) => {
    if (activeGroupDropdown === footnoteId) {
      groupDropdownRef.current = el
    }
  }, [activeGroupDropdown])

  if (footnotes.length === 0) {
    const defaultText =
      noteType !== undefined
        ? `暂无匹配的${noteType === 'footnote' ? '脚注' : '尾注'}条目。`
        : '暂无匹配的收藏条目。'
    return <p className="empty-state">{emptyText ?? defaultText}</p>
  }

  return (
    <div
      className="footnote-list-container"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <ol
        className="footnote-list"
        style={{
          height: totalHeight,
          position: 'relative',
          transform: `translateY(${offsetY}px)`,
        }}
      >
        {visibleFootnotes.map((fn) => {
          const isBookmarked = bookmarkedIds?.has(fn.id) ?? false
          const isRead = readFootnoteIds?.has(fn.id) ?? false
          const bookNoteType = getBookNoteType ? getBookNoteType(fn.bookId) : undefined
          const isAddingTag = addingTagFor === fn.id

          return (
            <FootnoteItem
              key={fn.id}
              footnote={fn}
              isBookmarked={isBookmarked}
              isRead={isRead}
              bookNoteType={bookNoteType}
              isAddingTag={isAddingTag}
              newTagText={newTagText}
              activeGroupDropdown={activeGroupDropdown}
              bookmarkGroups={bookmarkGroups}
              footnoteGroupMap={footnoteGroupMap}
              showBookLink={showBookLink}
              showGroupSelector={showGroupSelector}
              getDisplayName={getDisplayName}
              getBookTitle={getBookTitle}
              isTagRemovable={isTagRemovable}
              onToggleBookmark={onToggleBookmark}
              onTagClick={onTagClick}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onBookClick={onBookClick}
              onStartAddTag={handleStartAddTag}
              onCancelAddTag={handleCancelAddTag}
              onSubmitAddTag={handleSubmitAddTag}
              onToggleGroupDropdown={handleToggleGroupDropdown}
              onSelectGroup={handleSelectGroup}
              onTagInputChange={handleTagInputChange}
              onGroupDropdownRef={handleGroupDropdownRef}
            />
          )
        })}
      </ol>
    </div>
  )
}
