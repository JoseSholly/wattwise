import { useEffect, useState } from 'react'
import { ENERGY_TIPS } from '../lib/energyTips'

type Props = {
  isError?: boolean
  onRetry?: () => void
}

const STATUS_STAGES = [
  { at: 0, label: 'Waking up the server…' },
  { at: 12, label: 'Fetching appliance catalog…' },
  { at: 28, label: 'Nearly there — tidying the list…' },
  { at: 45, label: 'Taking a bit longer than usual…' },
]

export function ApplianceLoadingState({ isError, onRetry }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * ENERGY_TIPS.length))

  useEffect(() => {
    if (isError) return
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(tick)
  }, [isError])

  useEffect(() => {
    if (isError) return
    const rotate = setInterval(() => setTipIndex((i) => (i + 1) % ENERGY_TIPS.length), 6000)
    return () => clearInterval(rotate)
  }, [isError])

  // Status narration advances with elapsed time.
  const status =
    [...STATUS_STAGES].reverse().find((s) => elapsed >= s.at)?.label ?? STATUS_STAGES[0].label

  // Progress: ease toward 90% over ~45s, hold there until the real response lands.
  const target = 90
  const progress = Math.round(target * (1 - Math.exp(-elapsed / 15)))

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-md border border-danger/40 bg-danger/5 p-5">
        <div>
          <p className="label-mono text-danger">Appliance catalog unavailable</p>
          <p className="mt-2 text-sm text-fg">
            We couldn’t reach the appliance service. Check your connection and try again.
          </p>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-secondary">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Status + progress */}
      <div className="flex flex-col gap-3 rounded-md border border-line bg-surface2/60 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-mono">Loading appliance catalog</p>
            <p className="mt-1.5 text-sm text-fg">{status}</p>
          </div>
          <span className="num shrink-0 text-xs text-subtle">
            {progress}
            <span className="text-subtle">%</span>
          </span>
        </div>

        <div
          className="h-1 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Loading appliance catalog"
        >
          <div
            className="h-full bg-accent-ink transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs leading-relaxed text-muted">
          The sizing API runs on a free-tier instance that sleeps when idle. First load after a
          break takes 30–45 seconds; subsequent loads are instant.
        </p>
      </div>

      {/* Rotating energy tip */}
      <div className="rounded-md border border-line bg-surface p-4 sm:p-5">
        <p className="label-mono text-accent-ink">While you wait · Energy tip</p>
        <p
          key={tipIndex}
          className="mt-2 text-sm leading-relaxed text-fg animate-shimmer"
          style={{ animationDuration: '2s', animationIterationCount: 1 }}
        >
          {ENERGY_TIPS[tipIndex].tip}
        </p>
      </div>

      {/* Skeleton rows that mimic the appliance table layout. */}
      <ul aria-hidden="true" className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-md border border-line bg-surface2/40 p-3.5"
            style={{ animationDelay: `${i * 180}ms` }}
          >
            <span className="h-6 w-9 shrink-0 animate-shimmer rounded bg-line" />
            <span className="h-6 flex-1 animate-shimmer rounded bg-line" />
            <span className="hidden h-6 w-16 animate-shimmer rounded bg-line sm:block" />
            <span className="hidden h-6 w-20 animate-shimmer rounded bg-line sm:block" />
          </li>
        ))}
      </ul>
    </div>
  )
}
