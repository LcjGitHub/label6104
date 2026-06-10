import { useEffect, useState } from 'react'
import type { MilestoneMessage, MilestoneLevel } from '../types'

interface MilestoneToastProps {
  message: MilestoneMessage | null
  pendingCount?: number
  onDismiss?: () => void
  onDismissAll?: () => void
  showProgress?: boolean
  animate?: boolean
}

function getProgressBarColor(level: MilestoneLevel): string {
  switch (level) {
    case 25:
      return '#6b9e50'
    case 50:
      return '#d4a840'
    case 75:
      return '#c27a2e'
    case 100:
      return '#a84c1a'
    default:
      return '#8a7355'
  }
}

export default function MilestoneToast({
  message,
  pendingCount = 0,
  onDismiss,
  onDismissAll,
  showProgress = true,
  animate = true,
}: MilestoneToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      if (animate) {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true)
        })
      }
    } else {
      setIsAnimatingIn(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [message, animate])

  if (!isVisible || !message) {
    return null
  }

  const hasMultiplePending = pendingCount > 0

  return (
    <div
      className={`milestone-toast-container ${isAnimatingIn ? 'milestone-toast-container--visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`milestone-toast milestone-toast--level-${message.level}`}
        style={
          {
            '--milestone-accent': getProgressBarColor(message.level),
          } as React.CSSProperties
        }
      >
        <div className="milestone-toast__emoji" aria-hidden="true">
          {message.emoji}
        </div>

        <div className="milestone-toast__content">
          <div className="milestone-toast__header">
            <h4 className="milestone-toast__title">{message.title}</h4>
            <span className="milestone-toast__badge">{message.level}%</span>
          </div>
          <p className="milestone-toast__text">{message.content}</p>

          {showProgress && (
            <div className="milestone-toast__progress-wrapper">
              <div
                className="milestone-toast__progress-fill"
                style={{ width: `${message.level}%` }}
              />
            </div>
          )}

          {hasMultiplePending && (
            <div className="milestone-toast__pending">
              <span>还有 {pendingCount} 条成就待查看</span>
            </div>
          )}
        </div>

        <div className="milestone-toast__actions">
          <button
            type="button"
            className="milestone-toast__btn milestone-toast__btn--close"
            onClick={onDismiss}
            aria-label="关闭此提示"
            title="关闭此提示"
          >
            ×
          </button>

          {hasMultiplePending && (
            <button
              type="button"
              className="milestone-toast__btn milestone-toast__btn--dismiss-all"
              onClick={onDismissAll}
              aria-label="关闭全部提示"
              title="关闭全部提示"
            >
              全部关闭
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
