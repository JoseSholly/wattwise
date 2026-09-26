import { num } from '../lib/format'

type Item = {
  id: number
  name: string
  quantity: number
  power_rating: number
  /** Hours; per item in v2, shared in v1. */
  backup_time: number
}

/** Horizontal bar breakdown of daily energy per appliance. */
export function EnergyBreakdown({ items }: { items: Item[] }) {
  const rows = items
    .map((item, i) => ({
      key: `${item.id}-${i}`,
      ...item,
      wh: item.power_rating * item.quantity * item.backup_time,
    }))
    .sort((a, b) => b.wh - a.wh)

  const totalWh = rows.reduce((sum, r) => sum + r.wh, 0)

  if (rows.length === 0) return null

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h3 className="label-mono">Daily energy · by appliance</h3>
        <div className="num text-sm font-semibold text-fg">
          {num(totalWh)} <span className="text-xs font-normal text-muted">Wh total</span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3.5">
        {rows.map((row) => {
          const share = totalWh > 0 ? row.wh / totalWh : 0
          return (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-fg">{row.name}</span>
                <span className="num shrink-0 text-xs text-muted">
                  {num(row.wh)} Wh
                  <span className="ml-2 inline-block w-8 text-right text-subtle">
                    {Math.round(share * 100)}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full bg-accent-ink/70"
                    style={{ width: `${Math.max(share * 100, 1.5)}%` }}
                  />
                </div>
                <span className="num w-32 shrink-0 text-right text-[11px] text-subtle">
                  {num(row.quantity)} × {num(row.power_rating)} W × {num(row.backup_time)} h
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
