import { TriangleAlert } from 'lucide-react'
import type { SizingWarning } from '../../api/types'

type VoltageNoticeProps = {
  warnings: SizingWarning[]
  current: number
  /** From `suggestedVoltage`; null when no warning offers a higher voltage. */
  suggested: number | null
  onSwitch: () => void
  onEditBatteries: () => void
  pending: boolean
  className?: string
}

/**
 * Advisory callout for the API's sizing warnings. The plan below always stays
 * at `current` until the user acts on a suggestion.
 */
export function VoltageNotice({
  warnings,
  current,
  suggested,
  onSwitch,
  onEditBatteries,
  pending,
  className = '',
}: VoltageNoticeProps) {
  // MANY_PARALLEL_STRINGS with no voltage to offer: bigger batteries are the fix.
  const needsLargerBatteries = warnings.some(
    (w) => w.code === 'MANY_PARALLEL_STRINGS' && w.recommended_system_voltage === null,
  )

  const heading =
    suggested !== null
      ? `${suggested} V would suit this system better`
      : needsLargerBatteries
        ? 'Larger batteries would simplify this bank'
        : 'Worth checking before you buy'

  return (
    <div
      role="status"
      className={`border-l-2 border-accent bg-accent/10 py-4 pl-4 pr-4 text-sm ${className}`}
    >
      <p className="flex items-center gap-2 font-semibold text-accent-ink">
        <TriangleAlert aria-hidden className="size-4 shrink-0" />
        {heading}
      </p>

      <ul className="mt-2 flex flex-col gap-1.5 text-[13px] leading-relaxed text-fg">
        {warnings.map((warning, i) => (
          <li key={`${warning.code}-${i}`}>{warning.message}</li>
        ))}
      </ul>

      {(suggested !== null || needsLargerBatteries) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {suggested !== null && (
            <button type="button" onClick={onSwitch} disabled={pending} className="btn-accent">
              Switch to {suggested} V
            </button>
          )}
          {needsLargerBatteries && (
            <button type="button" onClick={onEditBatteries} className="btn-secondary">
              Change battery size
            </button>
          )}
          {suggested !== null && (
            <span className="text-[13px] text-muted">
              The plan below stays at {current} V until you switch.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
