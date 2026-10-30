/** Constants of the API's shared sizing model (api/common/sizing.py), for display only. */

/** Share of a battery's rated capacity the system may use (sizing.py BATTERY_DEPTH_OF_DISCHARGE). */
export const BATTERY_SAFETY_LIMIT = 0.5

/** Inverter + wiring efficiency, battery to AC load (sizing.py INVERTER_EFFICIENCY). */
export const INVERTER_EFFICIENCY = 0.8

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`

export const ASSUMPTIONS: [string, string][] = [
  ['Power factor', '0.8'],
  ['Inverter efficiency', pct(INVERTER_EFFICIENCY)],
  ['Battery depth of discharge', pct(BATTERY_SAFETY_LIMIT)],
  ['Battery unit voltage', '12 V'],
  ['Peak sun hours', '6 h/day'],
  ['Solar system efficiency', '80%'],
  ['Controller headroom', '× 1.25'],
]

/**
 * Hours the installed bank runs the whole load at once, with no sun, before
 * reaching the safety limit. Worst case: appliances that take turns last longer.
 */
export function batteryRuntimeHours(bankWh: number, totalLoadW: number): number | null {
  if (!(totalLoadW > 0) || !(bankWh > 0)) return null
  return (bankWh * BATTERY_SAFETY_LIMIT * INVERTER_EFFICIENCY) / totalLoadW
}
