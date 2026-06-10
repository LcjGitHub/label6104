import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Book, Footnote, Bookmark, BookmarkGroup, ReadingProgress } from '../types'
import {
  addBookmark,
  removeBookmark,
  toggleBookmark,
  setBookmarkGroup,
  getBookmarks,
  getBookmarkByFootnoteId,
  isBookmarked,
  getBookmarkedFootnotes,
  getBookmarkedFootnotesByGroup,
  updateBookmark,
  getBookmarkGroups,
  getBookmarkGroupById,
  createBookmarkGroup,
  updateBookmarkGroup,
  deleteBookmarkGroup,
  getBookmarkCountByGroup,
  addUserTag,
  removeUserTag,
  getUserTagsForFootnote,
  isDefaultTag,
  getTagAliases,
  getTagAliasMap,
  getTagDisplayName,
  setTagAlias,
  removeTagAlias,
  getAllDefaultTags,
  getOriginalTagByAlias,
  resolveTagToOriginal,
  matchesTagWithAlias,
  getReadingProgress,
  isFootnoteRead,
  getReadFootnoteIds,
  markFootnoteAsRead,
  markFootnotesAsRead,
  resetReadingProgress,
  calculateProgressPercentage,
  getAllProgressSummaries,
  getOverallStats,
  formatAnnotationsAsJSON,
  formatAnnotationsAsText,
  formatAnnotationsAsCSV,
  getBookById,
  getFootnotesByBookId,
  getFootnoteById,
  markMilestoneAchieved,
  getAchievedMilestoneLevels,
  isMilestoneAchieved,
  checkNewMilestones,
  checkNewMilestonesByCount,
  getBookMilestones,
  dismissMilestone,
  getUndismissedMilestones,
  getMilestoneMessage,
  DEFAULT_MILESTONE_MESSAGES,
  MILESTONE_LEVELS,
  getCustomMilestoneMessages,
  setCustomMilestoneMessage,
  resetCustomMilestoneMessage,
  resetAllCustomMilestoneMessages,
} from './mockData'

const STORAGE_KEYS = [
  'footnote-archive-bookmarks',
  'footnote-archive-bookmark-groups',
  'footnote-archive-user-tags',
  'footnote-archive-progress',
  'footnote-archive-tag-aliases',
  'footnote-archive-milestones',
  'footnote-archive-milestone-custom-messages',
]

beforeEach(() => {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
})

const MOCK_BOOK: Book = {
  id: 'book-001',
  title: '史记选译',
  author: '司马迁 著 / 韩兆琦 译注',
  publisher: '中华书局',
  year: 2018,
  noteType: 'footnote',
  footnoteCount: 12,
  description: '《史记》选本，附详细译注。',
}

const MOCK_FOOTNOTE: Footnote = {
  id: 'fn-001-01',
  bookId: 'book-001',
  number: 1,
  page: 12,
  originalText: '项羽者，下相人也，字羽。',
  annotation: '下相：秦时县名。',
  tags: ['人名', '地名'],
}

