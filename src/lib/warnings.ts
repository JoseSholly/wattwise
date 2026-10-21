import type { SizingOutput, SizingWarning } from '../api/types'

/**
 * The API's warnings, tolerating the short-lived string-list shape so a
 * stale backend never breaks the results page.
 */
export function warningsOf(output: SizingOutput): SizingWarning[] {
  const raw = (output.warnings ?? []) as (SizingWarning | string)[]
  return raw.map((w) =>
    typeof w === 'string' ? { code: 'UNKNOWN', message: w, recommended_system_voltage: null } : w,
  )
}

/**
 * The voltage the "Switch to" button should offer: the highest one any warning
 * suggests above the current voltage. Higher always satisfies the lower
 * suggestion too (LOW_VOLTAGE's 24 V and MANY_PARALLEL_STRINGS's 48 V → 48 V).
 */
export function suggestedVoltage(warnings: SizingWarning[], current: number): number | null {
  const candidates = warnings
    .map((w) => w.recommended_system_voltage)
    .filter((v): v is number => typeof v === 'number' && v > current)
  return candidates.length > 0 ? Math.max(...candidates) : null
}
