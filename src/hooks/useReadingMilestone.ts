import { useCallback, useEffect, useRef, useState } from 'react'
import type { MilestoneLevel, MilestoneMessage } from '../types'
import {
  checkNewMilestonesByCount,
  markMilestoneAchieved,
  dismissMilestone,
  getMilestoneMessage,
  getUndismissedMilestones,
} from '../data/mockData'

interface UseReadingMilestoneOptions {
  bookId: string | undefined
  readCount: number
  totalCount: number
  customMessages?: Partial<Record<MilestoneLevel, Partial<MilestoneMessage>>>
  autoDismiss?: boolean
  autoDismissDelay?: number
}

interface UseReadingMilestoneReturn {
  activeMilestone: MilestoneMessage | null
  pendingLevels: MilestoneLevel[]
  dismiss: () => void
  dismissLevel: (level: MilestoneLevel) => void
}

export function useReadingMilestone({
  bookId,
  readCount,
  totalCount,
  customMessages,
  autoDismiss = false,
  autoDismissDelay = 4000,
}: UseReadingMilestoneOptions): UseReadingMilestoneReturn {
  const [activeMilestone, setActiveMilestone] = useState<MilestoneMessage | null>(null)
  const [pendingLevels, setPendingLevels] = useState<MilestoneLevel[]>([])
  const lastReadCountRef = useRef<number>(-1)
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef<boolean>(false)
  const lastShownLevelRef = useRef<MilestoneLevel | null>(null)

  const clearAutoDismissTimer = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
  }, [])

  const markLevelAsShown = useCallback(
    (level: MilestoneLevel) => {
      if (!bookId) return
      dismissMilestone(bookId, level)
    },
    [bookId],
  )

  const showFirstPending = useCallback(
    (levels: MilestoneLevel[]) => {
      if (levels.length === 0) {
        setActiveMilestone(null)
        setPendingLevels([])
        lastShownLevelRef.current = null
        return
      }
      const [firstLevel] = levels
      const message = getMilestoneMessage(firstLevel, customMessages)
      setActiveMilestone(message)
      setPendingLevels(levels)
      markLevelAsShown(firstLevel)
      lastShownLevelRef.current = firstLevel
    },
    [customMessages, markLevelAsShown],
  )

  const dismiss = useCallback(() => {
    clearAutoDismissTimer()
    setPendingLevels((prev) => {
      if (prev.length <= 1) {
        setActiveMilestone(null)
        lastShownLevelRef.current = null
        return []
      }
      const [, nextLevel, ...rest] = prev
      const nextMessage = getMilestoneMessage(nextLevel, customMessages)
      setActiveMilestone(nextMessage)
      markLevelAsShown(nextLevel)
      lastShownLevelRef.current = nextLevel
      return [nextLevel, ...rest]
    })
  }, [customMessages, markLevelAsShown, clearAutoDismissTimer])

  const dismissLevel = useCallback(
    (level: MilestoneLevel) => {
      clearAutoDismissTimer()
      markLevelAsShown(level)
      setPendingLevels((prev) => {
        const filtered = prev.filter((l) => l !== level)
        if (filtered.length === 0) {
          setActiveMilestone(null)
          lastShownLevelRef.current = null
        } else if (lastShownLevelRef.current === level) {
          const nextMsg = getMilestoneMessage(filtered[0], customMessages)
          setActiveMilestone(nextMsg)
          markLevelAsShown(filtered[0])
          lastShownLevelRef.current = filtered[0]
        }
        return filtered
      })
    },
    [customMessages, markLevelAsShown, clearAutoDismissTimer],
  )

  useEffect(() => {
    if (!bookId || totalCount <= 0) {
      setActiveMilestone(null)
      setPendingLevels([])
      lastReadCountRef.current = -1
      initializedRef.current = false
      lastShownLevelRef.current = null
      clearAutoDismissTimer()
      return
    }

    if (!initializedRef.current) {
      initializedRef.current = true
      const undismissed = getUndismissedMilestones(bookId)
      if (undismissed.length > 0) {
        const sortedLevels = undismissed
          .sort((a, b) => a.level - b.level)
          .map((m) => m.level)
        showFirstPending(sortedLevels)
      }
    }

    if (readCount === lastReadCountRef.current) return
    lastReadCountRef.current = readCount

    const newLevels = checkNewMilestonesByCount(bookId, readCount, totalCount)
    if (newLevels.length > 0) {
      newLevels.forEach((level) => markMilestoneAchieved(bookId, level))

      const sortedNewLevels = [...newLevels].sort((a, b) => a - b)

      setPendingLevels((prev) => {
        const existingSet = new Set(prev)
        const newOnes = sortedNewLevels.filter((l) => !existingSet.has(l))
        if (newOnes.length === 0) return prev
        const merged = [...prev, ...newOnes].sort((a, b) => a - b)

        if (prev.length === 0) {
          showFirstPending(merged)
        }

        return merged
      })
    }
  }, [bookId, readCount, totalCount, showFirstPending, clearAutoDismissTimer])

  useEffect(() => {
    if (!autoDismiss || !activeMilestone || pendingLevels.length === 0) {
      return
    }

    clearAutoDismissTimer()
    autoDismissTimerRef.current = setTimeout(() => {
      dismiss()
    }, autoDismissDelay)
  }, [activeMilestone, autoDismiss, autoDismissDelay, dismiss, clearAutoDismissTimer, pendingLevels.length])

  useEffect(() => {
    return () => {
      clearAutoDismissTimer()
    }
  }, [clearAutoDismissTimer])

  return {
    activeMilestone,
    pendingLevels,
    dismiss,
    dismissLevel,
  }
}
