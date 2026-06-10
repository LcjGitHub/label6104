import type { Footnote } from '../types'

interface FootnoteListProps {
  footnotes: Footnote[]
  noteType: 'footnote' | 'endnote'
}

export default function FootnoteList({ footnotes, noteType }: FootnoteListProps) {
  if (footnotes.length === 0) {
    return (
      <p className="empty-state">
        暂无匹配的{noteType === 'footnote' ? '脚注' : '尾注'}条目。
      </p>
    )
  }

  return (
    <ol className="footnote-list">
      {footnotes.map((fn) => (
        <li key={fn.id} className="footnote-item">
          <div className="footnote-item__meta">
            <span className="footnote-item__number">#{fn.number}</span>
            <span className="footnote-item__page">p. {fn.page}</span>
          </div>
          <blockquote className="footnote-item__original">
            {fn.originalText}
          </blockquote>
          <p className="footnote-item__annotation">{fn.annotation}</p>
        </li>
      ))}
    </ol>
  )
}
