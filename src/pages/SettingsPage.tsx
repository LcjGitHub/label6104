import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTagAlias } from '../context/TagAliasContext'
import { getAllDefaultTags } from '../data/mockData'

export default function SettingsPage() {
  const { aliasMap, setAlias, removeAlias } = useTagAlias()
  const allDefaultTags = getAllDefaultTags()

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [addingTag, setAddingTag] = useState<string | null>(null)
  const [addValue, setAddValue] = useState('')

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

  const tagsWithAlias = allDefaultTags.filter((tag) => aliasMap[tag])
  const tagsWithoutAlias = allDefaultTags.filter((tag) => !aliasMap[tag])

  return (
    <div className="page settings-page">
      <nav className="breadcrumb">
        <Link to="/">书目典藏</Link>
        <span aria-hidden="true"> / </span>
        <span>设置</span>
      </nav>

      <header className="settings-header">
        <h1>设置</h1>
        <p className="settings-header__desc">管理标签别名，为默认标签设置个性化名称</p>
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
    </div>
  )
}
