import type { ReactNode } from 'react'
import type { SizingOutput } from '../api/types'

const fmt = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })
const n = (value: number) => fmt.format(value)

type ResultItem = {
  id: number
  name: string
  quantity: number
  power_rating: number
  /** Hours; per item in v2, shared in v1. */
  backup_time: number
}

type Props = {
  output: SizingOutput
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
  items: ResultItem[]
  /** v1 only: the single backup time that applied to every appliance. */
  sharedBackupTime?: number
}

const BATTERY_UNIT_VOLTAGE = 12

function Row({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 border-b border-neutral-200 py-3 last:border-b-0">
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="min-w-0">
        <div className="text-base font-semibold tabular-nums">{value}</div>
        {detail && <div className="mt-0.5 text-xs tabular-nums text-neutral-500">{detail}</div>}
      </dd>
    </div>
  )
}

export function Results({
  output,
  system_voltage,
  battery_capacity,
  solar_panel_watt,
  items,
  sharedBackupTime,
}: Props) {
  // Bank layout: 12 V units in series to reach the system voltage, then parallel strings.
  const perString = Math.ceil(system_voltage / BATTERY_UNIT_VOLTAGE)
  const strings = perString > 0 ? output.numbers_of_batteries / perString : 0
  const installedArray = output.numbers_of_solar_panel * solar_panel_watt
  const dailyEnergy = items.reduce((sum, i) => sum + i.power_rating * i.quantity * i.backup_time, 0)

  return (
    <div className="flex flex-col gap-6">
      <dl>
        <Row
          label="Inverter"
          value={`${n(output.inverter_rating)} kVA`}
          detail={`for ${n(output.total_load)} W running together`}
        />
        <Row
          label="Batteries"
          value={`${n(output.numbers_of_batteries)} × ${n(battery_capacity)} Ah, 12 V`}
          detail={
            <>
              {n(output.total_battery_capacity)} Ah bank at {n(system_voltage)} V
              {strings > 0 && (
                <>
                  {' · '}
                  {perString} in series × {n(strings)} {strings === 1 ? 'string' : 'strings'}
                </>
              )}
            </>
          }
        />
        <Row
          label="Solar panels"
          value={`${n(output.numbers_of_solar_panel)} × ${n(solar_panel_watt)} W`}
          detail={`${n(output.total_solar_panel_capacity_needed)} Wp needed · ${n(installedArray)} W installed`}
        />
        <Row
          label="Charge controller"
          value={`${n(output.controller_current)} A`}
          detail={`array current ${n(output.total_current)} A at ${n(system_voltage)} V`}
        />
        <Row
          label="Daily energy"
          value={`${n(dailyEnergy)} Wh`}
          detail={
            sharedBackupTime !== undefined
              ? `${n(output.total_load)} W × ${n(sharedBackupTime)} h for every appliance`
              : 'sum of watts × qty × hours for each appliance'
          }
        />
      </dl>

      <div>
        <h3 className="eyebrow mb-2">Appliances</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                <th className="py-1.5 pr-2 font-normal">Name</th>
                <th className="px-2 py-1.5 text-right font-normal">Qty</th>
                <th className="px-2 py-1.5 text-right font-normal">W</th>
                <th className="px-2 py-1.5 text-right font-normal">h</th>
                <th className="py-1.5 pl-2 text-right font-normal">Wh</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={`${item.id}-${i}`} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-1.5 pr-2">{item.name}</td>
                  <td className="px-2 py-1.5 text-right">{n(item.quantity)}</td>
                  <td className="px-2 py-1.5 text-right">{n(item.power_rating)}</td>
                  <td className="px-2 py-1.5 text-right">{n(item.backup_time)}</td>
                  <td className="py-1.5 pl-2 text-right">
                    {n(item.power_rating * item.quantity * item.backup_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        Assumes power factor 0.8, inverter efficiency 80%, 50% battery depth of discharge,
        6 peak sun hours and 80% solar efficiency. Round the inverter and controller up to the
        next size you can buy.
      </p>
    </div>
  )
}
