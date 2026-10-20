import { ArrowDown, ArrowRight, ArrowUpRight, BatteryCharging, Gauge, Sun, Zap } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { EnergyTipsCarousel } from '../components/EnergyTipsCarousel'
import { EASE } from '../components/landing/ease'
import { Horizon } from '../components/landing/Horizon'
import {
  CountUp,
  FadeUp,
  Magnetic,
  Sparks,
  SplitWords,
  Spotlight,
} from '../components/landing/motion'
import { SolarFlowDiagram } from '../components/SolarFlowDiagram'
import { useAppliances } from '../api/appliances'
import { ASSUMPTIONS } from '../lib/model'

const STEPS = [
  {
    title: 'Configure your system',
    body:
      'Choose a system voltage, battery size and solar panel size. If you already own equipment, enter what you have.',
  },
  {
    title: 'Add your loads',
    body:
      'List the appliances you want to run during an outage and how long each should run for. Fridges keep going overnight; TVs only need a few hours.',
  },
  {
    title: 'Review your specification',
    body:
      'Get the required inverter capacity, battery bank, solar array and charge controller current, formatted as a professional spec sheet.',
  },
]

const OUTPUTS = [
  {
    label: 'Inverter capacity',
    unit: 'kVA',
    Icon: Zap,
    body:
      'The AC output your inverter must sustain when every appliance runs at the same moment, sized with a power-factor and efficiency headroom.',
  },
  {
    label: 'Battery bank',
    unit: 'Ah · count',
    Icon: BatteryCharging,
    body:
      'The total ampere-hours you need at the chosen system voltage, converted into a series-parallel arrangement of standard batteries.',
  },
  {
    label: 'Solar array',
    unit: 'W · count',
    Icon: Sun,
    body:
      'The panel wattage required to recharge the bank in a typical sun-day, converted into a whole number of your chosen panel size.',
  },
  {
    label: 'Charge controller',
    unit: 'A',
    Icon: Gauge,
    body:
      'The DC current your charge controller must accept, with a 1.25× headroom over the array’s installed current.',
  },
]

const HERO_STATS = [
  { label: 'Inverter', value: '0.66', unit: 'kVA' },
  { label: 'Batteries', value: '4', unit: '× 200 Ah' },
  { label: 'Solar', value: '2', unit: '× 400 W' },
  { label: 'Controller', value: '41.67', unit: 'A' },
]

