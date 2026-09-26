import { ChevronRight } from 'lucide-react'
import { num } from '../lib/format'
import { ASSUMPTIONS } from '../lib/model'
import { SpecSheet, type SpecInput } from './SpecSheet'

type ResultItem = {
  id: number
  name: string
  quantity: number
  power_rating: number
  /** Hours; per item in v2, shared in v1. */
  backup_time: number
}

type Props = SpecInput & {
  items: ResultItem[]
  /** v1 only: the single backup time that applied to every appliance. */
  sharedBackupTime?: number
}

export function Results({ items, sharedBackupTime, ...spec }: Props) {
  const rows = items
    .map((item, i) => ({
      key: `${item.id}-${i}`,
      ...item,
      wh: item.power_rating * item.quantity * item.backup_time,
    }))
    .sort((a, b) => b.wh - a.wh)
  const totalWh = rows.reduce((sum, r) => sum + r.wh, 0)

  return (
    <div className="flex flex-col gap-5">
      <SpecSheet spec={spec} />

      <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
        <div>
          <div className="label-mono">Daily energy</div>
          <div className="mt-1 text-xs text-muted">
            {sharedBackupTime !== undefined
              ? `${num(spec.output.total_load)} W × ${num(sharedBackupTime)} h`
              : 'Σ watts × qty × hours'}
          </div>
        </div>
        <div className="num text-xl font-semibold tracking-tight">
          {num(totalWh)} <span className="text-xs font-normal text-muted">Wh</span>
        </div>
      </div>

      <div>
        <div className="label-mono mb-3">Energy by appliance</div>
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const share = totalWh > 0 ? row.wh / totalWh : 0
            return (
              <li
                key={row.key}
                title={`${row.name}: ${num(row.wh)} Wh (${num(share * 100)}%)`}
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{row.name}</span>
                  <span className="num shrink-0 text-xs">
                    {num(row.wh)} Wh{' '}
                    <span className="inline-block w-10 text-right text-subtle">
                      {Math.round(share * 100)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(share * 100, 1)}%` }}
                    />
                  </div>
                  <span className="num w-28 shrink-0 text-right text-[11px] text-subtle">
                    {num(row.quantity)} × {num(row.power_rating)} W × {num(row.backup_time)} h
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <details className="group rounded-md border border-line">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          <ChevronRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-open:rotate-90"
          />
          Model assumptions
        </summary>
        <dl className="border-t border-line px-3 py-2">
          {ASSUMPTIONS.map(([label, value]) => (
            <div key={label} className="flex justify-between py-1 text-xs">
              <dt className="text-muted">{label}</dt>
              <dd className="num">{value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  )
}