describe('书签操作', () => {
  describe('addBookmark', () => {
    it('应成功添加书签并返回书签对象', () => {
      const bm = addBookmark('fn-001-01', 'book-001')

      expect(bm.footnoteId).toBe('fn-001-01')
      expect(bm.bookId).toBe('book-001')
      expect(bm.groupId).toBeNull()
      expect(bm.id).toMatch(/^bm-/)
      expect(bm.createdAt).toBeTypeOf('number')
    })

    it('添加书签时指定分组应正确设置 groupId', () => {
      const bm = addBookmark('fn-001-02', 'book-001', 'group-important')

      expect(bm.groupId).toBe('group-important')
    })

    it('重复添加同一脚注的书签应返回已存在的书签', () => {
      const first = addBookmark('fn-001-01', 'book-001')
      const second = addBookmark('fn-001-01', 'book-001')

      expect(second.id).toBe(first.id)
      expect(getBookmarks()).toHaveLength(1)
    })

    it('添加书签后应能通过 isBookmarked 检索到', () => {
      addBookmark('fn-001-01', 'book-001')

      expect(isBookmarked('fn-001-01')).toBe(true)
      expect(isBookmarked('fn-001-02')).toBe(false)
    })
  })

  describe('removeBookmark', () => {
    it('应成功删除指定脚注的书签', () => {
      addBookmark('fn-001-01', 'book-001')
      expect(isBookmarked('fn-001-01')).toBe(true)

      removeBookmark('fn-001-01')
      expect(isBookmarked('fn-001-01')).toBe(false)
      expect(getBookmarks()).toHaveLength(0)
    })

    it('删除不存在的书签应不报错', () => {
      expect(() => removeBookmark('fn-nonexistent')).not.toThrow()
    })
  })

  describe('toggleBookmark', () => {
    it('未书签状态切换应添加书签', () => {
      const result = toggleBookmark('fn-001-01', 'book-001')

      expect(result.bookmarked).toBe(true)
      expect(isBookmarked('fn-001-01')).toBe(true)
    })

    it('已书签状态切换应移除书签', () => {
      addBookmark('fn-001-01', 'book-001')
      const result = toggleBookmark('fn-001-01', 'book-001')

      expect(result.bookmarked).toBe(false)
      expect(isBookmarked('fn-001-01')).toBe(false)
    })
  })

  describe('setBookmarkGroup', () => {
    it('应成功设置书签分组', () => {
      addBookmark('fn-001-01', 'book-001')
      setBookmarkGroup('fn-001-01', 'group-review')

      const bm = getBookmarkByFootnoteId('fn-001-01')
      expect(bm?.groupId).toBe('group-review')
    })

    it('设置 groupId 为 null 应清除分组', () => {
      addBookmark('fn-001-01', 'book-001')
      setBookmarkGroup('fn-001-01', 'group-review')
      setBookmarkGroup('fn-001-01', null)

      const bm = getBookmarkByFootnoteId('fn-001-01')
      expect(bm?.groupId).toBeNull()
    })

    it('对不存在的书签设置分组应不报错', () => {
      expect(() => setBookmarkGroup('fn-nonexistent', 'group-review')).not.toThrow()
    })
  })

  describe('updateBookmark', () => {
    it('应成功更新书签的指定字段', () => {
      const bm = addBookmark('fn-001-01', 'book-001')
      const updated = updateBookmark(bm.id, { groupId: 'group-important' })

      expect(updated?.groupId).toBe('group-important')
    })

    it('更新不存在的书签应返回 undefined', () => {
      expect(updateBookmark('bm-nonexistent', { groupId: null })).toBeUndefined()
    })
  })

  describe('getBookmarkByFootnoteId', () => {
    it('应返回对应脚注的书签', () => {
      addBookmark('fn-001-01', 'book-001')

      const bm = getBookmarkByFootnoteId('fn-001-01')
      expect(bm).toBeDefined()
      expect(bm!.footnoteId).toBe('fn-001-01')
    })

    it('脚注未书签时应返回 undefined', () => {
      expect(getBookmarkByFootnoteId('fn-001-01')).toBeUndefined()
    })
  })

  describe('getBookmarkedFootnotes', () => {
    it('应返回书签脚注的完整信息（含脚注、书籍、书签）', () => {
      addBookmark('fn-001-01', 'book-001')
      const result = getBookmarkedFootnotes()

      expect(result).toHaveLength(1)
      expect(result[0].footnote.id).toBe('fn-001-01')
      expect(result[0].book.id).toBe('book-001')
      expect(result[0].bookmark.footnoteId).toBe('fn-001-01')
    })

    it('书签按创建时间倒序排列', () => {
      vi.useFakeTimers()
      addBookmark('fn-001-01', 'book-001')
      vi.advanceTimersByTime(10)
      addBookmark('fn-001-02', 'book-001')
      const result = getBookmarkedFootnotes()

      expect(result[0].footnote.id).toBe('fn-001-02')
      expect(result[1].footnote.id).toBe('fn-001-01')
      vi.useRealTimers()
    })
  })

  describe('getBookmarkedFootnotesByGroup', () => {
    it('应按分组过滤书签脚注', () => {
      addBookmark('fn-001-01', 'book-001', 'group-important')
      addBookmark('fn-001-02', 'book-001', 'group-review')

      const important = getBookmarkedFootnotesByGroup('group-important')
      expect(important).toHaveLength(1)
      expect(important[0].footnote.id).toBe('fn-001-01')
    })

    it('groupId 为 null 时应返回所有书签', () => {
      addBookmark('fn-001-01', 'book-001', 'group-important')
      addBookmark('fn-001-02', 'book-001')

      const all = getBookmarkedFootnotesByGroup(null)
      expect(all).toHaveLength(2)
    })
  })

  describe('书签分组管理', () => {
    describe('getBookmarkGroups', () => {
      it('无自定义分组时应返回默认分组', () => {
        const groups = getBookmarkGroups()

        expect(groups.length).toBeGreaterThanOrEqual(3)
        const names = groups.map((g) => g.name)
        expect(names).toContain('重要')
        expect(names).toContain('待复习')
        expect(names).toContain('引用参考')
      })
    })

    describe('createBookmarkGroup', () => {
      it('应创建新分组并返回', () => {
        const group = createBookmarkGroup('学习笔记', '#ff0000')

        expect(group.name).toBe('学习笔记')
        expect(group.color).toBe('#ff0000')
        expect(group.id).toMatch(/^group-/)
        expect(getBookmarkGroups()).toContainEqual(expect.objectContaining({ name: '学习笔记' }))
      })

      it('名称前后空格应被 trim', () => {
        const group = createBookmarkGroup('  测试  ', '#000')
        expect(group.name).toBe('测试')
      })
    })

    describe('updateBookmarkGroup', () => {
      it('应更新非默认分组的名称和颜色', () => {
        const group = createBookmarkGroup('旧名', '#000')
        const updated = updateBookmarkGroup(group.id, { name: '新名', color: '#fff' })

        expect(updated?.name).toBe('新名')
        expect(updated?.color).toBe('#fff')
      })

      it('默认分组不可更新', () => {
        const result = updateBookmarkGroup('group-important', { name: '修改' })
        expect(result).toBeUndefined()
      })

      it('更新不存在的分组应返回 undefined', () => {
        expect(updateBookmarkGroup('group-nonexistent', { name: '测试' })).toBeUndefined()
      })
    })

    describe('deleteBookmarkGroup', () => {
      it('应删除自定义分组', () => {
        const group = createBookmarkGroup('待删', '#000')
        expect(deleteBookmarkGroup(group.id)).toBe(true)
        expect(getBookmarkGroupById(group.id)).toBeUndefined()
      })

      it('默认分组不可删除', () => {
        expect(deleteBookmarkGroup('group-important')).toBe(false)
      })

      it('删除分组后该书签的 groupId 应被置空', () => {
        const group = createBookmarkGroup('待删', '#000')
        addBookmark('fn-001-01', 'book-001', group.id)

        deleteBookmarkGroup(group.id)

        const bm = getBookmarkByFootnoteId('fn-001-01')
        expect(bm?.groupId).toBeNull()
      })
    })

    describe('getBookmarkCountByGroup', () => {
      it('应正确统计分组内书签数量', () => {
        addBookmark('fn-001-01', 'book-001', 'group-important')
        addBookmark('fn-001-02', 'book-001', 'group-review')
        addBookmark('fn-001-03', 'book-001')

        expect(getBookmarkCountByGroup('group-important')).toBe(1)
        expect(getBookmarkCountByGroup('group-review')).toBe(1)
        expect(getBookmarkCountByGroup(null)).toBe(3)
      })
    })
  })
})

