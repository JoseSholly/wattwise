const fmt = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })

/** Up to 2 decimals with thousands separators, matching the API's rounding. */
export const num = (value: number) => fmt.format(value)

/** Treats NaN / blank inputs as missing. */
export const isNum = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
