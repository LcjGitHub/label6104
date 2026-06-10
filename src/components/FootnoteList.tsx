import type { Footnote } from '../types'

interface FootnoteListProps {
  footnotes: Footnote[]
  noteType: 'footnote' | 'endnote'
  bookmarkedIds?: Set<string>
  onToggleBookmark?: (footnoteId: string) => void
  showBookLink?: boolean
  getBookTitle?: (bookId: string) => string
  onBookClick?: (bookId: string) => void
}

export default function FootnoteList({
  footnotes,
  noteType,
  bookmarkedIds,
  onToggleBookmark,
  showBookLink,
  getBookTitle,
  onBookClick,
}: FootnoteListProps) {
  if (footnotes.length === 0) {
    return (
      <p className="empty-state">
        暂无匹配的{noteType === 'footnote' ? '脚注' : '尾注'}条目。
      </p>
    )
  }

  return (
    <ol className="footnote-list">
      {footnotes.map((fn) => {
        const isBookmarked = bookmarkedIds?.has(fn.id) ?? false
        return (
          <li key={fn.id} className="footnote-item">
            <div className="footnote-item__meta">
              <span className="footnote-item__number">#{fn.number}</span>
              <span className="footnote-item__page">p. {fn.page}</span>
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
          </li>
        )
      })}
    </ol>
  )
}