describe('标签操作', () => {
  describe('addUserTag', () => {
    it('应成功添加用户标签', () => {
      const result = addUserTag('fn-001-01', '自定义标签')

      expect(result).toContain('自定义标签')
      expect(getUserTagsForFootnote('fn-001-01')).toContain('自定义标签')
    })

    it('空字符串标签不应被添加', () => {
      const result = addUserTag('fn-001-01', '  ')

      expect(result).toEqual([])
    })

    it('标签前后空格应被 trim', () => {
      const result = addUserTag('fn-001-01', '  标签  ')

      expect(result).toContain('标签')
      expect(result).not.toContain('  标签  ')
    })

    it('重复标签不应被添加', () => {
      addUserTag('fn-001-01', '标签')
      const result = addUserTag('fn-001-01', '标签')

      expect(result).toEqual(['标签'])
    })

    it('应为不同脚注独立添加标签', () => {
      addUserTag('fn-001-01', '标签A')
      addUserTag('fn-001-02', '标签B')

      expect(getUserTagsForFootnote('fn-001-01')).toEqual(['标签A'])
      expect(getUserTagsForFootnote('fn-001-02')).toEqual(['标签B'])
    })
  })

  describe('removeUserTag', () => {
    it('应成功移除指定用户标签', () => {
      addUserTag('fn-001-01', '标签A')
      addUserTag('fn-001-01', '标签B')

      const result = removeUserTag('fn-001-01', '标签A')

      expect(result).toEqual(['标签B'])
      expect(getUserTagsForFootnote('fn-001-01')).toEqual(['标签B'])
    })

    it('移除最后一个标签后应清空该脚注的用户标签记录', () => {
      addUserTag('fn-001-01', '唯一标签')
      removeUserTag('fn-001-01', '唯一标签')

      expect(getUserTagsForFootnote('fn-001-01')).toEqual([])
    })

    it('移除不存在的标签应不影响其他标签', () => {
      addUserTag('fn-001-01', '标签A')
      removeUserTag('fn-001-01', '不存在的标签')

      expect(getUserTagsForFootnote('fn-001-01')).toEqual(['标签A'])
    })
  })

  describe('isDefaultTag', () => {
    it('默认标签应返回 true', () => {
      expect(isDefaultTag('fn-001-01', '人名')).toBe(true)
      expect(isDefaultTag('fn-001-01', '地名')).toBe(true)
    })

    it('用户自定义标签应返回 false', () => {
      addUserTag('fn-001-01', '自定义')
      expect(isDefaultTag('fn-001-01', '自定义')).toBe(false)
    })

    it('不存在的标签应返回 false', () => {
      expect(isDefaultTag('fn-001-01', '不存在')).toBe(false)
    })
  })

  describe('标签别名', () => {
    describe('setTagAlias', () => {
      it('应成功设置标签别名', () => {
        const alias = setTagAlias('人名', '人物')

        expect(alias.originalTag).toBe('人名')
        expect(alias.alias).toBe('人物')
        expect(getTagDisplayName('人名')).toBe('人物')
      })

      it('更新已有标签的别名应覆盖旧值', () => {
        setTagAlias('人名', '人物')
        setTagAlias('人名', '人物名')

        expect(getTagDisplayName('人名')).toBe('人物名')
        expect(getTagAliases()).toHaveLength(1)
      })
    })

    describe('removeTagAlias', () => {
      it('移除别名后显示名应恢复为原始标签', () => {
        setTagAlias('人名', '人物')
        removeTagAlias('人名')

        expect(getTagDisplayName('人名')).toBe('人名')
      })
    })

    describe('getTagAliasMap', () => {
      it('应返回所有别名的映射表', () => {
        setTagAlias('人名', '人物')
        setTagAlias('地名', '地点')

        const map = getTagAliasMap()
        expect(map['人名']).toBe('人物')
        expect(map['地名']).toBe('地点')
      })

      it('无别名时应返回空对象', () => {
        expect(getTagAliasMap()).toEqual({})
      })
    })

    describe('getOriginalTagByAlias', () => {
      it('应通过别名找到原始标签', () => {
        setTagAlias('人名', '人物')

        expect(getOriginalTagByAlias('人物')).toBe('人名')
      })

      it('大小写不敏感查找', () => {
        setTagAlias('人名', 'RenWu')

        expect(getOriginalTagByAlias('renwu')).toBe('人名')
      })

      it('不存在的别名应返回 undefined', () => {
        expect(getOriginalTagByAlias('不存在')).toBeUndefined()
      })
    })

    describe('resolveTagToOriginal', () => {
      it('默认标签应原样返回', () => {
        expect(resolveTagToOriginal('人名')).toBe('人名')
      })

      it('别名应解析为原始标签', () => {
        setTagAlias('人名', '人物')
        expect(resolveTagToOriginal('人物')).toBe('人名')
      })

      it('空字符串应返回空', () => {
        expect(resolveTagToOriginal('')).toBe('')
        expect(resolveTagToOriginal('  ')).toBe('')
      })

      it('大小写不敏感匹配默认标签', () => {
        const result = resolveTagToOriginal('人名')
        expect(result).toBe('人名')
      })
    })

    describe('matchesTagWithAlias', () => {
      it('直接匹配标签应返回 true', () => {
        expect(matchesTagWithAlias('人名', '人')).toBe(true)
      })

      it('通过别名匹配应返回 true', () => {
        setTagAlias('人名', '人物')
        expect(matchesTagWithAlias('人名', '人物')).toBe(true)
      })

      it('不匹配应返回 false', () => {
        expect(matchesTagWithAlias('人名', 'xyz')).toBe(false)
      })

      it('空搜索词应返回 false', () => {
        expect(matchesTagWithAlias('人名', '')).toBe(false)
      })
    })

    describe('getAllDefaultTags', () => {
      it('应返回所有默认标签（去重且排序）', () => {
        const tags = getAllDefaultTags()

        expect(tags.length).toBeGreaterThan(0)
        expect(tags).toContain('人名')
        expect(tags).toContain('地名')
        expect(tags).toContain('典故')
        expect(tags).toContain('制度')
        const sorted = [...tags].sort()
        expect(tags).toEqual(sorted)
      })

      it('结果中不应有重复标签', () => {
        const tags = getAllDefaultTags()
        expect(new Set(tags).size).toBe(tags.length)
      })
    })
  })
})

