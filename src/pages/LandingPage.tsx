import { Link } from 'react-router'
import { Reveal } from '../components/Reveal'
import { ASSUMPTIONS } from '../lib/model'

// Real energy imagery via Unsplash direct image URLs.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2000&q=80'
const SETUP_IMAGE =
  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1400&q=80'
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=2000&q=80'

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
    body:
      'The AC output your inverter must sustain when every appliance runs at the same moment, sized with a power-factor and efficiency headroom.',
  },
  {
    label: 'Battery bank',
    unit: 'Ah · count',
    body:
      'The total ampere-hours you need at the chosen system voltage, converted into a series-parallel arrangement of standard batteries.',
  },
  {
    label: 'Solar array',
    unit: 'W · count',
    body:
      'The panel wattage required to recharge the bank in a typical sun-day, converted into a whole number of your chosen panel size.',
  },
  {
    label: 'Charge controller',
    unit: 'A',
    body:
      'The DC current your charge controller must accept, with a 1.25× headroom over the array’s installed current.',
  },
]

export function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Outputs />
      <TechnicalExplanation />
      <VersionSplit />
      <CtaBand />
    </>
  )
}

function Hero() {
  return (
    <section className="relative isolate -mt-14 flex min-h-[100dvh] items-end overflow-hidden bg-zinc-900 pt-14 text-white">
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      {/* Warm scrim + gradient to keep text readable regardless of the underlying photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85"
      />
      <div
        aria-hidden="true"
        className="noise-overlay pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pb-28 sm:pt-40">
        <Reveal>
          <p className="label-mono text-white/70">Backup power sizing · WattWise</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display mt-5 max-w-4xl text-[34px] font-semibold leading-[1.05] tracking-tight text-white sm:mt-6 sm:text-6xl md:text-7xl">
            Size your backup power system with confidence.
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-xl">
            Tell WattWise which appliances you run and how long you need them to last during an
            outage. Get an inverter, battery bank, solar array and charge-controller spec you can
            take straight to an installer.
          </p>
        </Reveal>

        <Reveal
          delay={280}
          className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
        >
          <Link to="/v1/system" className="btn-accent px-7 text-base">
            Start sizing
          </Link>
          <a
            href="#how-it-works"
            className="text-center text-sm text-white/70 hover:text-white sm:text-left"
          >
            How it works ↓
          </a>
        </Reveal>

        <Reveal delay={380}>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 text-white/80 sm:mt-16 sm:grid-cols-4 sm:gap-x-8 sm:pt-8">
            <div>
              <dt className="label-mono text-white/50">Inverter</dt>
              <dd className="num mt-1 text-lg font-semibold text-white">
                0.66 <span className="text-xs font-normal text-white/60">kVA</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono text-white/50">Batteries</dt>
              <dd className="num mt-1 text-lg font-semibold text-white">
                4 <span className="text-xs font-normal text-white/60">× 200 Ah</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono text-white/50">Solar</dt>
              <dd className="num mt-1 text-lg font-semibold text-white">
                2 <span className="text-xs font-normal text-white/60">× 400 W</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono text-white/50">Controller</dt>
              <dd className="num mt-1 text-lg font-semibold text-white">
                41.67 <span className="text-xs font-normal text-white/60">A</span>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="label-mono">How it works</p>
            <h2 className="display mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              Three focused steps, one considered result.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              WattWise splits the calculation into a short guided flow. You can move back and
              forth between steps at any time — your inputs are preserved.
            </p>
          </Reveal>

          <ol className="flex flex-col divide-y divide-line border-t border-line">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal
                  delay={i * 120}
                  className="grid grid-cols-[3.5rem_1fr] items-baseline gap-6 py-8"
                >
                  <span className="num text-xl font-semibold tabular-nums text-accent-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="display text-2xl font-semibold text-fg sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Outputs() {
  return (
    <section className="relative border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <Reveal className="max-w-3xl">
          <p className="label-mono">What WattWise calculates</p>
          <h2 className="display mt-4 text-3xl font-semibold text-fg sm:text-4xl">
            A specification a real installer can read.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            Four numbers that fully describe your system. No dashboards, no marketing metrics.
          </p>
        </Reveal>

        <dl className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {OUTPUTS.map((out, i) => (
            <Reveal
              key={out.label}
              delay={(i % 2) * 100 + Math.floor(i / 2) * 60}
              className={i % 2 === 1 ? 'md:mt-16' : ''}
            >
              <dt className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span className="text-lg font-semibold text-fg">{out.label}</span>
                <span className="num text-sm text-muted">{out.unit}</span>
              </dt>
              <dd className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{out.body}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

function TechnicalExplanation() {
  return (
    <section className="border-b border-line bg-surface2/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Reveal>
            <p className="label-mono">How the calculation works</p>
            <h2 className="display mt-4 text-3xl font-semibold text-fg sm:text-4xl">
              A transparent sizing model, no black box.
            </h2>
            <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[15px] leading-relaxed text-muted">
              <p>
                WattWise sums the peak load of every appliance you enter, applies a power-factor
                and inverter-efficiency correction, then rounds up to give an inverter rating in
                kVA.
              </p>
              <p>
                Daily energy is computed as watts × hours (either shared across all loads or
                per-appliance). That energy determines the ampere-hours the battery bank must
                store at your chosen system voltage, sized with a 50% depth-of-discharge margin.
              </p>
              <p>
                The solar array is sized to fully recharge the bank in one sun-day, and the
                charge controller current is scaled by 1.25× the installed array current for
                headroom.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:pt-16">
            <img
              src={SETUP_IMAGE}
              alt="Battery bank and inverter installed in a residential utility room."
              className="mb-8 aspect-[4/3] w-full rounded-md object-cover"
              loading="lazy"
            />
            <p className="label-mono mb-3">Model constants</p>
            <dl className="flex flex-col rounded-md border border-line bg-surface">
              {ASSUMPTIONS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between border-b border-line px-4 py-3 text-sm last:border-b-0"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="num font-medium text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function VersionSplit() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <p className="label-mono">Which flow fits you</p>
          <h2 className="display mt-4 text-3xl font-semibold text-fg sm:text-4xl">
            Two sizing modes, same accurate model.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            The standard flow uses one runtime across your appliances and picks components from a
            catalogue of common ratings. The custom flow lets each appliance define its own
            runtime and accepts any equipment specification you own.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal delay={120}>
            <Link
              to="/v1/system"
              className="group flex h-full flex-col justify-between rounded-lg border border-line bg-surface p-8 transition-colors hover:border-fg/30 sm:p-10"
            >
              <div>
                <p className="label-mono">Version one</p>
                <h3 className="display mt-3 text-2xl font-semibold text-fg">Standard sizing</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Everything runs for the same backup time. Battery, panel and voltage picked
                  from common standard sizes.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Best for most homes</span>
                <span className="text-sm font-medium text-accent-ink group-hover:text-fg">
                  Start →
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={220}>
            <Link
              to="/v2/system"
              className="group flex h-full flex-col justify-between rounded-lg border border-line bg-surface p-8 transition-colors hover:border-fg/30 sm:p-10"
            >
              <div>
                <p className="label-mono">Version two</p>
                <h3 className="display mt-3 text-2xl font-semibold text-fg">Custom sizing</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Every appliance runs for its own number of hours. Any 12 V-multiple system
                  voltage, any battery or panel rating.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Best for mixed loads or off-grid</span>
                <span className="text-sm font-medium text-accent-ink group-hover:text-fg">
                  Start →
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      <img
        src={CTA_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40"
      />
      <div
        aria-hidden="true"
        className="noise-overlay pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <Reveal>
          <p className="label-mono text-white/60">Ready when you are</p>
          <h2 className="display mt-4 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Stop guessing.<br />
            Size it with WattWise.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
            One short flow — system, loads, spec. A real specification you can hand to an
            installer with confidence, in under two minutes.
          </p>
        </Reveal>

        <Reveal
          delay={140}
          className="flex flex-col gap-4 border-t border-white/20 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
        >
          <div>
            <p className="label-mono text-white/50">Standard sizing</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Best for most homes. One backup time across every appliance, standard component
              sizes.
            </p>
          </div>
          <Link to="/v1/system" className="btn-accent w-full justify-center px-7 text-base sm:w-auto">
            Start sizing
          </Link>
          <Link
            to="/v2/system"
            className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Or try custom sizing — per-appliance runtime →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
