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
