import { useState } from 'react'
import type { Book, Footnote } from '../types'
import {
  formatAnnotationsAsJSON,
  formatAnnotationsAsText,
  triggerDownload,
} from '../data/mockData'

type ExportFormat = 'text' | 'json'

interface ExportButtonProps {
  book: Book
  footnotes: Footnote[]
}

export default function ExportButton({ book, footnotes }: ExportButtonProps) {
  const [format, setFormat] = useState<ExportFormat>('text')

  function handleExport() {
    const sanitizedTitle = book.title.replace(/[\\/:*?"<>|]/g, '')
    const timestamp = new Date().toISOString().slice(0, 10)

    if (format === 'json') {
      const content = formatAnnotationsAsJSON(book, footnotes)
      const filename = `${sanitizedTitle}_注释_${timestamp}.json`
      triggerDownload(content, filename, 'application/json')
    } else {
      const content = formatAnnotationsAsText(book, footnotes)
      const filename = `${sanitizedTitle}_注释_${timestamp}.txt`
      triggerDownload(content, filename, 'text/plain;charset=utf-8')
    }
  }

  return (
    <div className="export-control">
      <label className="sort-control">
        <span>导出格式</span>
        <div className="export-control__row">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            aria-label="选择导出格式"
            className="export-control__select"
          >
            <option value="text">纯文本 (.txt)</option>
            <option value="json">JSON (.json)</option>
          </select>
          <button
            type="button"
            className="export-btn"
            onClick={handleExport}
            disabled={footnotes.length === 0}
            aria-label="导出注释"
          >
            ↓ 导出
          </button>
        </div>
      </label>
    </div>
  )
}
