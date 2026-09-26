import { ArrowRight, Check } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { SpecSheet, type SpecInput } from '../components/SpecSheet'
import { API_DOCS_URL } from '../lib/links'
import { ASSUMPTIONS } from '../lib/model'

/** Scenario 1 from the API README: 525 W home, 6 h backup, 24 V, 200 Ah, 400 W panels. */
const SAMPLE: SpecInput = {
  system_voltage: 24,
  battery_capacity: 200,
  solar_panel_watt: 400,
  output: {
    total_load: 525,
    inverter_rating: 0.66,
    total_battery_capacity: 328.12,
    numbers_of_batteries: 4,
    total_solar_panel_capacity_needed: 656.25,
    numbers_of_solar_panel: 2,
    total_current: 33.33,
    controller_current: 41.67,
  },
}

const STEPS: { title: string; body: string; formulas: string[] }[] = [
  {
    title: 'List your loads',
    body: 'Pick each appliance from the catalogue with its quantity and wattage.',
    formulas: ['P = Σ watts × qty'],
  },
  {
    title: 'Daily energy',
    body: 'v1 runs everything for one backup time. v2 uses hours per appliance.',
    formulas: ['v1  E = P × t', 'v2  E = Σ Pᵢ × tᵢ'],
  },
  {
    title: 'Size components',
    body: 'Inverter for the peak load, battery bank and array for the energy.',
    formulas: ['kVA = P ÷ 800', 'Ah = E ÷ (V × 0.4)', 'Wp = E ÷ 4.8'],
  },
  {
    title: 'Count and rate',
    body: 'Whole batteries and panels, and a controller with headroom.',
    formulas: ['n = ⌈V ÷ 12⌉ × ⌈Ah ÷ C⌉', 'N = ⌈Wp ÷ W⌉', 'I = N × W × 1.25 ÷ V'],
  },
]

const COMPARE: { label: string; v1: string; v2: string }[] = [
  { label: 'Backup time', v1: 'One value, 1–24 h', v2: 'Per appliance, up to 24 h' },
  { label: 'System voltage', v1: '12, 24 or 48 V', v2: 'Any multiple of 12, to 240 V' },
  { label: 'Battery (12 V unit)', v1: '150, 200, 220, 250 Ah', v2: '1–5,000 Ah' },
  { label: 'Solar panel', v1: '300, 350, 400, 450 W', v2: '1–1,000 W' },
  { label: 'Appliance watts', v1: 'Whole watts', v2: 'Decimals allowed' },
]

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="label-mono text-accent-ink">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {children && <p className="mt-3 text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  )
}

export function LandingPage() {
  useEffect(() => {
    document.title = 'Watt Wise · Solar backup sizing'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_28rem] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Inverter · battery · solar · controller
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Size a solar backup system from the appliances you run.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              List what you want to keep on during an outage. Watt Wise returns the inverter
              rating, how many batteries and panels you need, and the charge controller current,
              with every step of the maths shown.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/v1" className="btn-primary h-11 px-5">
                Open v1 calculator
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/v2" className="btn-secondary h-11 px-5">
                v2: hours per appliance
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {['No sign-up', 'Nothing is stored', '50 common appliances'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-accent-ink" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <figure className="panel overflow-hidden shadow-[0_1px_0_rgb(var(--line)),0_24px_48px_-24px_rgb(0_0_0/0.25)]">
            <div className="flex h-11 items-center justify-between border-b border-line bg-surface2/60 px-4">
              <span className="label-mono">Sample spec sheet</span>
              <span className="font-mono text-[11px] text-subtle">24 V · 6 h</span>
            </div>
            <div className="p-4">
              <SpecSheet spec={SAMPLE} />
            </div>
            <figcaption className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted">
              4 LED bulbs, 2 fans, a TV, a fridge and a laptop (525 W) on 200 Ah batteries and
              400 W panels. The worked example from the API documentation.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="How it works" title="From appliance list to spec sheet">
            Both versions share one sizing model. They differ only in how daily energy is added up.
          </SectionHeading>

          <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col bg-surface p-5">
                <span className="font-mono text-xs text-accent-ink">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-col gap-1 rounded-md border border-line bg-surface2/60 px-3 py-2.5 font-mono text-xs">
                    {step.formulas.map((f) => (
                      <code key={f} className="whitespace-pre">
                        {f}
                      </code>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-mono text-xs text-subtle">
            P load (W) · E energy (Wh) · t hours · V system voltage · C battery Ah · W panel watts
          </p>
        </div>
      </section>

      {/* v1 vs v2 */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="Two calculators" title="Pick the model that fits">
            If every appliance gets the same hours, v1 and v2 return identical results.
          </SectionHeading>

          <div className="grid gap-4 md:grid-cols-2">
            {(['v1', 'v2'] as const).map((version) => (
              <div key={version} className="panel flex flex-col overflow-hidden">
                <div className="border-b border-line p-5">
                  <p className="font-mono text-xs text-accent-ink">{version}</p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {version === 'v1' ? 'Single backup time' : 'Per-appliance backup time'}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {version === 'v1'
                      ? 'Quick estimate with standard component sizes.'
                      : 'Fridge overnight, TV for the evening. Any component size.'}
                  </p>
                </div>
                <dl className="flex-1 px-5 py-2">
                  {COMPARE.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-b-0"
                    >
                      <dt className="text-muted">{row.label}</dt>
                      <dd className="num text-right text-[13px]">{row[version]}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t border-line bg-surface2/60 p-4">
                  <Link
                    to={`/${version}`}
                    className={`${version === 'v1' ? 'btn-primary' : 'btn-secondary'} w-full`}
                  >
                    Open {version} calculator
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assumptions */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="Model constants" title="The assumptions behind every number">
            Conservative values for lead-acid and tubular batteries. Results are rounded to two
            decimals; battery and panel counts always round up.
          </SectionHeading>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
            {ASSUMPTIONS.map(([label, value]) => (
              <div key={label} className="bg-surface p-4">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="num mt-1.5 text-lg font-semibold">{value}</dd>
              </div>
            ))}
            <div className="bg-surface p-4">
              <dt className="text-xs text-muted">Recharge</dt>
              <dd className="num mt-1.5 text-lg font-semibold">Once a day</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Closing CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="panel flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Have your appliance list ready?</h2>
              <p className="mt-1 text-sm text-muted">
                It takes a minute. The API is also open if you'd rather call it directly:{' '}
                <a
                  href={API_DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
                >
                  API docs
                </a>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/v1" className="btn-primary h-11 px-5">
                Start with v1
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/v2" className="btn-secondary h-11 px-5">
                Use v2
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