describe('阅读进度', () => {
  describe('markFootnoteAsRead', () => {
    it('应成功标记脚注为已读并返回进度', () => {
      const progress = markFootnoteAsRead('book-001', 'fn-001-01')

      expect(progress.bookId).toBe('book-001')
      expect(progress.readFootnoteIds).toContain('fn-001-01')
      expect(progress.readRecords).toHaveLength(1)
      expect(progress.readRecords[0].footnoteId).toBe('fn-001-01')
    })

    it('首次标记应创建进度记录', () => {
      const progress = markFootnoteAsRead('book-001', 'fn-001-01')

      expect(progress.startedAt).toBeTypeOf('number')
      expect(progress.lastReadAt).toBeTypeOf('number')
      expect(progress.totalFootnotes).toBe(12)
    })

    it('重复标记同一脚注不应产生重复记录', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')
      const progress = markFootnoteAsRead('book-001', 'fn-001-01')

      expect(progress.readFootnoteIds).toHaveLength(1)
      expect(progress.readRecords).toHaveLength(1)
    })

    it('标记后 isFootnoteRead 应返回 true', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')

      expect(isFootnoteRead('book-001', 'fn-001-01')).toBe(true)
      expect(isFootnoteRead('book-001', 'fn-001-02')).toBe(false)
    })
  })

  describe('markFootnotesAsRead', () => {
    it('应批量标记多个脚注为已读', () => {
      const progress = markFootnotesAsRead('book-001', ['fn-001-01', 'fn-001-02'])

      expect(progress.readFootnoteIds).toContain('fn-001-01')
      expect(progress.readFootnoteIds).toContain('fn-001-02')
    })

    it('批量标记时已有记录不应重复', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')
      const progress = markFootnotesAsRead('book-001', ['fn-001-01', 'fn-001-02'])

      expect(progress.readFootnoteIds.filter((id) => id === 'fn-001-01')).toHaveLength(1)
    })
  })

  describe('resetReadingProgress', () => {
    it('应重置指定书籍的阅读进度', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')
      resetReadingProgress('book-001')

      expect(getReadingProgress('book-001')).toBeUndefined()
      expect(isFootnoteRead('book-001', 'fn-001-01')).toBe(false)
    })

    it('重置进度应同时重置里程碑', () => {
      markMilestoneAchieved('book-001', 25)
      resetReadingProgress('book-001')

      expect(isMilestoneAchieved('book-001', 25)).toBe(false)
    })
  })

  describe('getReadFootnoteIds', () => {
    it('应返回已读脚注 ID 的 Set', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')
      markFootnoteAsRead('book-001', 'fn-001-02')

      const ids = getReadFootnoteIds('book-001')
      expect(ids).toBeInstanceOf(Set)
      expect(ids.has('fn-001-01')).toBe(true)
      expect(ids.has('fn-001-02')).toBe(true)
      expect(ids.has('fn-001-03')).toBe(false)
    })

    it('无进度记录时应返回空 Set', () => {
      const ids = getReadFootnoteIds('book-001')
      expect(ids.size).toBe(0)
    })
  })

  describe('calculateProgressPercentage', () => {
    it('无进度时应返回 0', () => {
      expect(calculateProgressPercentage('book-001')).toBe(0)
    })

    it('应正确计算阅读进度百分比', () => {
      markFootnotesAsRead('book-001', ['fn-001-01', 'fn-001-02', 'fn-001-03'])

      const pct = calculateProgressPercentage('book-001')
      expect(pct).toBe(25)
    })

    it('全部读完应返回 100', () => {
      const allIds = Array.from({ length: 12 }, (_, i) => `fn-001-${String(i + 1).padStart(2, '0')}`)
      markFootnotesAsRead('book-001', allIds)

      expect(calculateProgressPercentage('book-001')).toBe(100)
    })
  })

  describe('getAllProgressSummaries', () => {
    it('应返回所有书籍的进度摘要', () => {
      const summaries = getAllProgressSummaries()

      expect(summaries.length).toBeGreaterThanOrEqual(4)
      expect(summaries[0]).toHaveProperty('bookId')
      expect(summaries[0]).toHaveProperty('percentage')
    })

    it('应按最近阅读时间倒序排列', () => {
      vi.useFakeTimers()
      markFootnoteAsRead('book-001', 'fn-001-01')
      vi.advanceTimersByTime(10)
      markFootnoteAsRead('book-002', 'fn-002-01')

      const summaries = getAllProgressSummaries()
      expect(summaries[0].bookId).toBe('book-002')
      vi.useRealTimers()
    })
  })

  describe('getOverallStats', () => {
    it('无阅读记录时应返回正确的统计', () => {
      const stats = getOverallStats()

      expect(stats.totalBooks).toBeGreaterThanOrEqual(4)
      expect(stats.booksStarted).toBe(0)
      expect(stats.booksCompleted).toBe(0)
      expect(stats.footnotesRead).toBe(0)
      expect(stats.overallPercentage).toBe(0)
    })

    it('有阅读记录时应正确统计', () => {
      markFootnoteAsRead('book-001', 'fn-001-01')

      const stats = getOverallStats()
      expect(stats.booksStarted).toBeGreaterThanOrEqual(1)
      expect(stats.footnotesRead).toBeGreaterThanOrEqual(1)
      expect(stats.overallPercentage).toBeGreaterThan(0)
    })
  })
})

