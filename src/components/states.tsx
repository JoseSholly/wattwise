import { AlertTriangle, Loader2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <Zap size={28} className="text-slate-400" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">No results yet</p>
      <p className="max-w-sm text-sm text-slate-500">
        List the appliances you want to run, then calculate to see the inverter, battery,
        panel and charge controller sizing.
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
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-12 text-center"
    >
      <Loader2 size={28} className="animate-spin text-slate-500" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">
        Calculating… {seconds}s
      </p>
      {seconds >= 5 && (
        <p className="max-w-sm text-sm text-slate-500">
          The API sleeps when idle and can take 30&ndash;60 seconds to wake up on the first
          request. Still waiting — this is normal.
        </p>
      )}
    </div>
  )
}

type ErrorStateProps = {
  /** Top-level message. For validation failures, prefer the API's own text. */
  message: string
  /** Field-level errors exactly as the API returned them. */
  fieldErrors?: Record<string, string[]> | null
  onRetry?: () => void
}

export function ErrorState({ message, fieldErrors, onRetry }: ErrorStateProps) {
  const entries = fieldErrors ? Object.entries(fieldErrors) : []

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-5"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>

      {entries.length > 0 && (
        <ul className="flex flex-col gap-1 pl-7 text-sm text-red-700">
          {entries.map(([field, messages]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {messages.join(' ')}
            </li>
          ))}
        </ul>
      )}

      {onRetry && (
        <div className="pl-7">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
