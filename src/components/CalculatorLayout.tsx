import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Panel } from './Panel'

type Props = {
  version: 'v1' | 'v2'
  title: string
  description: ReactNode
  /** The System and Loads panels. */
  children: ReactNode
  onSubmit: () => void
  isSubmitting: boolean
  results: ReactNode
  /** Short context shown in the results header, e.g. "24 V system". */
  resultsMeta?: ReactNode
  /** Changes when a new result arrives; used to bring results into view on small screens. */
  resultKey?: unknown
}

const other = {
  v1: { to: '/v2', label: 'Need different hours per appliance? Use v2' },
  v2: { to: '/v1', label: 'Same hours for everything? Use v1' },
}

export function CalculatorLayout({
  version,
  title,
  description,
  children,
  onSubmit,
  isSubmitting,
  results,
  resultsMeta,
  resultKey,
}: Props) {
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!resultKey) return
    // Results sit below the form until the lg breakpoint.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [resultKey])

  useEffect(() => {
    document.title = `${title} · Watt Wise`
  }, [title])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="label-mono">
            Calculator <span className="text-line-strong">/</span>{' '}
            <span className="text-accent-ink">{version}</span>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">{description}</p>
        </div>
        <Link
          to={other[version].to}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
        >
          {other[version].label}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          noValidate
          className="flex min-w-0 flex-col gap-5"
        >
          {children}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary h-11 w-full px-6 sm:w-auto"
            >
              {isSubmitting ? 'Calculating…' : 'Calculate system'}
            </button>
            <p className="text-xs text-subtle">
              The first request can take up to a minute while the API wakes up.
            </p>
          </div>
        </form>

        <div ref={resultsRef} className="min-w-0 scroll-mt-32 lg:sticky lg:top-20 lg:self-start">
          <Panel index="03" title="Spec sheet" aside={resultsMeta}>
            {results}
          </Panel>
        </div>
      </div>
    </div>
  )
}
