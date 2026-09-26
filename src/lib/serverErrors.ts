import type { ApiIssue } from '../api/client'

const ITEM_FIELDS = new Set(['id', 'quantity', 'power_rating', 'backup_time'])

/**
 * Turns a 422 `loc` such as ["body", "items", "2", "power_rating"] into a
 * form path ("items.2.power_rating"). Returns null when it doesn't point at
 * a field the form has.
 */
export function issueToPath(issue: ApiIssue, topLevelFields: readonly string[]): string | null {
  const [root, ...rest] = issue.loc
  if (root !== 'body') return null

  if (rest.length === 1 && topLevelFields.includes(rest[0])) return rest[0]

  if (rest.length === 3 && rest[0] === 'items' && /^\d+$/.test(rest[1]) && ITEM_FIELDS.has(rest[2])) {
    return rest.join('.')
  }
  return null
}

const FIELD_LABELS: Record<string, string> = {
  id: 'appliance',
  quantity: 'quantity',
  power_rating: 'watts',
  backup_time: 'backup time',
  battery_capacity: 'battery capacity',
  system_voltage: 'system voltage',
  solar_panel_watt: 'panel watts',
  items: 'appliances',
}

/** Human-readable location for an issue the form can't attach to a field. */
export function describeLoc(loc: string[]): string {
  const parts = loc[0] === 'body' || loc[0] === 'query' ? loc.slice(1) : loc
  if (parts.length === 0) return 'Request'
  if (parts[0] === 'items' && parts[1] !== undefined && /^\d+$/.test(parts[1])) {
    const row = `Appliance ${Number(parts[1]) + 1}`
    return parts[2] ? `${row}, ${FIELD_LABELS[parts[2]] ?? parts[2]}` : row
  }
  return parts.map((p) => FIELD_LABELS[p] ?? p).join(' › ')
}