describe('导出数据格式化', () => {
  const testBook: Book = MOCK_BOOK
  const testFootnotes: Footnote[] = [
    MOCK_FOOTNOTE,
    {
      id: 'fn-001-02',
      bookId: 'book-001',
      number: 2,
      page: 14,
      originalText: '其先乃齐人。',
      annotation: '项氏本齐人。',
      tags: ['人名', '制度'],
    },
  ]

  describe('formatAnnotationsAsJSON', () => {
    it('应输出合法的 JSON 字符串', () => {
      const result = formatAnnotationsAsJSON(testBook, testFootnotes)
      const parsed = JSON.parse(result)

      expect(parsed).toBeDefined()
    })

    it('JSON 应包含书籍信息和注释列表', () => {
      const result = formatAnnotationsAsJSON(testBook, testFootnotes)
      const parsed = JSON.parse(result)

      expect(parsed['书籍信息']['书名']).toBe('史记选译')
      expect(parsed['书籍信息']['作者']).toBe('司马迁 著 / 韩兆琦 译注')
      expect(parsed['书籍信息']['出版社']).toBe('中华书局')
      expect(parsed['书籍信息']['出版年份']).toBe(2018)
      expect(parsed['书籍信息']['注释类型']).toBe('脚注本')
      expect(parsed['注释数量']).toBe(2)
      expect(parsed['注释列表']).toHaveLength(2)
    })

    it('注释列表应包含编号、页码、原文、注解和标签', () => {
      const result = formatAnnotationsAsJSON(testBook, testFootnotes)
      const parsed = JSON.parse(result)
      const first = parsed['注释列表'][0]

      expect(first['编号']).toBe('fn-001-01')
      expect(first['序号']).toBe(1)
      expect(first['页码']).toBe(12)
      expect(first['原文']).toBe('项羽者，下相人也，字羽。')
      expect(first['注解']).toBe('下相：秦时县名。')
      expect(first['标签']).toEqual(['人名', '地名'])
    })

    it('尾注类型应正确显示', () => {
      const endnoteBook = { ...testBook, noteType: 'endnote' as const }
      const result = formatAnnotationsAsJSON(endnoteBook, [])
      const parsed = JSON.parse(result)

      expect(parsed['书籍信息']['注释类型']).toBe('尾注本')
    })
  })

  describe('formatAnnotationsAsText', () => {
    it('应包含书名和作者信息', () => {
      const result = formatAnnotationsAsText(testBook, testFootnotes)

      expect(result).toContain('《史记选译》')
      expect(result).toContain('作者：司马迁 著 / 韩兆琦 译注')
    })

    it('应包含每条注释的原文和注解', () => {
      const result = formatAnnotationsAsText(testBook, testFootnotes)

      expect(result).toContain('项羽者，下相人也，字羽。')
      expect(result).toContain('下相：秦时县名。')
    })

    it('标签应以 # 前缀显示', () => {
      const result = formatAnnotationsAsText(testBook, testFootnotes)

      expect(result).toContain('#人名')
      expect(result).toContain('#地名')
    })

    it('应以分隔线和首尾标记包围', () => {
      const result = formatAnnotationsAsText(testBook, testFootnotes)

      expect(result).toContain('导出完毕')
      expect(result).toContain('='.repeat(60))
    })

    it('注释数量应正确显示', () => {
      const result = formatAnnotationsAsText(testBook, testFootnotes)

      expect(result).toContain('注释数量：2 条')
    })
  })

  describe('formatAnnotationsAsCSV', () => {
    it('应包含 CSV 表头', () => {
      const result = formatAnnotationsAsCSV(testBook, testFootnotes)

      expect(result.startsWith('\uFEFF')).toBe(true)
      const lines = result.replace('\uFEFF', '').split('\n')
      expect(lines[0]).toBe('注释编号;页码;原文;注解;标签')
    })

    it('每条注释应对应一行数据', () => {
      const result = formatAnnotationsAsCSV(testBook, testFootnotes)
      const lines = result.replace('\uFEFF', '').split('\n')

      expect(lines.length).toBe(3)
    })

    it('字段包含分号时应正确转义', () => {
      const footnoteWithSemicolon: Footnote = {
        id: 'fn-test',
        bookId: 'book-001',
        number: 1,
        page: 1,
        originalText: '含;分号的文本',
        annotation: '正常注解',
        tags: ['人名'],
      }
      const result = formatAnnotationsAsCSV(testBook, [footnoteWithSemicolon])
      const lines = result.replace('\uFEFF', '').split('\n')

      expect(lines[1]).toContain('"含;分号的文本"')
    })

    it('字段包含双引号时应正确转义', () => {
      const footnoteWithQuote: Footnote = {
        id: 'fn-test',
        bookId: 'book-001',
        number: 1,
        page: 1,
        originalText: '含"引号"的文本',
        annotation: '正常注解',
        tags: [],
      }
      const result = formatAnnotationsAsCSV(testBook, [footnoteWithQuote])
      const lines = result.replace('\uFEFF', '').split('\n')

      expect(lines[1]).toContain('""引号""')
    })

    it('标签应以中文顿号分隔显示（含别名）', () => {
      const result = formatAnnotationsAsCSV(testBook, testFootnotes)
      const lines = result.replace('\uFEFF', '').split('\n')

      expect(lines[1]).toContain('人名')
    })
  })
})

