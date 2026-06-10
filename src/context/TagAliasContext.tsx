import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { getTagAliasMap, setTagAlias as setDataAlias, removeTagAlias as removeDataAlias } from '../data/mockData'

interface TagAliasContextValue {
  aliasMap: Record<string, string>
  getDisplayName: (tag: string) => string
  setAlias: (originalTag: string, alias: string) => void
  removeAlias: (originalTag: string) => void
  refreshAliases: () => void
}

const TagAliasContext = createContext<TagAliasContextValue | undefined>(undefined)

export function TagAliasProvider({ children }: { children: ReactNode }) {
  const [aliasMap, setAliasMap] = useState<Record<string, string>>(() => getTagAliasMap())

  const refreshAliases = useCallback(() => {
    setAliasMap(getTagAliasMap())
  }, [])

  const getDisplayName = useCallback(
    (tag: string) => aliasMap[tag] ?? tag,
    [aliasMap],
  )

  const setAlias = useCallback(
    (originalTag: string, alias: string) => {
      setDataAlias(originalTag, alias)
      refreshAliases()
    },
    [refreshAliases],
  )

  const removeAlias = useCallback(
    (originalTag: string) => {
      removeDataAlias(originalTag)
      refreshAliases()
    },
    [refreshAliases],
  )

  return (
    <TagAliasContext.Provider value={{ aliasMap, getDisplayName, setAlias, removeAlias, refreshAliases }}>
      {children}
    </TagAliasContext.Provider>
  )
}

export function useTagAlias() {
  const context = useContext(TagAliasContext)
  if (context === undefined) {
    throw new Error('useTagAlias must be used within a TagAliasProvider')
  }
  return context
}
