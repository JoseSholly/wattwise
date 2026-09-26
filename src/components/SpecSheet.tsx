import { BatteryFull, Gauge, Sun, Zap, type LucideIcon } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import type { SizingOutput } from '../api/types'
import { num } from '../lib/format'

export type SpecInput = {
  output: SizingOutput
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
}

const BATTERY_UNIT_VOLTAGE = 12

function Tile({
  Icon,
  label,
  value,
  unit,
  detail,
  pending,
}: {
  Icon: LucideIcon
  label: string
  value: ReactNode
  unit: ReactNode
  /** Segments wrap between each other, never inside one. */
  detail: ReactNode[]
  pending?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 bg-surface p-3.5 sm:p-4">
      <div className="label-mono flex items-center gap-1.5">
        <Icon size={13} aria-hidden="true" className="text-accent-ink" />
        {label}
      </div>
      <div className={`flex items-baseline gap-1.5 ${pending ? 'animate-shimmer' : ''}`}>
        <span className="num text-2xl font-semibold leading-none tracking-tight sm:text-[28px]">
          {value}
        </span>
        <span className="num truncate text-xs text-muted">{unit}</span>
      </div>
      <div className="num min-h-[2lh] text-[11px] leading-snug text-muted">
        {detail.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="text-subtle"> · </span>}
            <span className="whitespace-nowrap">{part}</span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * The four headline components as a hairline-divided 2×2 grid.
 * Without data it renders the same frame with placeholders (empty/loading states).
 */
export function SpecSheet({ spec, pending = false }: { spec?: SpecInput | null; pending?: boolean }) {
  const dash = <span className="text-subtle">—</span>

  if (!spec) {
    return (
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
        <Tile Icon={Zap} label="Inverter" value={dash} unit="kVA" detail={['Peak load']} pending={pending} />
        <Tile Icon={BatteryFull} label="Batteries" value={dash} unit="× Ah" detail={['Bank layout']} pending={pending} />
        <Tile Icon={Sun} label="Solar" value={dash} unit="× W" detail={['Array size']} pending={pending} />
        <Tile Icon={Gauge} label="Controller" value={dash} unit="A" detail={['Charge current']} pending={pending} />
      </div>
    )
  }

  const { output, system_voltage, battery_capacity, solar_panel_watt } = spec
  // 12 V units in series to reach the system voltage, then parallel strings.
  const perString = Math.ceil(system_voltage / BATTERY_UNIT_VOLTAGE)
  const strings = perString > 0 ? output.numbers_of_batteries / perString : 0
  const installed = output.numbers_of_solar_panel * solar_panel_watt

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
      <Tile
        Icon={Zap}
        label="Inverter"
        value={num(output.inverter_rating)}
        unit="kVA"
        detail={[`${num(output.total_load)} W peak load`]}
      />
      <Tile
        Icon={BatteryFull}
        label="Batteries"
        value={num(output.numbers_of_batteries)}
        unit={<>× {num(battery_capacity)} Ah</>}
        detail={[
          ...(strings > 0 ? [`${perString}S × ${num(strings)}P`] : []),
          `${num(output.total_battery_capacity)} Ah @ ${num(system_voltage)} V`,
        ]}
      />
      <Tile
        Icon={Sun}
        label="Solar"
        value={num(output.numbers_of_solar_panel)}
        unit={<>× {num(solar_panel_watt)} W</>}
        detail={[
          `${num(output.total_solar_panel_capacity_needed)} Wp needed`,
          `${num(installed)} W installed`,
        ]}
      />
      <Tile
        Icon={Gauge}
        label="Controller"
        value={num(output.controller_current)}
        unit="A"
        detail={[`Array ${num(output.total_current)} A`, `@ ${num(system_voltage)} V`]}
      />
    </div>
  )
}
