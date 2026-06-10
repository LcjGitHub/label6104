import { useMemo } from 'react'
import type { Footnote } from '../types'

interface TagCloudProps {
  footnotes: Footnote[]
  onTagClick?: (tag: string) => void
  selectedTags?: Set<string>
}

export default function TagCloud({
  footnotes,
  onTagClick,
  selectedTags,
}: TagCloudProps) {
  const tagFrequencies = useMemo(() => {
    const freq: Record<string, number> = {}
    for (const fn of footnotes) {
      for (const tag of fn.tags) {
        freq[tag] = (freq[tag] ?? 0) + 1
      }
    }
    return freq
  }, [footnotes])

  const sortedTags = useMemo(() => {
    return Object.entries(tagFrequencies).sort((a, b) => b[1] - a[1])
  }, [tagFrequencies])

  const maxFreq = useMemo(() => {
    const values = Object.values(tagFrequencies)
    return values.length > 0 ? Math.max(...values) : 0
  }, [tagFrequencies])

  if (sortedTags.length === 0) {
    return null
  }

  function getTagSize(freq: number): string {
    if (maxFreq === 0) return 'tag-cloud__tag--sm'
    const ratio = freq / maxFreq
    if (ratio >= 0.8) return 'tag-cloud__tag--xl'
    if (ratio >= 0.6) return 'tag-cloud__tag--lg'
    if (ratio >= 0.4) return 'tag-cloud__tag--md'
    if (ratio >= 0.2) return 'tag-cloud__tag--sm'
    return 'tag-cloud__tag--xs'
  }

  return (
    <div className="tag-cloud">
      <div className="tag-cloud__header">
        <span className="tag-cloud__title">标签云</span>
        <span className="tag-cloud__count">
          共 {sortedTags.length} 个标签
        </span>
      </div>
      <div className="tag-cloud__tags">
        {sortedTags.map(([tag, freq]) => {
          const isSelected = selectedTags?.has(tag) ?? false
          return (
            <button
              key={tag}
              type="button"
              className={`tag-cloud__tag ${getTagSize(freq)} ${
                isSelected ? 'tag-cloud__tag--selected' : ''
              }`}
              onClick={() => onTagClick?.(tag)}
              title={`${tag}（${freq} 条）`}
            >
              {tag}
              <span className="tag-cloud__freq">{freq}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
