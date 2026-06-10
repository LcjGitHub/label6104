interface ProgressBarProps {
  percentage: number
  readCount?: number
  totalCount?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  percentage,
  readCount,
  totalCount,
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage))
  const isComplete = safePercentage === 100

  const heightClass = size === 'sm' ? 'progress-bar--sm' : size === 'lg' ? 'progress-bar--lg' : ''

  return (
    <div className="progress-bar-wrapper">
      <div className={`progress-bar ${heightClass}`} role="progressbar" aria-valuenow={safePercentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`progress-bar__fill ${isComplete ? 'progress-bar__fill--complete' : ''}`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="progress-bar__label">
          <span className="progress-bar__percentage">{safePercentage}%</span>
          {typeof readCount === 'number' && typeof totalCount === 'number' && (
            <span className="progress-bar__count">
              已读 {readCount} / {totalCount} 条
            </span>
          )}
          {isComplete && <span className="progress-bar__complete-tag">已完成</span>}
        </div>
      )}
    </div>
  )
}
