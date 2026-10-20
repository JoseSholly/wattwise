import { useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'
import { useInView } from '../lib/useInView'

/**
 * One-line schematic of a residential solar backup system.
 *
 * Design intent: engineering datasheet, not illustration. Components live in a
 * centered column; labels sit in a right-hand column connected by dashed
 * leader lines, callout-style. Amber is reserved for the energy itself —
 * traveling pulses on the circuit, charging cells, and lit pendant lamps.
 *
 * On first view the chain assembles top to bottom: each stage fades in and the
 * wire to the next one draws itself, so a reader follows the energy's path
 * from sun to home before the pulses start flowing.
 */
export function SolarFlowDiagram() {
  const line = 'rgb(var(--line-strong))'
  const fill = 'rgb(var(--surface-2))'
  const label = 'rgb(var(--subtle))'
  const ink = 'rgb(var(--fg))'
  const accent = 'rgb(var(--accent))'
  const accentInk = 'rgb(var(--accent-ink))'
  const surfaceColor = 'rgb(var(--surface))'

  const mono = {
    fontFamily: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 500,
    letterSpacing: '0.12em',
  } as const

  const PULSE_DUR = 5.4
  const PULSE_DELAYS = [0, PULSE_DUR / 3, (PULSE_DUR * 2) / 3]

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const reduce = useReducedMotion()
  const shown = inView || !!reduce

  // Sequenced assembly: stage i appears STEP seconds after stage i-1.
  const STEP = 0.32
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const stage = (i: number): CSSProperties =>
    reduce
      ? {}
      : {
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : 'translateY(8px)',
          transformBox: 'fill-box',
          transition: `opacity 0.8s ${ease} ${i * STEP}s, transform 0.8s ${ease} ${i * STEP}s`,
        }
  // Wires draw downward once the stage above them has landed.
  const wire = (len: number, i: number) => ({
    strokeDasharray: len,
    strokeDashoffset: shown ? 0 : len,
    style: reduce ? undefined : { transition: `stroke-dashoffset 0.45s ease-out ${i * STEP + 0.2}s` },
  })

  // Component midline Y-coordinates — used to place both the leaders and the labels.
  const rows = [
    { y: 83, right: 250, text: 'PV ARRAY' },
    { y: 162, right: 200, text: 'CHARGE CONTROLLER' },
    { y: 242, right: 230, text: 'BATTERY BANK' },
    { y: 320, right: 200, text: 'INVERTER' },
    { y: 415, right: 196, text: 'HOME' },
  ]

  return (
    <div
      ref={ref}
      className="relative isolate w-full overflow-hidden rounded-2xl border border-line bg-surface"
    >
      {/* Warm daylight pooling from the sun at the top of the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-[37.5%] -z-10 h-64 w-64 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--accent) / 0.45), transparent)' }}
      />
      <svg
        viewBox="0 0 400 470"
        className="block h-auto w-full"
        role="img"
        aria-label="One-line schematic callout: sun to PV array to charge controller to battery bank to inverter to home. Each stage labeled in a right-hand column. Amber pulses trace the direction of energy flow; the battery cells visibly charge; the home's pendant lamps are lit."
      >
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <filter id="glow-soft" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <path id="circuit" d="M 150 32 L 150 424" fill="none" />
        </defs>

        {/* ─────────────────────────── WIRES ─────────────────────────── */}
        <g stroke={line} strokeWidth="1.25" fill="none">
          <line x1="150" y1="32" x2="150" y2="60" {...wire(28, 0)} />
          <line x1="150" y1="106" x2="150" y2="146" {...wire(40, 1)} />
          <line x1="150" y1="178" x2="150" y2="216" {...wire(38, 2)} />
          <line x1="150" y1="268" x2="150" y2="304" {...wire(36, 3)} />
          <line x1="150" y1="336" x2="150" y2="376" {...wire(40, 4)} />
        </g>

        {/* ─────────────────────────── SUN ─────────────────────────── */}
        <g style={stage(0)}>
          <circle cx="150" cy="20" r="12" fill={accent} opacity="0.35" filter="url(#glow-soft)">
            <animate attributeName="r" values="11;15;11" dur="4s" repeatCount="indefinite" />
          </circle>
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
            {!reduce && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 150 20"
                to="360 150 20"
                dur="30s"
                repeatCount="indefinite"
              />
            )}
          </g>
          <circle cx="150" cy="20" r="7" fill={accent} />
        </g>

        {/* ─────────────────────────── PV ARRAY ─────────────────────────── */}
        <g style={stage(1)}>
          <rect
            x="50"
            y="60"
            width="200"
            height="46"
            rx="3"
            fill={fill}
            stroke={line}
            strokeWidth="1.25"
          />
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
          {/* Sunlight glinting across the cells */}
          {!reduce && (
            <rect x="50" y="60" width="26" height="46" fill={accent} opacity="0">
              <animate attributeName="x" values="40;250" dur="4.5s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0;0.22;0"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </rect>
          )}
        </g>

        {/* ─────────────────────────── CHARGE CONTROLLER ─────────────────────────── */}
        <g style={stage(2)}>
          <rect
            x="100"
            y="146"
            width="100"
            height="32"
            rx="3"
            fill={fill}
            stroke={line}
            strokeWidth="1.25"
          />
          <text x="150" y="167" textAnchor="middle" fill={ink} fontSize="8" {...mono}>
            MPPT
          </text>
        </g>

        {/* ─────────────────────────── BATTERY BANK (cells charge in sequence) ─────────────────────────── */}
        <g style={stage(3)}>
          <rect
            x="70"
            y="216"
            width="160"
            height="52"
            rx="3"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          {[0, 1, 2, 3].map((i) => {
            const x = 86 + i * 32
            const begin = `${i * 0.6}s`
            return (
              <g key={i}>
                <rect x={x + 7} y={222} width="6" height="3" fill={line} />
                <rect
                  x={x}
                  y={225}
                  width="20"
                  height="36"
                  rx="1.5"
                  fill={fill}
                  stroke={line}
                  strokeWidth="1.25"
                />
                <rect x={x + 2} y="259" width="16" height="0" fill={accent} opacity="0" rx="1">
                  <animate
                    attributeName="y"
                    values="259;227;227;259"
                    keyTimes="0;0.6;0.85;1"
                    dur="3.2s"
                    begin={begin}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="height"
                    values="0;32;32;0"
                    keyTimes="0;0.6;0.85;1"
                    dur="3.2s"
                    begin={begin}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.75;0.75;0;0"
                    keyTimes="0;0.6;0.85;1"
                    dur="3.2s"
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            )
          })}
        </g>

        {/* ─────────────────────────── INVERTER ─────────────────────────── */}
        <g style={stage(4)}>
          <rect
            x="100"
            y="304"
            width="100"
            height="32"
            rx="3"
            fill={fill}
            stroke={line}
            strokeWidth="1.25"
          />
          <line
            x1="112"
            y1="320"
            x2="138"
            y2="320"
            stroke={ink}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <line x1="146" y1="312" x2="146" y2="328" stroke={line} strokeWidth="0.75" />
          <path
            d="M 154 320 Q 160 310 166 320 T 178 320 T 190 320"
            fill="none"
            stroke={ink}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </g>

        {/* ─────────────────────────── HOME ───────────────────────────
            Distinct roof (triangle with overhanging eaves) sitting on a wall
            rectangle. The body path is open at the top so the roof's base line
            serves as the ceiling and no stroke is double-drawn. */}
        <g style={stage(5)}>
          {/* Warm interior light spilling from the lamps */}
          <ellipse cx="150" cy="430" rx="34" ry="16" fill={accent} opacity="0.18" filter="url(#glow-soft)">
            <animate
              attributeName="opacity"
              values="0.12;0.24;0.12"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Walls + floor only (open top) */}
          <path
            d="M 110 412 L 110 454 L 190 454 L 190 412"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
          />
          {/* Roof — eaves overhang the walls by ~6px each side */}
          <polygon
            points="104,412 150,376 196,412"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          {/* Gable detail: small round attic window centered in the roof */}
          <circle cx="150" cy="400" r="2.5" fill={fill} stroke={line} strokeWidth="0.75" />
          {/* Door */}
          <rect
            x="142"
            y="434"
            width="16"
            height="20"
            fill="transparent"
            stroke={line}
            strokeWidth="1.25"
          />
          {/* Door knob */}
          <circle cx="155" cy="444" r="0.6" fill={line} />

          {/* ── Pendant lamps: cord → socket (with threading) → oval glass bulb ── */}
          {[128, 172].map((x) => (
            <g key={x}>
              <line x1={x} y1="412" x2={x} y2="417" stroke={line} strokeWidth="0.75" />
              <rect x={x - 2.2} y="417" width="4.4" height="3" fill={line} rx="0.4" />
              <line
                x1={x - 2.2}
                y1="418.5"
                x2={x + 2.2}
                y2="418.5"
                stroke={fill}
                strokeWidth="0.4"
              />
              <ellipse
                cx={x}
                cy="425"
                rx="5.8"
                ry="6.4"
                fill={accent}
                opacity="0.45"
                filter="url(#glow)"
              />
              <ellipse cx={x} cy="425" rx="3.6" ry="4.2" fill={accent} />
              <ellipse
                cx={x - 1.1}
                cy="423.5"
                rx="0.7"
                ry="1.1"
                fill={surfaceColor}
                opacity="0.55"
              />
            </g>
          ))}
        </g>

        {/* ─────────────────────────── WIRE ANNOTATIONS ─────────────────────────── */}
        <g {...mono} fontSize="7">
          <text x="158" y="128" dominantBaseline="middle" fill={label} style={stage(2)}>
            DC
          </text>
          <text x="158" y="358" dominantBaseline="middle" fill={accentInk} style={stage(5)}>
            AC
          </text>
        </g>

        {/* ─────────────────────────── SIDE LABELS (callout-style) ─────────────────────────── */}
        {rows.map((r, i) => (
          <g key={r.y} style={stage(i + 1)}>
            <line
              x1={r.right}
              y1={r.y}
              x2="258"
              y2={r.y}
              stroke={label}
              strokeWidth="0.75"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            <circle cx={r.right} cy={r.y} r="1.1" fill={label} opacity="0.7" />
            <text
              x="263"
              y={r.y}
              {...mono}
              fill={label}
              fontSize="8"
              textAnchor="start"
              dominantBaseline="middle"
            >
              {r.text}
            </text>
          </g>
        ))}

        {/* ─────────────────────────── ENERGY PULSES ───────────────────────────
            Faded in once the chain has assembled, so current appears to start
            flowing only after every stage is in place. */}
        <g
          style={
            reduce
              ? undefined
              : { opacity: shown ? 1 : 0, transition: `opacity 0.6s ease-out ${6 * STEP}s` }
          }
        >
          {PULSE_DELAYS.map((delay, i) => (
            <g key={i}>
              <circle r="7" fill={accent} opacity="0" filter="url(#glow)">
                <animate
                  attributeName="opacity"
                  values="0;0.5;0.5;0"
                  keyTimes="0;0.08;0.92;1"
                  dur={`${PULSE_DUR}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
                <animateMotion
                  dur={`${PULSE_DUR}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                >
                  <mpath href="#circuit" />
                </animateMotion>
              </circle>
              <circle r="2.2" fill={accent} opacity="0">
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.08;0.92;1"
                  dur={`${PULSE_DUR}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
                <animateMotion
                  dur={`${PULSE_DUR}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                >
                  <mpath href="#circuit" />
                </animateMotion>
              </circle>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
