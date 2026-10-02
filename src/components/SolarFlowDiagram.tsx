import { useEffect, useState } from 'react'
import { useInView } from '../lib/useInView'

/**
 * One-line schematic of a residential solar backup system.
 *
 * Design intent: engineering datasheet, not illustration. Components live in a
 * centred column; labels sit in a right-hand column connected by dashed
 * leader lines, callout-style. Amber is reserved for the energy itself:
 * current flowing on each conductor (dashed strokes moving in the direction
 * of flow), charging cells, the MPPT readout and the lit lamps.
 *
 * The numbers are illustrative of a 24 V system on a sunny day, not output
 * from the API.
 */

/** One full charge cycle: 20% → 100%, then a short float before it restarts. */
const CHARGE_SECONDS = 12
const FLOAT_SECONDS = 2.5
const TICK_MS = 400
const LOAD_W = 120 // two lamps plus standby, drawn through the inverter
const MPPT_EFFICIENCY = 0.97

type Readings = {
  soc: number
  charging: boolean
  pvV: number
  pvA: number
  batV: number
  batA: number
}

function readingsAt(seconds: number): Readings {
  const phase = seconds % (CHARGE_SECONDS + FLOAT_SECONDS)
  const charging = phase < CHARGE_SECONDS
  const soc = charging ? 0.2 + (0.8 * phase) / CHARGE_SECONDS : 1

  // MPPT hunting around the maximum power point: small, smooth wobble.
  const pvV = 38.4 + 0.45 * Math.sin(seconds * 1.3)
  const batV = 25.2 + 3.2 * soc // lead-acid bank rises as it fills
  const fullPvA = 21.1 + 0.6 * Math.sin(seconds * 0.7 + 1)
  // Once full, the controller throttles back to just what the house uses.
  const pvA = charging ? fullPvA : LOAD_W / MPPT_EFFICIENCY / pvV
  const batA = charging ? (pvV * pvA * MPPT_EFFICIENCY - LOAD_W) / batV : 0

  return { soc, charging, pvV, pvA, batV, batA }
}

/** Ticks while visible; frozen at a representative mid-charge frame for reduced motion. */
function useReadings(active: boolean): Readings {
  const [seconds, setSeconds] = useState(CHARGE_SECONDS * 0.55)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now() - seconds * 1000
    const id = window.setInterval(() => setSeconds((performance.now() - start) / 1000), TICK_MS)
    return () => window.clearInterval(id)
    // `seconds` only seeds the clock so it resumes where it paused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return readingsAt(seconds)
}

const fixed = (n: number, d = 1) => n.toFixed(d)

