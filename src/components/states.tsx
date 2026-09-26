import { useEffect, useState } from 'react'
import type { ApiIssue } from '../api/client'
import { describeLoc } from '../lib/serverErrors'

export function EmptyState() {
  return (
    <div className="rounded border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500">
      Results appear here after you calculate.
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
    <div
      role="status"
      aria-live="polite"
      className="rounded border border-neutral-200 px-4 py-8 text-sm"
    >
      <p className="tabular-nums text-neutral-900">Calculating… {seconds}s</p>
      {seconds >= 5 && (
        <p className="mt-1 text-neutral-500">
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
  onRetry?: () => void
}

export function ErrorState({ message, issues = [], onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded border border-red-200 border-l-red-600 border-l-2 px-4 py-4 text-sm">
      <p className="font-medium text-red-700">{message}</p>

      {issues.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-neutral-700">
          {issues.map((issue, i) => (
            <li key={i}>
              <span className="text-neutral-500">{describeLoc(issue.loc)}:</span> {issue.msg}
            </li>
          ))}
        </ul>
      )}

      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-3">
          Try again
        </button>
      )}
    </div>
  )
}
