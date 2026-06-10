import { Link } from 'react-router-dom'
import { books } from '../data/mockData'

export default function HomePage() {
  return (
    <div className="page home-page">
      <section className="page-hero">
        <h1>书目典藏</h1>
        <p className="page-hero__lead">
          浏览 Mock 书目，进入详情页检索脚注与尾注——支持全文搜索与按页码排序。
        </p>
      </section>

      <section className="book-grid" aria-label="书目列表">
        {books.map((book) => (
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            className="book-card"
          >
            <div className="book-card__spine" aria-hidden="true" />
            <div className="book-card__body">
              <span className="book-card__type">
                {book.noteType === 'footnote' ? '脚注' : '尾注'}
              </span>
              <h2 className="book-card__title">{book.title}</h2>
              <p className="book-card__author">{book.author}</p>
              <p className="book-card__meta">
                {book.publisher} · {book.year}
              </p>
              <p className="book-card__desc">{book.description}</p>
              <span className="book-card__count">
                {book.footnoteCount} 条注释
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
