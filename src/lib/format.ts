const fmt = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })

/** Up to 2 decimals with thousands separators, matching the API's rounding. */
export const num = (value: number) => fmt.format(value)

/**
 * Plain-English length of time: "45 min", "4 h 50 min", "1 day 6 h".
 * Minutes round to 5 above an hour; callers add "about" where it reads better.
 */
export function duration(hours: number): string {
  const minutes = Math.max(1, Math.round(hours * 60))
  if (minutes < 60) return `${minutes} min`

  const rounded = Math.round(minutes / 5) * 5
  if (rounded < 24 * 60) {
    const h = Math.floor(rounded / 60)
    const m = rounded % 60
    return m === 0 ? `${h} h` : `${h} h ${m} min`
  }

  const totalHours = Math.round(minutes / 60)
  const d = Math.floor(totalHours / 24)
  const h = totalHours % 24
  const days = `${d} day${d === 1 ? '' : 's'}`
  return h === 0 ? days : `${days} ${h} h`
}

/** Treats NaN / blank inputs as missing. */
export const isNum = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
