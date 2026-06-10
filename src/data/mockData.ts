import type { Book, Bookmark, Footnote, ReadingProgress, BookProgressSummary } from '../types'

export const books: Book[] = [
  {
    id: 'book-001',
    title: '史记选译',
    author: '司马迁 著 / 韩兆琦 译注',
    publisher: '中华书局',
    year: 2018,
    noteType: 'footnote',
    footnoteCount: 12,
    description:
      '《史记》选本，附详细译注。脚注涵盖人名、地名、典章制度及互文参照，便于对照原文阅读。',
  },
  {
    id: 'book-002',
    title: '剑桥中国史·秦汉卷',
    author: '[美] 费正清 主编',
    publisher: '中国社会科学出版社',
    year: 1992,
    noteType: 'endnote',
    footnoteCount: 10,
    description:
      '海外汉学经典通史。尾注汇集史料出处、学术争论及延伸阅读，是研究秦汉史的重要工具书。',
  },
  {
    id: 'book-003',
    title: '红楼梦脂评汇校本',
    author: '曹雪芹 著 / 冯其庸 校订',
    publisher: '作家出版社',
    year: 2006,
    noteType: 'footnote',
    footnoteCount: 8,
    description:
      '汇集甲戌、庚辰、蒙府等脂评本批语，脚注说明版本差异、典故出处及人物关系线索。',
  },
  {
    id: 'book-004',
    title: '理想国',
    author: '[古希腊] 柏拉图 著 / 郭斌和 译',
    publisher: '商务印书馆',
    year: 2017,
    noteType: 'endnote',
    footnoteCount: 8,
    description:
      '柏拉图对话录核心篇目。尾注解释希腊文术语、神话典故及与亚里士多德思想的对话关系。',
  },
]

