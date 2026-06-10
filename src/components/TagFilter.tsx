import { useTagAlias } from '../context/TagAliasContext'

interface TagFilterProps {
  tags: string[]
  selectedTags: Set<string>
  onToggleTag: (tag: string) => void
  onClearAll: () => void
}

export default function TagFilter({
  tags,
  selectedTags,
  onToggleTag,
  onClearAll,
}: TagFilterProps) {
  const { getDisplayName } = useTagAlias()

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="tag-filter">
      <div className="tag-filter__label">标签筛选</div>
      <div className="tag-filter__tags">
        {tags.map((tag) => {
          const isSelected = selectedTags.has(tag)
          return (
            <button
              key={tag}
              type="button"
              className={`tag-chip ${isSelected ? 'tag-chip--active' : ''}`}
              onClick={() => onToggleTag(tag)}
              aria-pressed={isSelected}
            >
              {getDisplayName(tag)}
            </button>
          )
        })}
      </div>
      {selectedTags.size > 0 && (
        <button
          type="button"
          className="tag-filter__clear"
          onClick={onClearAll}
        >
          清除筛选
        </button>
      )}
    </div>
  )
}