export function SolarFlowDiagram() {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.05 })
  const r = useReadings(inView)

  const line = 'rgb(var(--line-strong))'
  const fill = 'rgb(var(--surface-2))'
  const label = 'rgb(var(--subtle))'
  const ink = 'rgb(var(--fg))'
  const accent = 'rgb(var(--accent))'
  const accentInk = 'rgb(var(--accent-ink))'
  const surfaceColor = 'rgb(var(--surface))'
  const bg = 'rgb(var(--bg))'

  const mono = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 500,
    letterSpacing: '0.12em',
  } as const

  const pvW = r.pvV * r.pvA
  const socPct = Math.round(r.soc * 100)

  // Component midlines: leaders, labels and live sub-labels hang off these.
  const rows = [
    { y: 83, right: 250, text: 'PV ARRAY', sub: `${Math.round(pvW)} W` },
    { y: 169, right: 208, text: 'CHARGE CONTROLLER', sub: r.charging ? 'MPPT TRACKING' : 'LOAD ONLY' },
    {
      y: 242,
      right: 230,
      text: 'BATTERY BANK',
      sub: r.charging ? `CHARGING ${socPct}%` : `FLOAT ${socPct}%`,
    },
    { y: 320, right: 200, text: 'INVERTER', sub: '230 V · 50 Hz' },
    { y: 415, right: 196, text: 'HOME', sub: '2 LOADS ON' },
  ]

  // Geometry shared by the wires and the flows drawn over them.
  const sunR = 19
  const photonTargets = [78, 122, 178, 222]
  const pvRows = [60 + 46 / 6, 83, 60 + (46 * 5) / 6]
  const cellXs = [86, 118, 150, 182] // left edge of each 20-wide cell
  const busY = 208
  const lamps = [128, 172]

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-md border border-line bg-surface">
      <svg
        viewBox="0 0 400 470"
        className="block h-auto w-full"
        role="img"
        aria-label={`One-line schematic: sunlight onto the PV array, through the MPPT charge controller (PV ${fixed(r.pvV)} V, ${fixed(r.pvA)} A), into a battery bank ${r.charging ? 'charging' : 'floating'} at ${socPct}%, through the inverter to two lit lamps in the home. Amber dashes show current flowing along each wire.`}
      >
        <defs>
          <filter id="sfd-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <radialGradient id="sfd-spill" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ─────────────────────────── WIRES (base) ─────────────────────────── */}
        <g stroke={line} strokeWidth="1.25" fill="none" strokeLinejoin="round">
          <line x1="150" y1="106" x2="150" y2="146" />
          {/* MPPT → DC bus → each cell terminal */}
          <path d={`M150 192 V${busY}`} />
          <path d={`M${cellXs[0] + 10} ${busY} H${cellXs[3] + 10}`} />
          {cellXs.map((x) => (
            <path key={x} d={`M${x + 10} ${busY} V222`} />
          ))}
          <line x1="150" y1="268" x2="150" y2="304" />
          <line x1="150" y1="336" x2="150" y2="376" />
        </g>
        {/* AC run inside the house: through the attic to the ceiling rose */}
        <path d="M150 376 V412" stroke={line} strokeWidth="0.75" strokeDasharray="1.5 2" fill="none" />

        {/* ─────────────────────────── SUN ─────────────────────────── */}
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return (
              <line
                key={i}
                x1={150 + Math.cos(a) * 12}
                y1={20 + Math.sin(a) * 12}
                x2={150 + Math.cos(a) * 17}
                y2={20 + Math.sin(a) * 17}
                stroke={accent}
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            )
          })}
          <circle cx="150" cy="20" r="7" fill={accent} />
        </g>

        {/* Irradiance: light travelling from the sun onto the array */}
        <g stroke={accent} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.75">
          {photonTargets.map((x) => {
            const dx = x - 150
            const dy = 60 - 20
            const len = Math.hypot(dx, dy)
            const sx = 150 + (dx / len) * sunR
            const sy = 20 + (dy / len) * sunR
            return (
              <path
                key={x}
                className="sfd-flow"
                style={{ animationDuration: '1.1s' }}
                d={`M${sx.toFixed(1)} ${sy.toFixed(1)} L${x} 59`}
              />
            )
          })}
        </g>

        {/* ─────────────────────────── PV ARRAY ─────────────────────────── */}
        <g>
          <rect x="50" y="60" width="200" height="46" rx="2" fill={fill} stroke={line} strokeWidth="1.25" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={`v${i}`}
              x1={50 + i * 25}
              y1={60}
              x2={50 + i * 25}
              y2={106}
              stroke={line}
              strokeWidth="0.75"
              opacity="0.7"
            />
          ))}
          {[1, 2].map((i) => (
            <line
              key={`h${i}`}
              x1={50}
              y1={60 + (i * 46) / 3}
              x2={250}
              y2={60 + (i * 46) / 3}
              stroke={line}
              strokeWidth="0.75"
              opacity="0.7"
            />
          ))}
        </g>

        {/* Generated current: along each cell string to the centre collector, then out */}
        <g stroke={accent} fill="none" strokeLinecap="round">
          {pvRows.map((y) => (
            <g key={y} strokeWidth="1" opacity="0.8">
              <path className="sfd-flow" style={{ animationDuration: '1.4s' }} d={`M56 ${y} H150`} />
              <path className="sfd-flow" style={{ animationDuration: '1.4s' }} d={`M244 ${y} H150`} />
            </g>
          ))}
          <path className="sfd-flow" strokeWidth="1.5" d="M150 64 V146" />
        </g>

        {/* ─────────────────────────── CHARGE CONTROLLER (MPPT) ─────────────────────────── */}
        <g>
          <rect x="92" y="146" width="116" height="46" rx="2" fill={fill} stroke={line} strokeWidth="1.25" />
          <text x="99" y="155.5" fill={label} fontSize="6" dominantBaseline="middle" {...mono}>
            MPPT
          </text>
          {/* Status LED: blinks while tracking, steady once the bank is full */}
          <circle
            cx="201"
            cy="155.5"
            r="1.8"
            fill={accent}
            className={r.charging ? 'sfd-led' : undefined}
          />
          {/* LCD readout */}
          <rect x="98" y="161" width="104" height="26" rx="1.5" fill={bg} stroke={line} strokeWidth="0.75" />
          <g fontSize="7.5" dominantBaseline="middle" {...mono} letterSpacing="0.02em">
            <text x="102" y="168.5" fill={label}>
              PV
            </text>
            <text x="157" y="168.5" fill={accentInk} textAnchor="end">
              {fixed(r.pvV)}V
            </text>
            <text x="198" y="168.5" fill={accentInk} textAnchor="end">
              {fixed(r.pvA)}A
            </text>
            <text x="102" y="179.5" fill={label}>
              BAT
            </text>
            <text x="157" y="179.5" fill={ink} textAnchor="end">
              {fixed(r.batV)}V
            </text>
            <text x="198" y="179.5" fill={ink} textAnchor="end">
              {fixed(Math.max(r.batA, 0))}A
            </text>
          </g>
        </g>

        {/* ─────────────────────────── BATTERY BANK ─────────────────────────── */}
        <g>
          <rect
            x="70"
            y="216"
            width="160"
            height="52"
            rx="2"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          {cellXs.map((x) => (
            <g key={x}>
              <rect x={x + 7} y={222} width="6" height="3" fill={line} />
              <rect x={x} y={225} width="20" height="36" rx="1.5" fill={fill} stroke={line} strokeWidth="1.25" />
              {/* State of charge, rising from the bottom */}
              <rect
                x={x + 2}
                y="227"
                width="16"
                height="32"
                rx="1"
                fill={accent}
                opacity="0.6"
                style={{
                  transform: `scaleY(${r.soc})`,
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                  transition: r.soc < 0.25 ? 'none' : `transform ${TICK_MS}ms linear`,
                }}
              />
              {/* Charging bolt; hidden once the cell is full */}
              {r.charging && (
                <path
                  d={`M${x + 11.5} 236 l-4 7 h3 l-1 6 l4 -7 h-3 z`}
                  fill={ink}
                  opacity="0.55"
                />
              )}
            </g>
          ))}
        </g>

        {/* MPPT → DC bus always carries the house load; the feeds into each cell
            carry charge current and stop once the bank is floating. */}
        <g stroke={accent} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
          {r.charging ? (
            cellXs.map((x) => (
              <path key={x} className="sfd-flow" d={`M150 192 V${busY} H${x + 10} V222`} />
            ))
          ) : (
            <path className="sfd-flow" d={`M150 192 V${busY}`} />
          )}
        </g>

        {/* ─────────────────────────── INVERTER ─────────────────────────── */}
        <g>
          <rect x="100" y="304" width="100" height="32" rx="2" fill={fill} stroke={line} strokeWidth="1.25" />
          <line x1="112" y1="320" x2="138" y2="320" stroke={ink} strokeWidth="1.25" strokeLinecap="round" />
          <line x1="146" y1="312" x2="146" y2="328" stroke={line} strokeWidth="0.75" />
          <path
            d="M 154 320 Q 160 310 166 320 T 178 320 T 190 320"
            fill="none"
            stroke={ink}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </g>

        {/* DC to the inverter, then AC up through the roof to each lamp */}
        <g stroke={accent} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path className="sfd-flow" d="M150 268 V304" />
          {lamps.map((x) => (
            <path key={x} className="sfd-flow" d={`M150 336 V412 H${x} V419`} />
          ))}
        </g>

        {/* ─────────────────────────── HOME ─────────────────────────── */}
        <g>
          <path
            d="M 110 412 L 110 454 L 190 454 L 190 412"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
          />
          <polygon
            points="104,412 150,376 196,412"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <rect x="142" y="434" width="16" height="20" fill="transparent" stroke={line} strokeWidth="1.25" />
          <circle cx="155" cy="444" r="0.6" fill={line} />

          {lamps.map((x, i) => (
            <g key={x}>
              {/* Light falling into the room */}
              <ellipse
                cx={x}
                cy="438"
                rx="16"
                ry="15"
                fill="url(#sfd-spill)"
                className="sfd-lamp"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <line x1={x} y1="412" x2={x} y2="417" stroke={line} strokeWidth="0.75" />
              <rect x={x - 2.2} y="417" width="4.4" height="3" fill={line} rx="0.4" />
              <line x1={x - 2.2} y1="418.5" x2={x + 2.2} y2="418.5" stroke={fill} strokeWidth="0.4" />
              <ellipse
                cx={x}
                cy="425"
                rx="5.8"
                ry="6.4"
                fill={accent}
                filter="url(#sfd-glow)"
                className="sfd-lamp"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <ellipse cx={x} cy="425" rx="3.6" ry="4.2" fill={accent} />
              <ellipse cx={x - 1.1} cy="423.5" rx="0.7" ry="1.1" fill={surfaceColor} opacity="0.55" />
            </g>
          ))}
        </g>

        {/* ─────────────────────────── WIRE ANNOTATIONS ─────────────────────────── */}
        <g {...mono} fontSize="7">
          <text x="158" y="128" dominantBaseline="middle" fill={label}>
            DC
          </text>
          <text x="158" y="358" dominantBaseline="middle" fill={accentInk}>
            AC
          </text>
        </g>

        {/* ─────────────────────────── SIDE LABELS (callout-style) ─────────────────────────── */}
        <g stroke={label} strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" fill="none">
          {rows.map((row) => (
            <line key={row.y} x1={row.right} y1={row.y} x2="258" y2={row.y} />
          ))}
        </g>
        <g fill={label} opacity="0.7">
          {rows.map((row) => (
            <circle key={row.y} cx={row.right} cy={row.y} r="1.1" />
          ))}
        </g>
        <g {...mono} textAnchor="start" dominantBaseline="middle">
          {rows.map((row) => (
            <g key={row.y}>
              <text x="263" y={row.y} fill={label} fontSize="8">
                {row.text}
              </text>
              <text x="263" y={row.y + 11.5} fill={accentInk} fontSize="7" letterSpacing="0.08em">
                {row.sub}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