export function LandingPage() {
  // Wake the Render instance now so the appliance list is ready by the time
  // the user reaches the loads step. Return value intentionally ignored.
  useAppliances()

  return (
    <>
      <div aria-hidden="true" className="grain z-20 hidden dark:block" />
      <Hero />
      <HowItWorks />
      <Outputs />
      <TechnicalExplanation />
      <FieldNotes />
      <VersionSplit />
      <CtaBand />
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0])

  const px = useMotionValue(0)
  const pointerX = useSpring(px, { stiffness: 40, damping: 18 })
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(e.clientX - (r.left + r.width / 2))
  }

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative isolate -mt-14 flex min-h-[100dvh] flex-col overflow-hidden pt-14"
    >
      <Horizon progress={scrollYProgress} pointerX={pointerX} />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-14 sm:px-6 sm:pb-10 sm:pt-20"
      >
        <FadeUp>
          <p className="label-mono">Backup power sizing · WattWise</p>
        </FadeUp>

        <SplitWords
          as="h1"
          text="Size your backup power system with confidence."
          delay={0.1}
          className="display mt-5 max-w-5xl font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] text-fg sm:mt-6 sm:text-6xl md:text-7xl lg:text-[80px]"
        />

        <FadeUp delay={0.45}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Tell WattWise which appliances you run and how long you need them to last during an
            outage. Get an inverter, battery bank, solar array and charge-controller spec you can
            take straight to an installer.
          </p>
        </FadeUp>

        <FadeUp
          delay={0.6}
          className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center"
        >
          <Magnetic>
            <Link to="/v1/system" className="btn-pill-accent group w-full px-7 sm:w-auto">
              Start sizing
              <ArrowRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </Magnetic>
          <a href="#how-it-works" className="btn-pill-ghost group">
            How it works
            <ArrowDown
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </a>
        </FadeUp>

        <FadeUp delay={0.8} className="mt-auto pt-16 sm:pt-24">
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-bg/50 backdrop-blur-md sm:grid-cols-4">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-5 py-4 sm:px-6 sm:py-5 ${i % 2 === 1 ? 'border-l border-line' : ''} ${
                  i > 1 ? 'border-t border-line sm:border-t-0' : ''
                } ${i === 2 ? 'sm:border-l' : ''}`}
              >
                <dt className="label-mono">{s.label}</dt>
                <dd className="num mt-1.5 text-xl font-semibold text-fg sm:text-2xl">
                  <CountUp value={s.value} delay={0.9 + i * 0.12} />{' '}
                  <span className="text-xs font-normal text-muted">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </motion.div>
    </section>
  )
}

function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section id="how-it-works" className="relative scroll-mt-14">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeUp>
              <p className="label-mono">How it works</p>
            </FadeUp>
            <SplitWords
              text="Three focused steps, one considered result."
              className="display mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl"
            />
            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
                WattWise splits the calculation into a short guided flow. You can move back and
                forth between steps at any time — your inputs are preserved.
              </p>
            </FadeUp>
          </div>

          <ol ref={listRef} className="relative flex flex-col gap-4 pl-16 sm:pl-20">
            {/* Progress rail: fills with current as you read down the steps */}
            <div
              aria-hidden="true"
              className="absolute bottom-10 left-[21px] top-10 w-px bg-line sm:left-[27px]"
            >
              <motion.div
                className="h-full w-full origin-top bg-accent shadow-[0_0_12px_1px_rgb(var(--accent)/0.7)]"
                style={{ scaleY: reduce ? 1 : fill }}
              />
            </div>

            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                className="relative py-8"
                initial={reduce ? false : 'dim'}
                whileInView="lit"
                viewport={{ margin: '-40% 0px -40% 0px' }}
                variants={{ dim: { opacity: 0.35 }, lit: { opacity: 1 } }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span
                  aria-hidden="true"
                  className="num absolute -left-16 top-8 grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-bg text-sm font-semibold text-subtle sm:-left-20 sm:h-14 sm:w-14 sm:text-base"
                >
                  {String(i + 1).padStart(2, '0')}
                  {/* Lit state cross-fades over the resting marker */}
                  <motion.span
                    className="absolute -inset-px grid place-items-center rounded-full border border-accent bg-bg text-accent-ink shadow-[0_0_28px_2px_rgb(var(--accent)/0.35)]"
                    variants={{ dim: { opacity: 0 }, lit: { opacity: 1 } }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                </span>
                <h3 className="display font-display text-2xl font-semibold tracking-[-0.02em] text-fg sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Outputs() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft amber wash behind the grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--accent) / 0.16), transparent)' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <FadeUp>
            <p className="label-mono">What WattWise calculates</p>
          </FadeUp>
          <SplitWords
            text="A specification a real installer can read."
            className="display mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl"
          />
          <FadeUp delay={0.2}>
            <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
              Four numbers that fully describe your system. No dashboards, no marketing metrics.
            </p>
          </FadeUp>
        </div>

        <OutputsReadout />

        {/* Phones: an open list, nothing to tap to read it */}
        <dl className="mt-14 flex flex-col gap-10 lg:hidden">
          {OUTPUTS.map(({ label, unit, Icon, body }, i) => (
            <FadeUp key={label} delay={i * 0.06}>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="flex items-center gap-3 font-display text-2xl font-semibold tracking-[-0.02em] text-fg">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" className="text-accent-ink" />
                  {label}
                </dt>
                <span className="num shrink-0 text-sm text-accent-ink">{unit}</span>
              </div>
              <dd className="mt-3 text-[15px] leading-relaxed text-muted">{body}</dd>
            </FadeUp>
          ))}
        </dl>
      </div>
    </section>
  )
}

const READOUT_MS = 4800

/**
 * Desktop: the four outputs as one big typographic readout. The list on the
 * left picks which output the right side spells out at display scale. It
 * advances on its own while in view so a passive reader still sees all four;
 * hovering or focusing the list takes over and pauses the cycle.
 */
function OutputsReadout() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const autoplay = inView && !held && !reduce

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setActive((a) => (a + 1) % OUTPUTS.length), READOUT_MS)
    return () => window.clearTimeout(t)
  }, [autoplay, active])

  const current = OUTPUTS[active]
  const [unitMain, ...unitRest] = current.unit.split(' · ')

  return (
    <div
      ref={ref}
      className="mt-20 hidden items-center gap-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
    >
      <div
        role="tablist"
        aria-label="What WattWise calculates"
        aria-orientation="vertical"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        {OUTPUTS.map(({ label }, i) => {
          const on = i === active
          return (
            <FadeUp key={label} delay={i * 0.07}>
              <button
                type="button"
                role="tab"
                id={`output-tab-${i}`}
                aria-selected={on}
                aria-controls="output-panel"
                tabIndex={on ? 0 : -1}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
                  if (!step) return
                  e.preventDefault()
                  const next = (i + step + OUTPUTS.length) % OUTPUTS.length
                  document.getElementById(`output-tab-${next}`)?.focus()
                }}
                className="group relative flex w-full items-center gap-6 py-7 text-left outline-none"
              >
                <span
                  className={`num w-6 text-xs transition-colors duration-500 ${
                    on ? 'text-accent-ink' : 'text-subtle'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`font-display text-4xl font-semibold tracking-[-0.03em] transition-[color,transform] duration-500 xl:text-5xl ${
                    on
                      ? 'translate-x-1 text-fg'
                      : 'text-subtle/70 group-hover:text-muted group-focus-visible:text-muted'
                  }`}
                >
                  {label}
                </span>
                <ArrowRight
                  size={22}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className={`ml-auto text-accent-ink transition-all duration-500 ${
                    on ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                  }`}
                />

                {/* Hairline track; the active row's fills with amber, timed to the cycle */}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line">
                  {on && (
                    <motion.span
                      key={`${active}-${autoplay}`}
                      className="absolute inset-0 origin-left bg-accent shadow-[0_0_10px_rgb(var(--accent)/0.8)]"
                      initial={{ scaleX: autoplay ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: autoplay ? READOUT_MS / 1000 : 0, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            </FadeUp>
          )
        })}
      </div>

      <div
        id="output-panel"
        role="tabpanel"
        aria-labelledby={`output-tab-${active}`}
        className="relative isolate flex min-h-[440px] flex-col justify-center"
      >
        {/* Glow + oversized line icon sit behind the readout */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--accent) / 0.2), transparent)' }}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? undefined : { opacity: 0, y: -16, filter: 'blur(10px)' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="relative"
          >
            <current.Icon
              aria-hidden="true"
              strokeWidth={0.5}
              className="absolute -right-4 -top-24 -z-10 h-72 w-72 text-accent opacity-[0.14]"
            />
            <p className="flex items-baseline gap-4">
              <span className="font-display text-[132px] font-semibold leading-[0.9] tracking-[-0.06em] text-fg xl:text-[168px]">
                {unitMain}
              </span>
              {unitRest.length > 0 && (
                <span className="num text-lg text-accent-ink">· {unitRest.join(' · ')}</span>
              )}
            </p>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function TechnicalExplanation() {
  return (
    <section className="relative border-y border-line bg-surface2/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeUp>
              <p className="label-mono">How the calculation works</p>
            </FadeUp>
            <SplitWords
              text="A transparent sizing model, no black box."
              className="display mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl"
            />
            <div className="mt-8 flex max-w-2xl flex-col gap-5 text-[15px] leading-relaxed text-muted sm:text-base">
              <FadeUp delay={0.1}>
                <p>
                  WattWise sums the peak load of every appliance you enter, applies a power-factor
                  and inverter-efficiency correction, then rounds up to give an inverter rating in
                  kVA.
                </p>
              </FadeUp>
              <FadeUp delay={0.18}>
                <p>
                  Daily energy is computed as watts × hours (either shared across all loads or
                  per-appliance). That energy determines the ampere-hours the battery bank must
                  store at your chosen system voltage, sized with a 50% depth-of-discharge margin.
                </p>
              </FadeUp>
              <FadeUp delay={0.26}>
                <p>
                  The solar array is sized to fully recharge the bank in one sun-day, and the
                  charge controller current is scaled by 1.25× the installed array current for
                  headroom.
                </p>
              </FadeUp>
            </div>
          </div>

          <div>
            <FadeUp delay={0.1}>
              <SolarFlowDiagram />
            </FadeUp>
            <FadeUp delay={0.1} className="mt-8">
              <p className="label-mono mb-4">Model constants</p>
              <dl className="grid grid-cols-2 gap-3">
                {ASSUMPTIONS.map(([label, value], i) => (
                  <div
                    key={label}
                    className={`rounded-2xl border border-line bg-surface px-4 py-4 transition-colors duration-300 hover:border-accent/60 ${
                      i === ASSUMPTIONS.length - 1 && ASSUMPTIONS.length % 2 === 1
                        ? 'col-span-2'
                        : ''
                    }`}
                  >
                    <dd className="num text-lg font-semibold text-fg">{value}</dd>
                    <dt className="mt-1 text-[13px] leading-snug text-muted">{label}</dt>
                  </div>
                ))}
              </dl>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}

function FieldNotes() {
  return (
    <section className="bg-bg py-16 sm:py-24">
      <EnergyTipsCarousel />
    </section>
  )
}

function VersionSplit() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          <FadeUp>
            <p className="label-mono">Which flow fits you</p>
          </FadeUp>
          <SplitWords
            text="Two sizing modes, same accurate model."
            className="display mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg sm:text-5xl"
          />
          <FadeUp delay={0.2}>
            <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
              The standard flow uses one runtime across your appliances and picks components from a
              catalogue of common ratings. The custom flow lets each appliance define its own
              runtime and accepts any equipment specification you own.
            </p>
          </FadeUp>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
          <FadeUp delay={0.1}>
            <ModeCard
              to="/v1/system"
              kicker="Version one"
              title="Standard sizing"
              body="Everything runs for the same backup time. Battery, panel and voltage picked from common standard sizes."
              footnote="Best for most homes"
              runtimes={[0.62, 0.62, 0.62, 0.62, 0.62, 0.62]}
            />
          </FadeUp>
          <FadeUp delay={0.2}>
            <ModeCard
              to="/v2/system"
              kicker="Version two"
              title="Custom sizing"
              body="Every appliance runs for its own number of hours. Any 12 V-multiple system voltage, any battery or panel rating."
              footnote="Best for mixed loads or off-grid"
              runtimes={[1, 0.34, 0.78, 0.2, 0.56, 0.9]}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/**
 * A sizing-mode card. The bars are a picture of the idea: one shared runtime
 * (all bars equal) versus each appliance running for its own hours.
 */
function ModeCard({
  to,
  kicker,
  title,
  body,
  footnote,
  runtimes,
}: {
  to: string
  kicker: string
  title: string
  body: string
  footnote: string
  runtimes: number[]
}) {
  const reduce = useReducedMotion()
  return (
    <Spotlight className="h-full">
      <Link to={to} className="flex h-full flex-col rounded-[inherit] p-7 outline-none focus-visible:ring-2 focus-visible:ring-accent-ink sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label-mono">{kicker}</p>
            <h3 className="display mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-fg">
              {title}
            </h3>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-fg transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>

        <div aria-hidden="true" className="mt-8 flex h-24 items-end gap-2 sm:gap-3">
          {runtimes.map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 origin-bottom rounded-t-lg rounded-b-sm bg-gradient-to-t from-accent/25 to-accent/80 transition-[filter] duration-500 group-hover:brightness-110"
              style={{ height: `${h * 100}%` }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.2 + i * 0.07 }}
            />
          ))}
        </div>

        <p className="mt-8 text-[15px] leading-relaxed text-muted">{body}</p>
        <div className="flex-1" />
        <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
          <span className="text-sm text-muted">{footnote}</span>
          <span className="text-sm font-medium text-accent-ink transition-colors group-hover:text-fg">
            Start →
          </span>
        </div>
      </Link>
    </Spotlight>
  )
}