export const footnotes: Footnote[] = [
  // 史记选译
  {
    id: 'fn-001-01',
    bookId: 'book-001',
    number: 1,
    page: 12,
    originalText: '项羽者，下相人也，字羽。',
    annotation:
      '下相：秦时县名，属泗水郡，今江苏宿迁一带。项羽祖籍项国，后迁居下相，故以地为氏。',
    tags: ['人名', '地名'],
  },
  {
    id: 'fn-001-02',
    bookId: 'book-001',
    number: 2,
    page: 14,
    originalText: '其先乃齐人，徙于楚，世世为楚将。',
    annotation:
      '项氏本齐人，后徙楚。项梁、项籍（羽）世代为将，与楚贵族关系密切，此为其反秦之政治资本。',
    tags: ['人名', '制度'],
  },
  {
    id: 'fn-001-03',
    bookId: 'book-001',
    number: 3,
    page: 28,
    originalText: '项梁为会稽守，殷通为郡守。',
    annotation:
      '会稽郡：秦置，治吴县（今苏州）。郡守为郡最高长官；项梁先为会稽郡属官，后杀殷通夺兵权。',
    tags: ['人名', '地名', '制度'],
  },
  {
    id: 'fn-001-04',
    bookId: 'book-001',
    number: 4,
    page: 45,
    originalText: '楚虽三户，亡秦必楚。',
    annotation:
      '语出《史记·项羽本纪》。三户或指楚昭、屈、景三姓，或指三户人家，象征楚人复国决心之谚。',
    tags: ['典故'],
  },
  {
    id: 'fn-001-05',
    bookId: 'book-001',
    number: 5,
    page: 67,
    originalText: '项王军壁垓下，兵少食尽。',
    annotation:
      '垓下：今安徽灵璧东南。汉五年（前202）项羽被围于此，即「垓下之围」，为楚汉决战尾声。',
    tags: ['地名', '人名'],
  },
  {
    id: 'fn-001-06',
    bookId: 'book-001',
    number: 6,
    page: 72,
    originalText: '骓不逝兮可奈何，虞兮虞兮奈若何！',
    annotation:
      '《垓下歌》名句。骓为项羽所乘名马；虞姬为其宠姬。歌辞见《史记》，后世多作悲剧意象。',
    tags: ['典故', '人名'],
  },
  {
    id: 'fn-001-07',
    bookId: 'book-001',
    number: 7,
    page: 89,
    originalText: '籍长八尺余，力能扛鼎。',
    annotation:
      '扛鼎：举鼎。先秦以鼎象征权力与勇力，「力能扛鼎」形容项羽膂力过人，亦见《汉书》同类记载。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-001-08',
    bookId: 'book-001',
    number: 8,
    page: 103,
    originalText: '鸿门宴',
    annotation:
      '前206年项羽于鸿门（今陕西临潼东北）设宴，范增举玦示意杀刘邦而未果，为楚汉转折之关键事件。',
    tags: ['典故', '地名', '人名'],
  },
  {
    id: 'fn-001-09',
    bookId: 'book-001',
    number: 9,
    page: 118,
    originalText: '范增数目项王，举所佩玉玦以示之者三。',
    annotation:
      '玉玦：环形玉器，缺而不连，古人赠玦有「决」之意，暗示决断杀刘邦。范增三举而项羽默然不应。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-001-10',
    bookId: 'book-001',
    number: 10,
    page: 134,
    originalText: '竖子不足与谋！',
    annotation:
      '竖子：对后辈或所轻之人的蔑称。范增见项羽不用其计，愤而掷玦，后称病辞归，途中疽发而死。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-001-11',
    bookId: 'book-001',
    number: 11,
    page: 156,
    originalText: '分封十八王',
    annotation:
      '项羽灭秦后分封天下，立十八诸侯王，自封西楚霸王。分封格局引发齐、赵等地叛乱，为楚汉战争埋下伏笔。',
    tags: ['制度', '人名'],
  },
  {
    id: 'fn-001-12',
    bookId: 'book-001',
    number: 12,
    page: 178,
    originalText: '乌江亭长舣船待',
    annotation:
      '乌江：今安徽和县一带。传说亭长备船劝项羽渡江，项羽以无颜见江东父老为由自刎，事见《史记》。',
    tags: ['地名', '人名', '典故'],
  },

  // 剑桥中国史
  {
    id: 'fn-002-01',
    bookId: 'book-002',
    number: 1,
    page: 23,
    originalText: 'Legalist reforms under Shang Yang',
    annotation:
      '商鞅变法（前356—前350）：废井田、奖军功、行县制，为秦统一奠定制度基础。参见《商君书》及睡虎地秦简。',
    tags: ['人名', '制度', '典故'],
  },
  {
    id: 'fn-002-02',
    bookId: 'book-002',
    number: 2,
    page: 41,
    originalText: 'the burning of books and burying of scholars',
    annotation:
      '焚书坑儒：前213年李斯建议焚毁私藏《诗》《书》等；前212年坑杀方士与儒生。传统叙述近年受考古与思想史研究修正。',
    tags: ['典故', '人名', '制度'],
  },
  {
    id: 'fn-002-03',
    bookId: 'book-002',
    number: 3,
    page: 58,
    originalText: 'Chang\'an as the Western Han capital',
    annotation:
      '长安：西汉都城，今西安西北。惠帝至王莽间为政治中心，城址考古发掘揭示其里坊与宫阙布局。',
    tags: ['地名', '制度'],
  },
  {
    id: 'fn-002-04',
    bookId: 'book-002',
    number: 4,
    page: 76,
    originalText: 'Wudi\'s expansionist policies',
    annotation:
      '汉武帝对外用兵：北击匈奴、通西域、南征闽越与南越，并置河西四郡，极大拓展了帝国疆域与丝路贸易。',
    tags: ['人名', '地名', '制度'],
  },
  {
    id: 'fn-002-05',
    bookId: 'book-002',
    number: 5,
    page: 92,
    originalText: 'Wang Mang\'s Xin dynasty',
    annotation:
      '王莽篡汉（9年）建「新」朝，托古改制失败，引发绿林、赤眉起义，导致西汉灭亡与东汉重建。',
    tags: ['人名', '制度', '典故'],
  },
  {
    id: 'fn-002-06',
    bookId: 'book-002',
    number: 6,
    page: 108,
    originalText: 'paper and its impact on bureaucracy',
    annotation:
      '纸的发明与普及（约西汉至东汉）：降低文书成本，推动帝国行政与经典传播，见李约瑟及近年考古论文。',
    tags: ['制度', '典故'],
  },
  {
    id: 'fn-002-07',
    bookId: 'book-002',
    number: 7,
    page: 125,
    originalText: 'the Yellow Turban rebellion',
    annotation:
      '黄巾起义（184年）：张角以太平道组织民众，「苍天已死，黄天当立」，动摇东汉统治，开启三国时代序幕。',
    tags: ['人名', '典故', '制度'],
  },
  {
    id: 'fn-002-08',
    bookId: 'book-002',
    number: 8,
    page: 141,
    originalText: 'eunuchs and court factions',
    annotation:
      '东汉中后期宦官与外戚、士族党争不断，「党锢之祸」压制太学生与清流官员，加速王朝崩溃。',
    tags: ['制度', '典故'],
  },
  {
    id: 'fn-002-09',
    bookId: 'book-002',
    number: 9,
    page: 158,
    originalText: 'Qin-Han transition in historiography',
    annotation:
      '秦汉之际在史学中的叙述：从「暴秦」到「汉承秦制」的辩证，见司马迁、班固及现代学者如余英时诸说。',
    tags: ['人名', '典故', '制度'],
  },
  {
    id: 'fn-002-10',
    bookId: 'book-002',
    number: 10,
    page: 172,
    originalText: 'archaeological evidence from Mawangdui',
    annotation:
      '马王堆汉墓（长沙，1972）：出土帛书、帛画及女尸，为研究西汉思想、医学与丧葬礼俗提供第一手材料。',
    tags: ['地名', '典故'],
  },

  // 红楼梦脂评
  {
    id: 'fn-003-01',
    bookId: 'book-003',
    number: 1,
    page: 5,
    originalText: '甄士隐梦幻识通灵',
    annotation:
      '开篇以「甄士隐」「贾雨村」谐音「真事隐」「假语存」，点明全书虚实笔法。甲戌本脂批对此有专条评点。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-003-02',
    bookId: 'book-003',
    number: 2,
    page: 18,
    originalText: '好了歌',
    annotation:
      '《好了歌》及甄士隐《好了歌注》：以偈语概括盛衰无常，脂评多联系曹家败落及作者「历幻」之旨。',
    tags: ['典故', '人名'],
  },
  {
    id: 'fn-003-03',
    bookId: 'book-003',
    number: 3,
    page: 32,
    originalText: '林黛玉进贾府',
    annotation:
      '第三回写黛玉初入荣国府，通过其眼写贾府排场。庚辰本脂批称「黛玉之来，方写贾府之盛」。',
    tags: ['人名', '地名'],
  },
  {
    id: 'fn-003-04',
    bookId: 'book-003',
    number: 4,
    page: 48,
    originalText: '宝玉挨打',
    annotation:
      '第三十三回「手足眈眈，小动唇舌，不教兄逼死奴婢」。脂评揭示政、琏、环等人物在事件中的各自用心。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-003-05',
    bookId: 'book-003',
    number: 5,
    page: 56,
    originalText: '金钏投井',
    annotation:
      '第三十回王夫人辱金钏致其投井。蒙府本批语联系「千红一窟，万艳同悲」，强调女儿悲剧命运。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-003-06',
    bookId: 'book-003',
    number: 6,
    page: 71,
    originalText: '晴雯撕扇',
    annotation:
      '第三十一回晴雯撕扇显其性情，与袭人「花气袭人知昼暖」形成对照。脂评多论「真性情」与「假温柔」。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-003-07',
    bookId: 'book-003',
    number: 7,
    page: 89,
    originalText: '抄检大观园',
    annotation:
      '第七十四回抄检为贾府由盛转衰之枢纽。脂批指出「一抄便全家离散」，与后四十回情节线索相呼应。',
    tags: ['地名', '典故', '制度'],
  },
  {
    id: 'fn-003-08',
    bookId: 'book-003',
    number: 8,
    page: 102,
    originalText: '太虚幻境',
    annotation:
      '第五回警幻仙子引宝玉入太虚幻境，阅「金陵十二钗」册及《红楼梦》曲。甲戌本对此段批语最为密集。',
    tags: ['典故', '地名', '人名'],
  },

  // 理想国
  {
    id: 'fn-004-01',
    bookId: 'book-004',
    number: 1,
    page: 15,
    originalText: 'δικαιοσύνη (dikaiosynē)',
    annotation:
      '「正义」之希腊文。全书核心概念，苏格拉底与诸对话者对其定义展开层层辨析，涉及个人灵魂与城邦秩序。',
    tags: ['人名', '制度', '典故'],
  },
  {
    id: 'fn-004-02',
    bookId: 'book-004',
    number: 2,
    page: 34,
    originalText: 'Ring of Gyges',
    annotation:
      '盖吉斯之戒：隐身戒指寓言，问人是否行正义仅因惧怕惩罚。格劳孔兄弟提出，苏格拉底以灵魂和谐作答。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-004-03',
    bookId: 'book-004',
    number: 3,
    page: 52,
    originalText: 'noble lie (γενναῖον ψεῦδος)',
    annotation:
      '「高贵的谎言」：为维系城邦团结而编造的神话，宣称公民金属本质不同。引发后世对政治与真理关系的持续讨论。',
    tags: ['制度', '典故'],
  },
  {
    id: 'fn-004-04',
    bookId: 'book-004',
    number: 4,
    page: 78,
    originalText: 'Allegory of the Cave',
    annotation:
      '洞穴喻：第七卷著名比喻，囚徒见墙影而误认真实，哲人出洞见日光喻认识「善的理念」。影响西方哲学与教育学。',
    tags: ['典故', '人名'],
  },
  {
    id: 'fn-004-05',
    bookId: 'book-004',
    number: 5,
    page: 96,
    originalText: 'philosopher-kings',
    annotation:
      '「哲学家为王」：只有把握理念者才配治理城邦。此主张常被批评为精英主义，亦被读作对当时雅典民主的反思。',
    tags: ['制度', '人名', '典故'],
  },
  {
    id: 'fn-004-06',
    bookId: 'book-004',
    number: 6,
    page: 112,
    originalText: 'tripartite soul',
    annotation:
      '灵魂三分：理性、激情、欲望，对应城邦中统治者、护卫者、生产者。与《蒂迈欧》等篇目可相互参看。',
    tags: ['制度', '典故'],
  },
  {
    id: 'fn-004-07',
    bookId: 'book-004',
    number: 7,
    page: 128,
    originalText: 'mimesis and poetry',
    annotation:
      '「模仿」与诗：第十卷批评荷马史诗模仿表象，主张诗应服务于善。影响亚里士多德《诗学》及后世文艺理论。',
    tags: ['人名', '典故'],
  },
  {
    id: 'fn-004-08',
    bookId: 'book-004',
    number: 8,
    page: 145,
    originalText: 'decline of regimes',
    annotation:
      '政体蜕变序列：从贵族政治经寡头、民主至僭主，对应灵魂德性之沦丧。柏拉图对民主的忧虑需置于雅典历史语境理解。',
    tags: ['制度', '地名', '典故'],
  },
]

