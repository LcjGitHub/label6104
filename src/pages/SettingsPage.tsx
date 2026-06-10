import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTagAlias } from '../context/TagAliasContext'
import {
  getAllDefaultTags,
  getCustomMilestoneMessages,
  setCustomMilestoneMessage,
  resetCustomMilestoneMessage,
  resetAllCustomMilestoneMessages,
  DEFAULT_MILESTONE_MESSAGES,
  MILESTONE_LEVELS,
} from '../data/mockData'
import type { MilestoneLevel, CustomMilestoneMessage } from '../types'

export default function SettingsPage() {
  const { aliasMap, setAlias, removeAlias } = useTagAlias()
  const allDefaultTags = getAllDefaultTags()

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [addingTag, setAddingTag] = useState<string | null>(null)
  const [addValue, setAddValue] = useState('')

  const [milestoneRefreshKey, setMilestoneRefreshKey] = useState(0)
  const [editingMilestone, setEditingMilestone] = useState<MilestoneLevel | null>(null)
  const [milestoneEditTitle, setMilestoneEditTitle] = useState('')
  const [milestoneEditContent, setMilestoneEditContent] = useState('')

  const customMilestoneMessages = useMemo(() => {
    return getCustomMilestoneMessages()
  }, [milestoneRefreshKey])

  const handleStartEdit = useCallback((tag: string) => {
    setEditingTag(tag)
    setEditValue(aliasMap[tag] ?? '')
  }, [aliasMap])

  const handleCancelEdit = useCallback(() => {
    setEditingTag(null)
    setEditValue('')
  }, [])

  const handleSaveEdit = useCallback((originalTag: string) => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== originalTag) {
      setAlias(originalTag, trimmed)
    } else if (!trimmed) {
      removeAlias(originalTag)
    }
    setEditingTag(null)
    setEditValue('')
  }, [editValue, setAlias, removeAlias])

  const handleStartAdd = useCallback((tag: string) => {
    setAddingTag(tag)
    setAddValue('')
  }, [])

  const handleCancelAdd = useCallback(() => {
    setAddingTag(null)
    setAddValue('')
  }, [])

  const handleSaveAdd = useCallback((originalTag: string) => {
    const trimmed = addValue.trim()
    if (trimmed && trimmed !== originalTag) {
      setAlias(originalTag, trimmed)
    }
    setAddingTag(null)
    setAddValue('')
  }, [addValue, setAlias])

  const handleRemoveAlias = useCallback((originalTag: string) => {
    removeAlias(originalTag)
  }, [removeAlias])

  const handleStartMilestoneEdit = useCallback((level: MilestoneLevel) => {
    const custom = customMilestoneMessages[level]
    const defaultMsg = DEFAULT_MILESTONE_MESSAGES[level]
    setEditingMilestone(level)
    setMilestoneEditTitle(custom?.title ?? defaultMsg.title)
    setMilestoneEditContent(custom?.content ?? defaultMsg.content)
  }, [customMilestoneMessages])

  const handleCancelMilestoneEdit = useCallback(() => {
    setEditingMilestone(null)
    setMilestoneEditTitle('')
    setMilestoneEditContent('')
  }, [])

  const handleSaveMilestoneEdit = useCallback((level: MilestoneLevel) => {
    const trimmedTitle = milestoneEditTitle.trim()
    const trimmedContent = milestoneEditContent.trim()
    const custom: CustomMilestoneMessage = {}
    if (trimmedTitle) {
      custom.title = trimmedTitle
    }
    if (trimmedContent) {
      custom.content = trimmedContent
    }
    setCustomMilestoneMessage(level, custom)
    setMilestoneRefreshKey((k) => k + 1)
    setEditingMilestone(null)
    setMilestoneEditTitle('')
    setMilestoneEditContent('')
  }, [milestoneEditTitle, milestoneEditContent])

  const handleResetMilestone = useCallback((level: MilestoneLevel) => {
    resetCustomMilestoneMessage(level)
    setMilestoneRefreshKey((k) => k + 1)
    if (editingMilestone === level) {
      setEditingMilestone(null)
      setMilestoneEditTitle('')
      setMilestoneEditContent('')
    }
  }, [editingMilestone])

  const handleResetAllMilestones = useCallback(() => {
    if (window.confirm('确定要重置所有里程碑的自定义文案吗？此操作不可撤销。')) {
      resetAllCustomMilestoneMessages()
      setMilestoneRefreshKey((k) => k + 1)
      setEditingMilestone(null)
      setMilestoneEditTitle('')
      setMilestoneEditContent('')
    }
  }, [])

  const tagsWithAlias = allDefaultTags.filter((tag) => aliasMap[tag])
  const tagsWithoutAlias = allDefaultTags.filter((tag) => !aliasMap[tag])

  const hasAnyCustomMilestone = MILESTONE_LEVELS.some(
    (level) => customMilestoneMessages[level] !== undefined,
  )

  return (
    <div className="page settings-page">
      <nav className="breadcrumb">
        <Link to="/">书目典藏</Link>
        <span aria-hidden="true"> / </span>
        <span>设置</span>
      </nav>

      <header className="settings-header">
        <h1>设置</h1>
        <p className="settings-header__desc">管理标签别名与里程碑提醒文案</p>
      </header>

      <section className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">标签别名</h2>
          <span className="settings-section__count">
            已设置 {tagsWithAlias.length} / {allDefaultTags.length} 个
          </span>
        </div>

        <p className="settings-section__hint">
          别名仅影响显示，筛选与搜索仍使用原始标签名。
        </p>

        {tagsWithAlias.length > 0 && (
          <div className="tag-alias-list">
            <div className="tag-alias-list__header">
              <span>原始标签</span>
              <span>显示别名</span>
              <span>操作</span>
            </div>
            {tagsWithAlias.map((tag) => {
              const isEditing = editingTag === tag
              return (
                <div key={tag} className="tag-alias-item">
                  <span className="tag-alias-item__original">#{tag}</span>
                  {isEditing ? (
                    <span className="tag-alias-item__edit">
                      <input
                        type="text"
                        className="tag-alias-input"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(tag)
                          else if (e.key === 'Escape') handleCancelEdit()
                        }}
                      />
                      <button
                        type="button"
                        className="tag-alias-btn tag-alias-btn--confirm"
                        onClick={() => handleSaveEdit(tag)}
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        className="tag-alias-btn tag-alias-btn--cancel"
                        onClick={handleCancelEdit}
                      >
                        取消
                      </button>
                    </span>
                  ) : (
                    <span className="tag-alias-item__alias">
                      → {aliasMap[tag]}
                    </span>
                  )}
                  {!isEditing && (
                    <span className="tag-alias-item__actions">
                      <button
                        type="button"
                        className="tag-alias-action"
                        onClick={() => handleStartEdit(tag)}
                        title="编辑别名"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="tag-alias-action tag-alias-action--delete"
                        onClick={() => handleRemoveAlias(tag)}
                        title="删除别名"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tagsWithoutAlias.length > 0 && (
          <div className="tag-alias-unassigned">
            <h3 className="tag-alias-unassigned__title">未设置别名的标签</h3>
            <div className="tag-alias-unassigned__tags">
              {tagsWithoutAlias.map((tag) => {
                const isAdding = addingTag === tag
                return (
                  <div key={tag} className="tag-alias-unassigned__item">
                    <span className="tag-alias-unassigned__tag">#{tag}</span>
                    {isAdding ? (
                      <span className="tag-alias-unassigned__edit">
                        <input
                          type="text"
                          className="tag-alias-input"
                          value={addValue}
                          autoFocus
                          placeholder={`输入「${tag}」的别名…`}
                          onChange={(e) => setAddValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveAdd(tag)
                            else if (e.key === 'Escape') handleCancelAdd()
                          }}
                        />
                        <button
                          type="button"
                          className="tag-alias-btn tag-alias-btn--confirm"
                          onClick={() => handleSaveAdd(tag)}
                          disabled={!addValue.trim() || addValue.trim() === tag}
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          className="tag-alias-btn tag-alias-btn--cancel"
                          onClick={handleCancelAdd}
                        >
                          取消
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="tag-alias-add-btn"
                        onClick={() => handleStartAdd(tag)}
                      >
                        + 设置别名
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {allDefaultTags.length === 0 && (
          <p className="empty-state">暂无标签可配置。</p>
        )}
      </section>

      <section className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">里程碑提醒</h2>
          <button
            type="button"
            className="settings-section__reset-btn"
            onClick={handleResetAllMilestones}
            disabled={!hasAnyCustomMilestone}
          >
            重置全部
          </button>
        </div>

        <p className="settings-section__hint">
          自定义阅读里程碑的标题与文案，保存后将在提示时优先使用。
        </p>

        <div className="milestone-edit-list">
          {MILESTONE_LEVELS.map((level) => {
            const defaultMsg = DEFAULT_MILESTONE_MESSAGES[level]
            const custom = customMilestoneMessages[level]
            const isEditing = editingMilestone === level
            const hasCustom = custom !== undefined

            return (
              <div
                key={level}
                className={`milestone-edit-item milestone-edit-item--level-${level}`}
              >
                <div className="milestone-edit-item__header">
                  <div className="milestone-edit-item__level">
                    <span className="milestone-edit-item__emoji" aria-hidden="true">
                      {custom?.emoji ?? defaultMsg.emoji}
                    </span>
                    <span className="milestone-edit-item__badge">{level}%</span>
                  </div>
                  {hasCustom && (
                    <span className="milestone-edit-item__custom-tag">已自定义</span>
                  )}
                </div>

                {isEditing ? (
                  <div className="milestone-edit-item__form">
                    <label className="milestone-edit-item__label">
                      <span>标题</span>
                      <input
                        type="text"
                        className="milestone-edit-item__input milestone-edit-item__input--title"
                        value={milestoneEditTitle}
                        onChange={(e) => setMilestoneEditTitle(e.target.value)}
                        placeholder={defaultMsg.title}
                        maxLength={20}
                      />
                    </label>
                    <label className="milestone-edit-item__label">
                      <span>内容</span>
                      <textarea
                        className="milestone-edit-item__input milestone-edit-item__input--content"
                        value={milestoneEditContent}
                        onChange={(e) => setMilestoneEditContent(e.target.value)}
                        placeholder={defaultMsg.content}
                        rows={2}
                        maxLength={80}
                      />
                    </label>
                    <div className="milestone-edit-item__actions">
                      <button
                        type="button"
                        className="milestone-edit-item__btn milestone-edit-item__btn--confirm"
                        onClick={() => handleSaveMilestoneEdit(level)}
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        className="milestone-edit-item__btn milestone-edit-item__btn--cancel"
                        onClick={handleCancelMilestoneEdit}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="milestone-edit-item__preview">
                    <h4 className="milestone-edit-item__preview-title">
                      {custom?.title ?? defaultMsg.title}
                    </h4>
                    <p className="milestone-edit-item__preview-content">
                      {custom?.content ?? defaultMsg.content}
                    </p>
                    <div className="milestone-edit-item__actions">
                      <button
                        type="button"
                        className="milestone-edit-item__btn milestone-edit-item__btn--edit"
                        onClick={() => handleStartMilestoneEdit(level)}
                      >
                        编辑
                      </button>
                      {hasCustom && (
                        <button
                          type="button"
                          className="milestone-edit-item__btn milestone-edit-item__btn--reset"
                          onClick={() => handleResetMilestone(level)}
                        >
                          重置
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
