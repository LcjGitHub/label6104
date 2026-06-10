import type { Footnote } from '../types'

interface FootnoteListProps {
  footnotes: Footnote[]
  noteType?: 'footnote' | 'endnote'
  bookmarkedIds?: Set<string>
  readFootnoteIds?: Set<string>
  onToggleBookmark?: (footnoteId: string) => void
  onTagClick?: (tag: string) => void
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
  showBookLink,
  getBookTitle,
  getBookNoteType,
  onBookClick,
  emptyText,
}: FootnoteListProps) {
  if (footnotes.length === 0) {
    const defaultText =
      noteType !== undefined
        ? `暂无匹配的${noteType === 'footnote' ? '脚注' : '尾注'}条目。`
        : '暂无匹配的收藏条目。'
    return <p className="empty-state">{emptyText ?? defaultText}</p>
  }

  return (
    <ol className="footnote-list">
      {footnotes.map((fn) => {
        const isBookmarked = bookmarkedIds?.has(fn.id) ?? false
        const isRead = readFootnoteIds?.has(fn.id) ?? false
        const bookNoteType = getBookNoteType ? getBookNoteType(fn.bookId) : undefined
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
            {fn.tags && fn.tags.length > 0 && (
              <div className="footnote-item__tags">
                {fn.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="footnote-tag"
                    onClick={() => onTagClick?.(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