export function getBookById(id: string): Book | undefined {
  return books.find((b) => b.id === id)
}

export function getFootnotesByBookId(bookId: string): Footnote[] {
  return footnotes.filter((f) => f.bookId === bookId)
}

const BOOKMARKS_STORAGE_KEY = 'footnote-archive-bookmarks'

function readBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks))
}

export function getBookmarks(): Bookmark[] {
  return readBookmarks()
}

export function getBookmarkByFootnoteId(footnoteId: string): Bookmark | undefined {
  return readBookmarks().find((b) => b.footnoteId === footnoteId)
}

export function isBookmarked(footnoteId: string): boolean {
  return readBookmarks().some((b) => b.footnoteId === footnoteId)
}

export function addBookmark(footnoteId: string, bookId: string): Bookmark {
  const bookmarks = readBookmarks()
  const existing = bookmarks.find((b) => b.footnoteId === footnoteId)
  if (existing) return existing

  const bookmark: Bookmark = {
    id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    footnoteId,
    bookId,
    createdAt: Date.now(),
  }
  bookmarks.push(bookmark)
  writeBookmarks(bookmarks)
  return bookmark
}

export function removeBookmark(footnoteId: string): void {
  const bookmarks = readBookmarks()
  const filtered = bookmarks.filter((b) => b.footnoteId !== footnoteId)
  writeBookmarks(filtered)
}

