import type { ReactNode } from 'react'
import type { SizingOutput } from '../api/types'
import { num } from '../lib/format'

export type SpecItem = {
  name: string
  quantity: number
  power_rating: number
  backup_time: number
}

export type SpecInput = {
  output: SizingOutput
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
  /** v1: shared across every item; v2: undefined (each item carries its own) */
  shared_backup_time?: number
  items: SpecItem[]
}

const BATTERY_UNIT_VOLTAGE = 12

/**
 * Client-facing summary of the sizing result. Four plain-English sections:
 *   1. What you're powering
 *   2. What equipment you need (shopping list)
 *   3. How it all fits together (battery wiring)
 *   4. Important recommendations
 *
 * The exact spec numbers still appear in bold next to each component so an
 * installer can read them off directly.
 */
export function SpecSheet({ spec }: { spec: SpecInput }) {
  const { output, system_voltage, battery_capacity, solar_panel_watt, shared_backup_time, items } = spec

  const perString = Math.ceil(system_voltage / BATTERY_UNIT_VOLTAGE)
  const strings = perString > 0 ? Math.round(output.numbers_of_batteries / perString) : 0

  const totalDailyWh = items.reduce(
    (sum, it) => sum + it.quantity * it.power_rating * it.backup_time,
    0,
  )
  const totalDailyKwh = totalDailyWh / 1000
  const applianceCount = items.reduce((sum, it) => sum + it.quantity, 0)

  const batteryBankWh = output.numbers_of_batteries * BATTERY_UNIT_VOLTAGE * battery_capacity
  const usableKwh = (batteryBankWh * 0.5) / 1000

  return (
    <div className="flex flex-col gap-10">
      <PoweringSummary
        applianceCount={applianceCount}
        totalLoadW={output.total_load}
        totalDailyKwh={totalDailyKwh}
        sharedBackupTime={shared_backup_time}
      />
      <ShoppingList
        output={output}
        system_voltage={system_voltage}
        battery_capacity={battery_capacity}
        solar_panel_watt={solar_panel_watt}
      />
      <WiringExplainer
        system_voltage={system_voltage}
        perString={perString}
        strings={strings}
        numbers_of_batteries={output.numbers_of_batteries}
      />
      <PracticalTips
        total_battery_capacity={output.total_battery_capacity}
        usableKwh={usableKwh}
        batteryBankKwh={batteryBankWh / 1000}
        system_voltage={system_voltage}
      />
      <ClosingLine
        applianceCount={applianceCount}
        totalLoadW={output.total_load}
        sharedBackupTime={shared_backup_time}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   1. What you're powering
   ────────────────────────────────────────────────────────────────────────── */

function PoweringSummary({
  applianceCount,
  totalLoadW,
  totalDailyKwh,
  sharedBackupTime,
}: {
  applianceCount: number
  totalLoadW: number
  totalDailyKwh: number
  sharedBackupTime: number | undefined
}) {
  return (
    <Section eyebrow="01" title="What you're powering">
      <p className="max-w-prose text-[15px] leading-relaxed text-muted">
        {sharedBackupTime !== undefined
          ? `Your plan is designed to run every appliance you selected simultaneously for ${num(sharedBackupTime)} hour${sharedBackupTime === 1 ? '' : 's'} per day, straight from the sun and the batteries.`
          : 'Your plan is designed to run each appliance for its own daily runtime — detailed in the breakdown on the right — from the sun and the batteries.'}
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
        <Stat label="Appliances" value={num(applianceCount)} unit={applianceCount === 1 ? 'item' : 'items'} />
        <Stat label="Running load" value={num(totalLoadW)} unit="W" />
        <Stat label="Daily energy" value={num(Math.round(totalDailyKwh * 100) / 100)} unit="kWh" />
      </dl>
    </Section>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="min-w-0">
      <dt className="label-mono">{label}</dt>
      <dd className="num mt-1.5 truncate text-lg font-semibold text-fg sm:text-xl">
        {value}
        <span className="ml-1 text-xs font-normal text-muted">{unit}</span>
      </dd>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   2. Shopping list — four component cards
   ────────────────────────────────────────────────────────────────────────── */

function ShoppingList({
  output,
  battery_capacity,
  solar_panel_watt,
}: {
  output: SizingOutput
  system_voltage: number
  battery_capacity: number
  solar_panel_watt: number
}) {
  const installedPanelW = output.numbers_of_solar_panel * solar_panel_watt
  const batteryBankKwh = (output.numbers_of_batteries * BATTERY_UNIT_VOLTAGE * battery_capacity) / 1000
  const usableKwh = Math.round((batteryBankKwh / 2) * 10) / 10

  return (
    <Section eyebrow="02" title="What to buy">
      <ol className="flex flex-col gap-3">
        <Card
          index="01"
          name="Inverter"
          spec={<Spec value={num(output.inverter_rating)} unit="kVA" />}
          detail={
            <>
              Converts battery DC into household AC.{' '}
              <span className="num text-fg">≈ {num(Math.round(output.inverter_rating * 1000))} W</span> continuous.
            </>
          }
        />
        <Card
          index="02"
          name="Battery bank"
          spec={<Spec value={num(output.numbers_of_batteries)} unit="batteries" />}
          detail={
            <>
              Stores daytime energy for after-dark use.{' '}
              <span className="num text-fg">
                {num(output.numbers_of_batteries)} × {num(battery_capacity)} Ah / {num(BATTERY_UNIT_VOLTAGE)} V
              </span>{' '}
              · <span className="num text-fg">≈ {num(Math.round(batteryBankKwh * 10) / 10)} kWh</span> total,{' '}
              <span className="num text-fg">{num(usableKwh)} kWh</span> usable.
            </>
          }
        />
        <Card
          index="03"
          name="Solar panels"
          spec={<Spec value={num(output.numbers_of_solar_panel)} unit="panels" />}
          detail={
            <>
              Powers daytime loads and refills the batteries.{' '}
              <span className="num text-fg">
                {num(output.numbers_of_solar_panel)} × {num(solar_panel_watt)} W = {num(installedPanelW)} W
              </span>{' '}
              installed.
            </>
          }
        />
        <Card
          index="04"
          name="Charge controller"
          spec={<Spec value={num(output.controller_current)} unit="A min." />}
          detail={
            <>
              Protects the batteries from overcharge.{' '}
              <span className="num text-fg">1.25×</span> the array's{' '}
              <span className="num text-fg">{num(output.total_current)} A</span> output, for headroom.
            </>
          }
        />
      </ol>
    </Section>
  )
}

function Card({
  index,
  name,
  spec,
  detail,
}: {
  index: string
  name: string
  spec: ReactNode
  detail: ReactNode
}) {
  return (
    <li className="grid gap-3 rounded-md border border-line bg-surface2/40 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-5">
      <span className="label-mono num text-accent-ink">{index}</span>
      <div className="min-w-0">
        <h4 className="display text-base font-semibold text-fg sm:text-lg">{name}</h4>
        <p className="mt-1 text-[13px] leading-relaxed text-muted sm:text-[13.5px]">{detail}</p>
      </div>
      <div className="sm:text-right">{spec}</div>
    </li>
  )
}

function Spec({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="num whitespace-nowrap text-xl font-semibold text-fg sm:text-2xl">
      {value}
      <span className="ml-1 text-xs font-normal text-muted">{unit}</span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   3. How it works together — battery wiring
   ────────────────────────────────────────────────────────────────────────── */

function WiringExplainer({
  system_voltage,
  perString,
  strings,
}: {
  system_voltage: number
  perString: number
  strings: number
  numbers_of_batteries: number
}) {
  const hasGrid = strings > 0 && perString > 0
  if (!hasGrid) return null

  return (
    <Section eyebrow="03" title="How it fits together">
      <div className="rounded-md border border-line bg-surface2/40 p-5 sm:p-6">
        <BatteryGrid perString={perString} strings={strings} systemVoltage={system_voltage} />
        <p className="mt-4 text-[13px] leading-relaxed text-muted sm:text-sm">
          <strong className="font-medium text-fg">{num(perString)} in a column</strong> makes a {num(system_voltage)} V pack.{' '}
          <strong className="font-medium text-fg">{num(strings)} column{strings === 1 ? '' : 's'} in parallel</strong> add storage without changing voltage.
        </p>
      </div>
    </Section>
  )
}

function BatteryGrid({
  perString,
  strings,
  systemVoltage,
}: {
  perString: number
  strings: number
  systemVoltage: number
}) {
  const cellW = 34
  const cellH = 24
  const gapX = 18
  const gapY = 10
  const padX = 20
  const padY = 22
  const bracketW = 8
  const labelW = 34

  const gridW = strings * cellW + (strings - 1) * gapX
  const gridH = perString * cellH + (perString - 1) * gapY
  const totalW = padX * 2 + bracketW + labelW + gridW
  const totalH = padY * 2 + gridH + 18

  const line = 'rgb(var(--line-strong))'
  const fill = 'rgb(var(--surface))'
  const label = 'rgb(var(--subtle))'

  const mono = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 500,
    letterSpacing: '0.1em',
  } as const

  const gridLeft = padX + bracketW + labelW

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="block h-auto w-full max-w-[22rem]"
      role="img"
      aria-label={`${perString} batteries in series × ${strings} in parallel, forming a ${systemVoltage}-volt pack.`}
    >
      {/* Series bracket + voltage label on the left side of the first column */}
      <g stroke={line} strokeWidth="1" fill="none">
        <path
          d={`M ${padX + bracketW} ${padY} H ${padX} V ${padY + gridH} H ${padX + bracketW}`}
        />
      </g>
      <text
        x={padX + bracketW + 4}
        y={padY + gridH / 2}
        dominantBaseline="middle"
        textAnchor="start"
        fill={label}
        fontSize="8"
        {...mono}
      >
        {num(systemVoltage)} V
      </text>

      {/* Battery cells */}
      {Array.from({ length: strings }).map((_, col) =>
        Array.from({ length: perString }).map((__, row) => {
          const x = gridLeft + col * (cellW + gapX)
          const y = padY + row * (cellH + gapY)
          return (
            <g key={`${col}-${row}`}>
              {/* terminal nub */}
              <rect x={x + 12} y={y - 2} width="10" height="2" fill={line} />
              <rect
                x={x}
                y={y}
                width={cellW}
                height={cellH}
                rx="2"
                fill={fill}
                stroke={line}
                strokeWidth="1"
              />
            </g>
          )
        }),
      )}

      {/* Parallel connectors across the top of each column */}
      {strings > 1 && (
        <g stroke={line} strokeWidth="1" fill="none">
          <line
            x1={gridLeft + cellW / 2}
            y1={padY - 10}
            x2={gridLeft + (strings - 1) * (cellW + gapX) + cellW / 2}
            y2={padY - 10}
          />
          {Array.from({ length: strings }).map((_, col) => {
            const x = gridLeft + col * (cellW + gapX) + cellW / 2
            return <line key={`vc-${col}`} x1={x} y1={padY - 10} x2={x} y2={padY - 4} />
          })}
        </g>
      )}

      {/* "× N parallel" annotation below the grid */}
      <text
        x={gridLeft + gridW / 2}
        y={padY + gridH + 14}
        textAnchor="middle"
        fill={label}
        fontSize="8"
        {...mono}
      >
        × {num(strings)} column{strings === 1 ? '' : 's'} in parallel
      </text>
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   4. Practical tips
   ────────────────────────────────────────────────────────────────────────── */

function PracticalTips({
  usableKwh,
  batteryBankKwh,
  system_voltage,
}: {
  total_battery_capacity: number
  usableKwh: number
  batteryBankKwh: number
  system_voltage: number
}) {
  return (
    <Section eyebrow="04" title="Worth knowing">
      <ul className="flex flex-col gap-3">
        <Tip>
          <strong className="font-semibold text-fg">Half the pack stays in reserve.</strong> You'll use ≈{' '}
          <span className="num text-fg">{num(Math.round(usableKwh * 10) / 10)} kWh</span> of{' '}
          <span className="num text-fg">{num(Math.round(batteryBankKwh * 10) / 10)} kWh</span> per day — the untouched half roughly doubles pack life.
        </Tip>
        <Tip>
          <strong className="font-semibold text-fg">The inverter and panels run ~20% above the raw numbers.</strong> That buffer covers heat loss so appliances still get full rated power.
        </Tip>
        <Tip>
          <strong className="font-semibold text-fg">Motors spike at startup.</strong> ACs, pumps and fridges can pull 2–3× rated power the instant they switch on — avoid stacking two large motors on the same circuit.
        </Tip>
        <Tip>
          <strong className="font-semibold text-fg">Lithium cuts the pack roughly in half</strong> and lasts 2–3× longer. Higher sticker price, often lower lifetime cost.
        </Tip>
        {system_voltage < 48 && (
          <Tip>
            <strong className="font-semibold text-fg">48 V scales better than {num(system_voltage)} V</strong> — thinner cables, less wiring loss. Raise it with your installer if you'll add more loads later.
          </Tip>
        )}
      </ul>
    </Section>
  )
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <li className="border-l-2 border-line-strong pl-4 text-[13px] leading-relaxed text-muted sm:text-sm sm:leading-relaxed">
      {children}
    </li>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Closing one-liner
   ────────────────────────────────────────────────────────────────────────── */

function ClosingLine({
  applianceCount,
  totalLoadW,
  sharedBackupTime,
}: {
  applianceCount: number
  totalLoadW: number
  sharedBackupTime: number | undefined
}) {
  const totalKw = Math.round((totalLoadW / 1000) * 100) / 100
  return (
    <section className="rounded-md border border-line bg-surface2/60 p-5 sm:p-6">
      <p className="label-mono mb-2">In short</p>
      <p className="text-base font-medium leading-relaxed text-fg sm:text-lg">
        This plan comfortably runs{' '}
        <strong className="font-semibold">
          {num(applianceCount)} appliance{applianceCount === 1 ? '' : 's'}
        </strong>{' '}
        totalling{' '}
        <strong className="font-semibold">{num(totalKw)} kW</strong>
        {sharedBackupTime !== undefined ? (
          <>
            {' '}for{' '}
            <strong className="font-semibold">
              {num(sharedBackupTime)} hour{sharedBackupTime === 1 ? '' : 's'} a day
            </strong>
          </>
        ) : (
          <> at each appliance's own daily runtime</>
        )}{' '}
        on solar power, provided you don't drain the batteries past the halfway mark.
      </p>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Shared section wrapper
   ────────────────────────────────────────────────────────────────────────── */

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="label-mono num text-accent-ink">{eyebrow}</span>
        <h3 className="display text-xl font-semibold text-fg sm:text-2xl">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
