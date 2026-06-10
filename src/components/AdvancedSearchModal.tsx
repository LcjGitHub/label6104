import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AdvancedSearchConditions, SearchPreset } from '../types'
import { useTagAlias } from '../context/TagAliasContext'
import { resolveTagToOriginal } from '../data/mockData'

const PRESETS_STORAGE_KEY = 'footnote-archive-search-presets'

export const DEFAULT_CONDITIONS: AdvancedSearchConditions = {
  pageRange: { min: null, max: null },
  tags: [],
  tagMatchMode: 'any',
  readStatus: 'all',
  favoriteStatus: 'all',
}

function readPresets(): SearchPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePresets(presets: SearchPreset[]): void {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
}

interface AdvancedSearchModalProps {
  open: boolean
  onClose: () => void
  onApply: (conditions: AdvancedSearchConditions) => void
  conditions: AdvancedSearchConditions
  allTags: string[]
}

export default function AdvancedSearchModal({
  open,
  onClose,
  onApply,
  conditions,
  allTags,
}: AdvancedSearchModalProps) {
  const [local, setLocal] = useState<AdvancedSearchConditions>(conditions)
  const [presets, setPresets] = useState<SearchPreset[]>(() => readPresets())
  const [presetName, setPresetName] = useState('')
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { getDisplayName } = useTagAlias()

  useEffect(() => {
    if (open) {
      setLocal(conditions)
      setShowPresetSave(false)
      setPresetName('')
      setTagInput('')
    }
  }, [open, conditions])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const pageRangeInvalid = useMemo(() => {
    const { min, max } = local.pageRange
    if (min === null || max === null) return false
    return min > max
  }, [local.pageRange])

  const updateLocal = useCallback(
    <K extends keyof AdvancedSearchConditions>(
      key: K,
      value: AdvancedSearchConditions[K],
    ) => {
      setLocal((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const handleApply = useCallback(() => {
    if (pageRangeInvalid) return
    onApply(local)
    onClose()
  }, [local, onApply, onClose, pageRangeInvalid])

  const handleReset = useCallback(() => {
    onApply(DEFAULT_CONDITIONS)
    onClose()
  }, [onApply, onClose])

  const handleSavePreset = useCallback(() => {
    const name = presetName.trim()
    if (!name) return
    const newPreset: SearchPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      conditions: { ...local },
      createdAt: Date.now(),
    }
    const updated = [...presets, newPreset]
    writePresets(updated)
    setPresets(updated)
    setPresetName('')
    setShowPresetSave(false)
  }, [presetName, local, presets])

  const handleLoadPreset = useCallback(
    (preset: SearchPreset) => {
      setLocal({ ...preset.conditions })
      onApply(preset.conditions)
      onClose()
    },
    [onApply, onClose],
  )

  const handleDeletePreset = useCallback(
    (presetId: string) => {
      const updated = presets.filter((p) => p.id !== presetId)
      writePresets(updated)
      setPresets(updated)
    },
    [presets],
  )

  const addTag = useCallback(
    (tag: string) => {
      const resolved = resolveTagToOriginal(tag)
      if (!resolved || local.tags.includes(resolved)) return
      updateLocal('tags', [...local.tags, resolved])
      setTagInput('')
    },
    [local.tags, updateLocal],
  )

  const removeTag = useCallback(
    (tag: string) => {
      updateLocal(
        'tags',
        local.tags.filter((t) => t !== tag),
      )
    },
    [local.tags, updateLocal],
  )

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(tagInput)
      }
    },
    [tagInput, addTag],
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose],
  )

  if (!open) return null

  const hasConditions =
    local.pageRange.min !== null ||
    local.pageRange.max !== null ||
    local.tags.length > 0 ||
    local.readStatus !== 'all' ||
    local.favoriteStatus !== 'all'

  const canApply = hasConditions && !pageRangeInvalid

  return (
    <div
      className="adv-search-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="高级搜索"
    >
      <div className="adv-search-panel" ref={panelRef}>
        <div className="adv-search-header">
          <h2 className="adv-search-title">高级搜索</h2>
          <button
            type="button"
            className="adv-search-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="adv-search-body">
          <section className="adv-search-section">
            <h3 className="adv-search-section-title">页码范围</h3>
            <div className="adv-search-page-range">
              <div className="adv-search-field">
                <label className="adv-search-label" htmlFor="adv-page-min">
                  起始页
                </label>
                <input
                  id="adv-page-min"
                  type="number"
                  className={`adv-search-input adv-search-input--number ${pageRangeInvalid ? 'adv-search-input--error' : ''}`}
                  placeholder="最小"
                  min={1}
                  value={local.pageRange.min ?? ''}
                  onChange={(e) =>
                    updateLocal('pageRange', {
                      ...local.pageRange,
                      min: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  aria-invalid={pageRangeInvalid}
                />
              </div>
              <span className="adv-search-range-sep">—</span>
              <div className="adv-search-field">
                <label className="adv-search-label" htmlFor="adv-page-max">
                  结束页
                </label>
                <input
                  id="adv-page-max"
                  type="number"
                  className={`adv-search-input adv-search-input--number ${pageRangeInvalid ? 'adv-search-input--error' : ''}`}
                  placeholder="最大"
                  min={1}
                  value={local.pageRange.max ?? ''}
                  onChange={(e) =>
                    updateLocal('pageRange', {
                      ...local.pageRange,
                      max: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  aria-invalid={pageRangeInvalid}
                />
              </div>
            </div>
            {pageRangeInvalid && (
              <p className="adv-search-error" role="alert">
                起始页不能大于结束页
              </p>
            )}
          </section>

          <section className="adv-search-section">
            <h3 className="adv-search-section-title">标签组合</h3>
            <div className="adv-search-tag-match">
              <label className="adv-search-label">匹配模式</label>
              <div className="adv-search-radio-group">
                <label className="adv-search-radio">
                  <input
                    type="radio"
                    name="tagMatchMode"
                    value="any"
                    checked={local.tagMatchMode === 'any'}
                    onChange={() => updateLocal('tagMatchMode', 'any')}
                  />
                  <span>满足任一</span>
                </label>
                <label className="adv-search-radio">
                  <input
                    type="radio"
                    name="tagMatchMode"
                    value="all"
                    checked={local.tagMatchMode === 'all'}
                    onChange={() => updateLocal('tagMatchMode', 'all')}
                  />
                  <span>同时满足</span>
                </label>
              </div>
            </div>
            <div className="adv-search-tag-input-row">
              <input
                type="text"
                className="adv-search-input"
                placeholder="输入标签后回车添加…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
            </div>
            {local.tags.length > 0 && (
              <div className="adv-search-selected-tags">
                {local.tags.map((tag) => (
                  <span key={tag} className="adv-search-tag-chip">
                    #{getDisplayName(tag)}
                    <button
                      type="button"
                      className="adv-search-tag-remove"
                      onClick={() => removeTag(tag)}
                      aria-label={`移除标签「${tag}」`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {allTags.length > 0 && (
              <div className="adv-search-tag-suggestions">
                <span className="adv-search-label">可选标签：</span>
                <div className="adv-search-tag-options">
                  {allTags
                    .filter((t) => !local.tags.includes(t))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="adv-search-tag-option"
                        onClick={() => addTag(tag)}
                      >
                        {getDisplayName(tag)}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </section>

          <section className="adv-search-section">
            <h3 className="adv-search-section-title">已读状态</h3>
            <div className="adv-search-radio-group">
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="readStatus"
                  value="all"
                  checked={local.readStatus === 'all'}
                  onChange={() => updateLocal('readStatus', 'all')}
                />
                <span>全部</span>
              </label>
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="readStatus"
                  value="read"
                  checked={local.readStatus === 'read'}
                  onChange={() => updateLocal('readStatus', 'read')}
                />
                <span>仅已读</span>
              </label>
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="readStatus"
                  value="unread"
                  checked={local.readStatus === 'unread'}
                  onChange={() => updateLocal('readStatus', 'unread')}
                />
                <span>仅未读</span>
              </label>
            </div>
          </section>

          <section className="adv-search-section">
            <h3 className="adv-search-section-title">收藏状态</h3>
            <div className="adv-search-radio-group">
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="favoriteStatus"
                  value="all"
                  checked={local.favoriteStatus === 'all'}
                  onChange={() => updateLocal('favoriteStatus', 'all')}
                />
                <span>全部</span>
              </label>
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="favoriteStatus"
                  value="favorited"
                  checked={local.favoriteStatus === 'favorited'}
                  onChange={() => updateLocal('favoriteStatus', 'favorited')}
                />
                <span>仅已收藏</span>
              </label>
              <label className="adv-search-radio">
                <input
                  type="radio"
                  name="favoriteStatus"
                  value="not-favorited"
                  checked={local.favoriteStatus === 'not-favorited'}
                  onChange={() => updateLocal('favoriteStatus', 'not-favorited')}
                />
                <span>仅未收藏</span>
              </label>
            </div>
          </section>

          {presets.length > 0 && (
            <section className="adv-search-section">
              <h3 className="adv-search-section-title">已保存的预设方案</h3>
              <p className="adv-search-hint">点击方案将自动应用并关闭弹窗</p>
              <div className="adv-search-presets">
                {presets.map((preset) => (
                  <div key={preset.id} className="adv-search-preset-item">
                    <button
                      type="button"
                      className="adv-search-preset-name"
                      onClick={() => handleLoadPreset(preset)}
                      title={JSON.stringify(preset.conditions, null, 2)}
                    >
                      {preset.name}
                    </button>
                    <button
                      type="button"
                      className="adv-search-preset-delete"
                      onClick={() => handleDeletePreset(preset.id)}
                      aria-label={`删除预设「${preset.name}」`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="adv-search-footer">
          <div className="adv-search-footer-left">
            {showPresetSave ? (
              <div className="adv-search-save-row">
                <input
                  type="text"
                  className="adv-search-input adv-search-input--preset"
                  placeholder="输入方案名称…"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePreset()
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="adv-search-btn adv-search-btn--confirm"
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                >
                  保存
                </button>
                <button
                  type="button"
                  className="adv-search-btn adv-search-btn--cancel"
                  onClick={() => setShowPresetSave(false)}
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="adv-search-btn adv-search-btn--save"
                onClick={() => setShowPresetSave(true)}
              >
                保存为预设方案
              </button>
            )}
          </div>
          <div className="adv-search-footer-right">
            <button
              type="button"
              className="adv-search-btn adv-search-btn--reset"
              onClick={handleReset}
            >
              重置
            </button>
            <button
              type="button"
              className="adv-search-btn adv-search-btn--apply"
              onClick={handleApply}
              disabled={!canApply}
            >
              应用筛选
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
