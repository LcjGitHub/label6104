import { useState } from 'react'
import type { Footnote } from '../types'

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
}: FootnoteListProps) {
  const [addingTagFor, setAddingTagFor] = useState<string | null>(null)
  const [newTagText, setNewTagText] = useState('')

  if (footnotes.length === 0) {
    const defaultText =
      noteType !== undefined
        ? `暂无匹配的${noteType === 'footnote' ? '脚注' : '尾注'}条目。`
        : '暂无匹配的收藏条目。'
    return <p className="empty-state">{emptyText ?? defaultText}</p>
  }

  function handleStartAddTag(footnoteId: string) {
    setAddingTagFor(footnoteId)
    setNewTagText('')
  }

  function handleCancelAddTag() {
    setAddingTagFor(null)
    setNewTagText('')
  }

  function handleSubmitAddTag(footnoteId: string) {
    const tag = newTagText.trim()
    if (tag && onAddTag) {
      onAddTag(footnoteId, tag)
      setAddingTagFor(null)
      setNewTagText('')
    }
  }

  return (
    <ol className="footnote-list">
      {footnotes.map((fn) => {
        const isBookmarked = bookmarkedIds?.has(fn.id) ?? false
        const isRead = readFootnoteIds?.has(fn.id) ?? false
        const bookNoteType = getBookNoteType ? getBookNoteType(fn.bookId) : undefined
        const isAddingTag = addingTagFor === fn.id
        return (
          <li
            key={fn.id}
            id={`footnote-${fn.id}`}
            data-footnote-id={fn.id}
            className={`footnote-item ${isRead ? 'footnote-item--read' : ''}`}
          >
            <div className="footnote-item__meta">
              <span className="footnote-item__number">#{fn.number}</span>
              <span className="footnote-item__page">p. {fn.page}</span>
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
                  onClick={() => onBookClick(fn.bookId)}
                >
                  出自《{getBookTitle(fn.bookId)}》
                </button>
              )}
              <div className="footnote-item__spacer" />
              {onToggleBookmark && (
                <button
                  type="button"
                  className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
                  onClick={() => onToggleBookmark(fn.id)}
                  aria-label={isBookmarked ? '取消收藏' : '收藏此条注释'}
                  title={isBookmarked ? '取消收藏' : '收藏此条注释'}
                >
                  {isBookmarked ? '★' : '☆'}
                </button>
              )}
            </div>
            <blockquote className="footnote-item__original">
              {fn.originalText}
            </blockquote>
            <p className="footnote-item__annotation">{fn.annotation}</p>
            {(fn.tags && fn.tags.length > 0) || onAddTag ? (
              <div className="footnote-item__tags">
                {fn.tags &&
                  fn.tags.map((tag) => {
                    const removable = isTagRemovable ? isTagRemovable(fn.id, tag) : true
                    return (
                      <span key={tag} className="footnote-tag-wrapper">
                        <button
                          type="button"
                          className="footnote-tag"
                          onClick={() => onTagClick?.(tag)}
                        >
                          #{tag}
                        </button>
                        {removable && onRemoveTag && (
                          <button
                            type="button"
                            className="footnote-tag__remove"
                            onClick={() => onRemoveTag(fn.id, tag)}
                            aria-label={`删除标签「${tag}」`}
                            title={`删除标签「${tag}」`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    )
                  })}
                {onAddTag && !isAddingTag && (
                  <button
                    type="button"
                    className="footnote-tag-add"
                    onClick={() => handleStartAddTag(fn.id)}
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
                      onChange={(e) => setNewTagText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitAddTag(fn.id)
                        } else if (e.key === 'Escape') {
                          handleCancelAddTag()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="footnote-tag-input__btn footnote-tag-input__btn--confirm"
                      onClick={() => handleSubmitAddTag(fn.id)}
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      className="footnote-tag-input__btn footnote-tag-input__btn--cancel"
                      onClick={handleCancelAddTag}
                    >
                      取消
                    </button>
                  </span>
                )}
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
