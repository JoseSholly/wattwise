import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ApiIssue } from '../api/client'
import { describeLoc } from '../lib/serverErrors'
import { SpecSheet } from './SpecSheet'

export function EmptyState() {
  return (
    <div className="flex flex-col gap-4">
      <SpecSheet />
      <p className="text-sm text-muted">
        Add your appliances and press <span className="font-medium text-fg">Calculate</span>. The
        sizing appears here.
      </p>
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
    <div className="flex flex-col gap-4">
      <SpecSheet pending />
      <div role="status" aria-live="polite" className="text-sm">
        <p className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          Calculating… <span className="num text-muted">{seconds}s</span>
        </p>
        {seconds >= 5 && (
          <p className="mt-1 text-muted">
            The API sleeps when idle and can take 30–60 seconds to wake on the first request.
          </p>
        )}
      </div>
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
    <div role="alert" className="rounded-md border border-danger/40 bg-danger/5 p-4 text-sm">
      <p className="flex items-start gap-2 font-medium text-danger">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        {message}
      </p>

      {issues.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 pl-6 text-fg">
          {issues.map((issue, i) => (
            <li key={i}>
              <span className="text-muted">{describeLoc(issue.loc)}:</span> {issue.msg}
            </li>
          ))}
        </ul>
      )}

      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary ml-6 mt-3">
          Try again
        </button>
      )}
    </div>
  )
}
