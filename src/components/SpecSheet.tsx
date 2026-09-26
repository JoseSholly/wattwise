import type { ReactNode } from 'react'
import type { SizingOutput } from '../api/types'
import { num } from '../lib/format'

export type SpecInput = {
  output: SizingOutput
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
}

const BATTERY_UNIT_VOLTAGE = 12

function Row({ label, value, unit, note }: { label: string; value: ReactNode; unit?: string; note?: ReactNode }) {
  return (
    <div className="row-hairline">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-fg">{label}</div>
        {note && <div className="mt-0.5 text-xs text-subtle">{note}</div>}
      </div>
      <div className="num shrink-0 text-right text-[15px] font-semibold tabular-nums text-fg">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="label-mono mb-1">{title}</h3>
      <div>{children}</div>
    </section>
  )
}

/**
 * Vertical spec-sheet layout: four grouped, hairline-divided sections.
 * The old 2×2 icon tile grid is gone — typography and structure carry it now.
 */
export function SpecSheet({ spec }: { spec: SpecInput }) {
  const { output, system_voltage, battery_capacity, solar_panel_watt } = spec
  const perString = Math.ceil(system_voltage / BATTERY_UNIT_VOLTAGE)
  const strings = perString > 0 ? Math.round(output.numbers_of_batteries / perString) : 0
  const installed = output.numbers_of_solar_panel * solar_panel_watt

  return (
    <div className="flex flex-col gap-8">
      <Group title="Inverter">
        <Row label="Rated capacity" value={num(output.inverter_rating)} unit="kVA" />
        <Row
          label="Total connected load"
          value={num(output.total_load)}
          unit="W"
          note="Sum of every appliance running at once"
        />
      </Group>

      <Group title="Battery bank">
        <Row label="System voltage" value={num(system_voltage)} unit="V" />
        <Row
          label="Total capacity"
          value={num(output.total_battery_capacity)}
          unit="Ah"
          note={`Sized at ${num(system_voltage)} V, 50% depth of discharge`}
        />
        <Row
          label="Battery count"
          value={
            <>
              {num(output.numbers_of_batteries)}
              <span className="text-xs font-normal text-muted"> × {num(battery_capacity)} Ah</span>
            </>
          }
          note={strings > 0 ? `${perString} in series × ${strings} in parallel` : undefined}
        />
      </Group>

      <Group title="Solar array">
        <Row
          label="Required capacity"
          value={num(output.total_solar_panel_capacity_needed)}
          unit="Wp"
          note="To recharge the bank in one sun-day"
        />
        <Row
          label="Panel count"
          value={
            <>
              {num(output.numbers_of_solar_panel)}
              <span className="text-xs font-normal text-muted"> × {num(solar_panel_watt)} W</span>
            </>
          }
          note={`${num(installed)} W installed`}
        />
      </Group>

      <Group title="Charging">
        <Row
          label="Array current"
          value={num(output.total_current)}
          unit="A"
          note={`Into a ${num(system_voltage)} V system`}
        />
        <Row
          label="Charge controller"
          value={num(output.controller_current)}
          unit="A"
          note="1.25× array current headroom"
        />
      </Group>
    </div>
  )
}
