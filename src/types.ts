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
  tags: string[]
}

export interface Bookmark {
  id: string
  footnoteId: string
  bookId: string
  createdAt: number
  groupId: string | null
}

export interface BookmarkGroup {
  id: string
  name: string
  color: string
  createdAt: number
  isDefault?: boolean
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

export interface AdvancedSearchConditions {
  pageRange: { min: number | null; max: number | null }
  tags: string[]
  tagMatchMode: 'any' | 'all'
  readStatus: 'all' | 'read' | 'unread'
  favoriteStatus: 'all' | 'favorited' | 'not-favorited'
}

export interface SearchPreset {
  id: string
  name: string
  conditions: AdvancedSearchConditions
  createdAt: number
}

export interface TagAlias {
  originalTag: string
  alias: string
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
