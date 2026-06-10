interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="footnote-search" className="search-bar__label">
        全文检索
      </label>
      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          id="footnote-search"
          type="search"
          className="search-bar__input"
          placeholder="搜索编号、页码、原文或注释…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => onChange('')}
            aria-label="清除搜索"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
