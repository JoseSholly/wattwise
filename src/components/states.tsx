import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { ApiIssue } from '../api/client'
import { describeLoc } from '../lib/serverErrors'

function SkeletonRow() {
  return (
    <div className="row-hairline">
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-40 animate-shimmer rounded bg-surface2" />
        <div className="h-2 w-56 animate-shimmer rounded bg-surface2" />
      </div>
      <div className="h-4 w-20 animate-shimmer rounded bg-surface2" />
    </div>
  )
}

function SkeletonGroup({ title, rows }: { title: string; rows: number }) {
  return (
    <section>
      <h3 className="label-mono mb-1">{title}</h3>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </section>
  )
}

/** Matches the real SpecSheet layout so the transition to success has no shift. */
export function SkeletonSpecSheet() {
  return (
    <div className="flex flex-col gap-8">
      <SkeletonGroup title="Inverter" rows={2} />
      <SkeletonGroup title="Battery bank" rows={3} />
      <SkeletonGroup title="Solar array" rows={2} />
      <SkeletonGroup title="Charging" rows={2} />
    </div>
  )
}

/**
 * The API is on a free host and cold-starts, so the wait can pass 30s.
 * Show elapsed time rather than a spinner that looks frozen.
 */
export function LoadingState() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-baseline justify-between border-b border-line pb-3 text-sm text-muted"
      >
        <span className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-ink"
            aria-hidden="true"
          />
          Calculating
        </span>
        <span className="num text-muted">{seconds}s</span>
      </div>

      <SkeletonSpecSheet />

      {seconds >= 5 && (
        <p className="text-xs leading-relaxed text-muted">
          The API sleeps when idle and can take 30–60 seconds to wake on the first request.
        </p>
      )}
    </div>
  )
}

type ErrorStateProps = {
  message: string
  /** Problems the form couldn't attach to a specific field. */
  issues?: ApiIssue[]
  /** Optional call-to-action, e.g. jump back to the loads step. */
  action?: ReactNode
  onRetry?: () => void
}

export function ErrorState({ message, issues = [], action, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-l-2 border-danger bg-danger/5 py-4 pl-4 pr-4 text-sm"
    >
      <p className="font-semibold text-danger">{message}</p>

      {issues.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 text-fg">
          {issues.map((issue, i) => (
            <li key={i} className="text-[13px]">
              <span className="text-muted">{describeLoc(issue.loc)}:</span> {issue.msg}
            </li>
          ))}
        </ul>
      )}

      {(action || onRetry) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {action}
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-secondary">
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  )
}