export function toggleBookmark(footnoteId: string, bookId: string): { bookmarked: boolean } {
  if (isBookmarked(footnoteId)) {
    removeBookmark(footnoteId)
    return { bookmarked: false }
  }
  addBookmark(footnoteId, bookId)
  return { bookmarked: true }
}

export function getBookmarkedFootnotes(): { footnote: Footnote; book: Book; bookmark: Bookmark }[] {
  const bookmarks = readBookmarks().sort((a, b) => b.createdAt - a.createdAt)
  return bookmarks
    .map((bm) => {
      const footnote = footnotes.find((f) => f.id === bm.footnoteId)
      const book = books.find((b) => b.id === bm.bookId)
      if (!footnote || !book) return null
      return { footnote, book, bookmark: bm }
    })
    .filter((item): item is { footnote: Footnote; book: Book; bookmark: Bookmark } => item !== null)
}

export function getFootnoteById(id: string): Footnote | undefined {
  return footnotes.find((f) => f.id === id)
}

export function updateBookmark(
  id: string,
  updates: Partial<Pick<Bookmark, 'footnoteId' | 'bookId'>>,
): Bookmark | undefined {
  const bookmarks = readBookmarks()
  const idx = bookmarks.findIndex((b) => b.id === id)
  if (idx === -1) return undefined

  const updated: Bookmark = { ...bookmarks[idx], ...updates }
  bookmarks[idx] = updated
  writeBookmarks(bookmarks)
  return updated
}

