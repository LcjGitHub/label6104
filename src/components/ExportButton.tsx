import { useEffect, useState } from 'react'
import type { Book, Footnote } from '../types'
import {
  formatAnnotationsAsJSON,
  formatAnnotationsAsText,
  formatAnnotationsAsCSV,
  triggerDownload,
} from '../data/mockData'

type ExportFormat = 'text' | 'json' | 'csv'
type ExportRange = 'filtered' | 'all'

interface ExportButtonProps {
  book: Book
  filteredFootnotes: Footnote[]
  allFootnotes: Footnote[]
  isFilterActive: boolean
}

export default function ExportButton({
  book,
  filteredFootnotes,
  allFootnotes,
  isFilterActive,
}: ExportButtonProps) {
  const [format, setFormat] = useState<ExportFormat>('text')
  const [range, setRange] = useState<ExportRange>(isFilterActive ? 'filtered' : 'all')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (isFilterActive) {
      setRange('filtered')
    }
  }, [isFilterActive])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const exportFootnotes = range === 'filtered' ? filteredFootnotes : allFootnotes

  function handleExport() {
    if (exportFootnotes.length === 0) return

    const sanitizedTitle = book.title.replace(/[\\/:*?"<>|]/g, '')
    const timestamp = new Date().toISOString().slice(0, 10)
    const rangeLabel = range === 'filtered' ? '筛选' : '全部'

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = formatAnnotationsAsJSON(book, exportFootnotes)
      filename = `${sanitizedTitle}_注释_${rangeLabel}_${timestamp}.json`
      mimeType = 'application/json'
    } else if (format === 'csv') {
      content = formatAnnotationsAsCSV(book, exportFootnotes)
      filename = `${sanitizedTitle}_${timestamp}_表格格式.csv`
      mimeType = 'text/csv;charset=utf-8'
    } else {
      content = formatAnnotationsAsText(book, exportFootnotes)
      filename = `${sanitizedTitle}_注释_${rangeLabel}_${timestamp}.txt`
      mimeType = 'text/plain;charset=utf-8'
    }

    triggerDownload(content, filename, mimeType)

    setToastMessage(`已导出 ${exportFootnotes.length} 条注释`)
    setShowToast(true)
  }

  return (
    <div className="export-control">
      <label className="sort-control">
        <span>导出注释</span>
        <div className="export-control__rows">
          <div className="export-control__row">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as ExportRange)}
              aria-label="选择导出范围"
              className="export-control__select export-control__select--range"
            >
              <option value="filtered">当前筛选结果</option>
              <option value="all">全书全部注释</option>
            </select>
            <span className="export-count">
              {exportFootnotes.length} 条
            </span>
          </div>
          <div className="export-control__row">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              aria-label="选择导出格式"
              className="export-control__select"
            >
              <option value="text">纯文本</option>
              <option value="csv">逗号分隔表格</option>
              <option value="json">结构化数据</option>
            </select>
            <button
              type="button"
              className="export-btn"
              onClick={handleExport}
              disabled={exportFootnotes.length === 0}
              aria-label="导出注释"
            >
              ↓ 导出
            </button>
          </div>
        </div>
      </label>

      {showToast && (
        <div className="export-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