describe('里程碑', () => {
  describe('markMilestoneAchieved', () => {
    it('应成功标记里程碑', () => {
      const data = markMilestoneAchieved('book-001', 25)

      expect(data.milestones).toHaveLength(1)
      expect(data.milestones[0].level).toBe(25)
      expect(data.milestones[0].dismissed).toBe(false)
    })

    it('重复标记同一里程碑不应产生重复', () => {
      markMilestoneAchieved('book-001', 25)
      const data = markMilestoneAchieved('book-001', 25)

      expect(data.milestones.filter((m) => m.level === 25)).toHaveLength(1)
    })
  })

  describe('checkNewMilestones', () => {
    it('应返回新达到的里程碑等级', () => {
      const result = checkNewMilestones('book-001', 50)

      expect(result).toContain(25)
      expect(result).toContain(50)
    })

    it('已达到的里程碑不应再次返回', () => {
      markMilestoneAchieved('book-001', 25)
      const result = checkNewMilestones('book-001', 50)

      expect(result).not.toContain(25)
      expect(result).toContain(50)
    })
  })

  describe('checkNewMilestonesByCount', () => {
    it('应基于已读/总数计算新里程碑', () => {
      const result = checkNewMilestonesByCount('book-001', 6, 12)

      expect(result).toContain(25)
      expect(result).toContain(50)
    })

    it('总数为 0 应返回空数组', () => {
      expect(checkNewMilestonesByCount('book-001', 0, 0)).toEqual([])
    })
  })

  describe('dismissMilestone', () => {
    it('应将里程碑标记为已忽略', () => {
      markMilestoneAchieved('book-001', 25)
      dismissMilestone('book-001', 25)

      const data = getBookMilestones('book-001')
      const record = data?.milestones.find((m) => m.level === 25)
      expect(record?.dismissed).toBe(true)
    })
  })

  describe('getUndismissedMilestones', () => {
    it('应只返回未忽略的里程碑', () => {
      markMilestoneAchieved('book-001', 25)
      markMilestoneAchieved('book-001', 50)
      dismissMilestone('book-001', 25)

      const undismissed = getUndismissedMilestones('book-001')
      expect(undismissed).toHaveLength(1)
      expect(undismissed[0].level).toBe(50)
    })
  })

  describe('getMilestoneMessage', () => {
    it('应返回默认里程碑消息', () => {
      const msg = getMilestoneMessage(25)
      expect(msg.level).toBe(25)
      expect(msg.title).toBe(DEFAULT_MILESTONE_MESSAGES[25].title)
    })

    it('自定义消息应覆盖默认消息', () => {
      setCustomMilestoneMessage(25, { title: '自定义标题' })
      const msg = getMilestoneMessage(25)

      expect(msg.title).toBe('自定义标题')
      expect(msg.content).toBe(DEFAULT_MILESTONE_MESSAGES[25].content)
    })

    it('页面级自定义应优先级最高', () => {
      setCustomMilestoneMessage(25, { title: '全局标题' })
      const msg = getMilestoneMessage(25, { 25: { title: '页面标题' } })

      expect(msg.title).toBe('页面标题')
    })
  })

  describe('自定义里程碑消息', () => {
    it('设置后应能读取', () => {
      setCustomMilestoneMessage(50, { title: '半程', content: '加油' })

      const custom = getCustomMilestoneMessages()
      expect(custom[50]?.title).toBe('半程')
      expect(custom[50]?.content).toBe('加油')
    })

    it('重置单个等级应只删除该等级', () => {
      setCustomMilestoneMessage(25, { title: 'A' })
      setCustomMilestoneMessage(50, { title: 'B' })
      resetCustomMilestoneMessage(25)

      const custom = getCustomMilestoneMessages()
      expect(custom[25]).toBeUndefined()
      expect(custom[50]?.title).toBe('B')
    })

    it('resetAllCustomMilestoneMessages 应清除所有自定义消息', () => {
      setCustomMilestoneMessage(25, { title: 'A' })
      setCustomMilestoneMessage(50, { title: 'B' })
      resetAllCustomMilestoneMessages()

      expect(getCustomMilestoneMessages()).toEqual({})
    })
  })
})