const PROGRESS_STORAGE_KEY = 'footnote-archive-progress'

function readAllProgress(): Record<string, ReadingProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAllProgress(progress: Record<string, ReadingProgress>): void {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

export function getReadingProgress(bookId: string): ReadingProgress | undefined {
  const all = readAllProgress()
  return all[bookId]
}

export function isFootnoteRead(bookId: string, footnoteId: string): boolean {
  const progress = getReadingProgress(bookId)
  if (!progress) return false
  return progress.readFootnoteIds.includes(footnoteId)
}

export function getReadFootnoteIds(bookId: string): Set<string> {
  const progress = getReadingProgress(bookId)
  if (!progress) return new Set()
  return new Set(progress.readFootnoteIds)
}

export function markFootnoteAsRead(bookId: string, footnoteId: string): ReadingProgress {
  const all = readAllProgress()
  const bookFootnotes = getFootnotesByBookId(bookId)
  const now = Date.now()

  let progress = all[bookId]
  if (!progress) {
    progress = {
      bookId,
      totalFootnotes: bookFootnotes.length,
      readFootnoteIds: [],
      readRecords: [],
      lastReadAt: now,
      startedAt: now,
    }
  }

  if (!progress.readFootnoteIds.includes(footnoteId)) {
    progress.readFootnoteIds.push(footnoteId)
    progress.readRecords.push({ footnoteId, readAt: now })
  }

  progress.lastReadAt = now
  progress.totalFootnotes = bookFootnotes.length
  all[bookId] = progress
  writeAllProgress(all)
  return progress
}

export function markFootnotesAsRead(bookId: string, footnoteIds: string[]): ReadingProgress {
  const all = readAllProgress()
  const bookFootnotes = getFootnotesByBookId(bookId)
  const now = Date.now()

  let progress = all[bookId]
  if (!progress) {
    progress = {
      bookId,
      totalFootnotes: bookFootnotes.length,
      readFootnoteIds: [],
      readRecords: [],
      lastReadAt: now,
      startedAt: now,
    }
  }

  for (const fid of footnoteIds) {
    if (!progress.readFootnoteIds.includes(fid)) {
      progress.readFootnoteIds.push(fid)
      progress.readRecords.push({ footnoteId: fid, readAt: now })
    }
  }

  progress.lastReadAt = now
  progress.totalFootnotes = bookFootnotes.length
  all[bookId] = progress
  writeAllProgress(all)
  return progress
}

export function resetReadingProgress(bookId: string): void {
  const all = readAllProgress()
  delete all[bookId]
  writeAllProgress(all)
}

export function calculateProgressPercentage(bookId: string): number {
  const progress = getReadingProgress(bookId)
  if (!progress || progress.totalFootnotes === 0) return 0
  return Math.round((progress.readFootnoteIds.length / progress.totalFootnotes) * 100)
}

export function getAllProgressSummaries(): BookProgressSummary[] {
  const all = readAllProgress()
  return books
    .map((book) => {
      const progress = all[book.id]
      const total = book.footnoteCount
      const readCount = progress?.readFootnoteIds.length ?? 0
      return {
        bookId: book.id,
        title: book.title,
        author: book.author,
        totalFootnotes: total,
        readCount,
        percentage: total > 0 ? Math.round((readCount / total) * 100) : 0,
        lastReadAt: progress?.lastReadAt ?? 0,
        startedAt: progress?.startedAt ?? 0,
      }
    })
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
}

export function getOverallStats(): {
  totalBooks: number
  booksStarted: number
  booksCompleted: number
  totalFootnotes: number
  footnotesRead: number
  overallPercentage: number
} {
  const summaries = getAllProgressSummaries()
  const totalBooks = summaries.length
  const booksStarted = summaries.filter((s) => s.readCount > 0).length
  const booksCompleted = summaries.filter((s) => s.percentage === 100).length
  const totalFootnotes = summaries.reduce((sum, s) => sum + s.totalFootnotes, 0)
  const footnotesRead = summaries.reduce((sum, s) => sum + s.readCount, 0)
  const overallPercentage = totalFootnotes > 0 ? Math.round((footnotesRead / totalFootnotes) * 100) : 0

  return {
    totalBooks,
    booksStarted,
    booksCompleted,
    totalFootnotes,
    footnotesRead,
    overallPercentage,
  }
}
