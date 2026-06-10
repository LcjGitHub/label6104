interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '搜索编号、页码、原文或注释…',
  label = '全文检索',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="footnote-search" className="search-bar__label">
        {label}
      </label>
      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          id="footnote-search"
          type="search"
          className="search-bar__input"
          placeholder={placeholder}
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