describe('辅助查询函数', () => {
  describe('getBookById', () => {
    it('应返回对应 ID 的书籍', () => {
      const book = getBookById('book-001')
      expect(book).toBeDefined()
      expect(book!.title).toBe('史记选译')
    })

    it('不存在的 ID 应返回 undefined', () => {
      expect(getBookById('nonexistent')).toBeUndefined()
    })
  })

  describe('getFootnotesByBookId', () => {
    it('应返回指定书籍的脚注列表', () => {
      const fns = getFootnotesByBookId('book-001')
      expect(fns.length).toBe(12)
      expect(fns.every((f) => f.bookId === 'book-001')).toBe(true)
    })

    it('用户标签应合并到脚注标签中', () => {
      addUserTag('fn-001-01', '自定义标签')
      const fns = getFootnotesByBookId('book-001')
      const fn1 = fns.find((f) => f.id === 'fn-001-01')

      expect(fn1?.tags).toContain('自定义标签')
      expect(fn1?.tags).toContain('人名')
    })

    it('不存在的书籍应返回空数组', () => {
      expect(getFootnotesByBookId('nonexistent')).toEqual([])
    })
  })

  describe('getFootnoteById', () => {
    it('应返回指定 ID 的脚注', () => {
      const fn = getFootnoteById('fn-001-01')
      expect(fn).toBeDefined()
      expect(fn!.number).toBe(1)
    })

    it('不存在的 ID 应返回 undefined', () => {
      expect(getFootnoteById('nonexistent')).toBeUndefined()
    })

    it('应合并用户标签', () => {
      addUserTag('fn-001-01', '自定义')
      const fn = getFootnoteById('fn-001-01')
      expect(fn?.tags).toContain('自定义')
    })
  })
})