function CtaBand() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const markY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 120, 0])
  const glow = useTransform(scrollYProgress, [0.2, 1], [0.3, 1])

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-t border-line">
      {/* Light rising from below, echoing the hero horizon */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ opacity: glow }}>
        <div
          className="absolute -bottom-[40%] left-1/2 h-[90%] w-[140%] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, rgb(var(--accent) / 0.32), rgb(var(--accent) / 0.08) 50%, transparent 75%)',
          }}
        />
        <Sparks count={16} />
      </motion.div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-24 sm:px-6 sm:pt-32 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <FadeUp>
            <p className="label-mono">Ready when you are</p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2 className="display mt-4 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] text-fg sm:text-6xl md:text-7xl">
              Stop guessing.<br />
              Size it with WattWise.
            </h2>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              One short flow — system, loads, spec. A real specification you can hand to an
              installer with confidence, in under two minutes.
            </p>
          </FadeUp>
        </div>

        <FadeUp
          delay={0.25}
          className="flex flex-col gap-5 rounded-2xl border border-line bg-bg/60 p-6 backdrop-blur-md sm:p-8"
        >
          <div>
            <p className="label-mono">Standard sizing</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Best for most homes. One backup time across every appliance, standard component
              sizes.
            </p>
          </div>
          <Magnetic className="w-full sm:w-auto">
            <Link to="/v1/system" className="btn-pill-accent group w-full">
              Start sizing
              <ArrowRight
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </Magnetic>
          <Link
            to="/v2/system"
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            Or try custom sizing — per-appliance runtime →
          </Link>
        </FadeUp>
      </div>

      {/* Oversized brand mark rising into place, x.ai-style */}
      <motion.p
        aria-hidden="true"
        style={{ y: markY }}
        className="wordmark-ghost pointer-events-none select-none whitespace-nowrap text-center font-display text-[24vw] font-semibold leading-[0.8] tracking-[-0.06em]"
      >
        WattWise
      </motion.p>
    </section>
  )
}
