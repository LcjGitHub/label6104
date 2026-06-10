import { useCallback, useEffect, useRef, useState } from 'react'
import type { MilestoneLevel, MilestoneMessage } from '../types'
import {
  checkNewMilestones,
  markMilestoneAchieved,
  dismissMilestone,
  getMilestoneMessage,
  getUndismissedMilestones,
} from '../data/mockData'

interface UseReadingMilestoneOptions {
  bookId: string | undefined
  currentPercentage: number
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
  currentPercentage,
  customMessages,
  autoDismiss = false,
  autoDismissDelay = 4000,
}: UseReadingMilestoneOptions): UseReadingMilestoneReturn {
  const [activeMilestone, setActiveMilestone] = useState<MilestoneMessage | null>(null)
  const [pendingLevels, setPendingLevels] = useState<MilestoneLevel[]>([])
  const lastProcessedRef = useRef<number>(-1)
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAutoDismissTimer = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
  }, [])

  const dismiss = useCallback(() => {
    clearAutoDismissTimer()
    setPendingLevels((prev) => {
      if (prev.length <= 1) {
        setActiveMilestone(null)
        const [currentLevel] = prev
        if (bookId && currentLevel) {
          dismissMilestone(bookId, currentLevel)
        }
        return []
      }
      const [currentLevel, nextLevel, ...rest] = prev
      if (bookId) {
        dismissMilestone(bookId, currentLevel)
      }
      const nextMsg = getMilestoneMessage(nextLevel, customMessages)
      setActiveMilestone(nextMsg)

      if (autoDismiss) {
        clearAutoDismissTimer()
        autoDismissTimerRef.current = setTimeout(() => {
          const allLevels = [nextLevel, ...rest]
          allLevels.forEach((l) => {
            if (bookId) {
              dismissMilestone(bookId, l)
            }
          })
          setPendingLevels([])
          setActiveMilestone(null)
        }, autoDismissDelay)
      }

      return [nextLevel, ...rest]
    })
  }, [bookId, customMessages, autoDismiss, autoDismissDelay, clearAutoDismissTimer])

  const dismissLevel = useCallback(
    (level: MilestoneLevel) => {
      if (bookId) {
        dismissMilestone(bookId, level)
      }
      setPendingLevels((prev) => {
        const filtered = prev.filter((l) => l !== level)
        if (filtered.length === 0) {
          setActiveMilestone(null)
        } else if (activeMilestone?.level === level) {
          const nextMsg = getMilestoneMessage(filtered[0], customMessages)
          setActiveMilestone(nextMsg)
        }
        return filtered
      })
    },
    [bookId, activeMilestone?.level, customMessages],
  )

  useEffect(() => {
    if (!bookId) {
      setActiveMilestone(null)
      setPendingLevels([])
      lastProcessedRef.current = -1
      clearAutoDismissTimer()
      return
    }

    if (currentPercentage === lastProcessedRef.current) return
    lastProcessedRef.current = currentPercentage

    const newLevels = checkNewMilestones(bookId, currentPercentage)
    if (newLevels.length > 0) {
      newLevels.forEach((level) => markMilestoneAchieved(bookId, level))
    }

    const undismissed = getUndismissedMilestones(bookId)
    if (undismissed.length > 0) {
      const sortedLevels = undismissed
        .sort((a, b) => a.level - b.level)
        .map((m) => m.level)
      setPendingLevels(sortedLevels)
      const firstMsg = getMilestoneMessage(sortedLevels[0], customMessages)
      setActiveMilestone(firstMsg)

      if (autoDismiss && sortedLevels.length > 0) {
        clearAutoDismissTimer()
        autoDismissTimerRef.current = setTimeout(() => {
          sortedLevels.forEach((l) => {
            dismissMilestone(bookId, l)
          })
          setPendingLevels([])
          setActiveMilestone(null)
        }, autoDismissDelay)
      }
    }
  }, [bookId, currentPercentage, customMessages, autoDismiss, autoDismissDelay, clearAutoDismissTimer])

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
