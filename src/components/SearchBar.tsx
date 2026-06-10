import type { AdvancedSearchConditions } from '../types'
import { DEFAULT_CONDITIONS } from './AdvancedSearchModal'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  onAdvancedSearch?: () => void
  advancedConditions?: AdvancedSearchConditions
}

function countActiveConditions(conditions: AdvancedSearchConditions): number {
  let count = 0
  if (conditions.pageRange.min !== null || conditions.pageRange.max !== null) count++
  if (conditions.tags.length > 0) count++
  if (conditions.readStatus !== 'all') count++
  if (conditions.favoriteStatus !== 'all') count++
  return count
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '搜索编号、页码、原文或注释…',
  label = '全文检索',
  onAdvancedSearch,
  advancedConditions = DEFAULT_CONDITIONS,
}: SearchBarProps) {
  const activeCount = countActiveConditions(advancedConditions)

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
        {onAdvancedSearch && (
          <button
            type="button"
            className={`search-bar__adv-btn ${activeCount > 0 ? 'search-bar__adv-btn--active' : ''}`}
            onClick={onAdvancedSearch}
            aria-label="高级搜索"
            title="高级搜索"
          >
            <span className="search-bar__adv-icon">⚙</span>
            {activeCount > 0 && (
              <span className="search-bar__adv-badge">{activeCount}</span>
            )}
          </button>
        )}
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
      {activeCount > 0 && (
        <div className="search-bar__conditions">
          {advancedConditions.pageRange.min !== null && (
            <span className="search-bar__condition-tag">
              起始页 ≥ {advancedConditions.pageRange.min}
            </span>
          )}
          {advancedConditions.pageRange.max !== null && (
            <span className="search-bar__condition-tag">
              结束页 ≤ {advancedConditions.pageRange.max}
            </span>
          )}
          {advancedConditions.tags.length > 0 && (
            <span className="search-bar__condition-tag">
              标签：{advancedConditions.tags.map((t) => `#${t}`).join('、')}
              <span className="search-bar__condition-mode">
                {advancedConditions.tagMatchMode === 'all' ? '（同时满足）' : '（满足任一）'}
              </span>
            </span>
          )}
          {advancedConditions.readStatus === 'read' && (
            <span className="search-bar__condition-tag">仅已读</span>
          )}
          {advancedConditions.readStatus === 'unread' && (
            <span className="search-bar__condition-tag">仅未读</span>
          )}
          {advancedConditions.favoriteStatus === 'favorited' && (
            <span className="search-bar__condition-tag">仅已收藏</span>
          )}
          {advancedConditions.favoriteStatus === 'not-favorited' && (
            <span className="search-bar__condition-tag">仅未收藏</span>
          )}
        </div>
      )}
    </div>
  )
}
