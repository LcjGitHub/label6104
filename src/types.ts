export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  year: number
  noteType: 'footnote' | 'endnote'
  footnoteCount: number
  description: string
}

export interface Footnote {
  id: string
  bookId: string
  number: number
  page: number
  originalText: string
  annotation: string
}

export interface Bookmark {
  id: string
  footnoteId: string
  bookId: string
  createdAt: number
}

export interface FootnoteReadRecord {
  footnoteId: string
  readAt: number
}

export interface ReadingProgress {
  bookId: string
  totalFootnotes: number
  readFootnoteIds: string[]
  readRecords: FootnoteReadRecord[]
  lastReadAt: number
  startedAt: number
}

export interface BookProgressSummary {
  bookId: string
  title: string
  author: string
  totalFootnotes: number
  readCount: number
  percentage: number
  lastReadAt: number
  startedAt: number
}
