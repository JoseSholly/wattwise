import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

type Props = {
  title: string
  description: ReactNode
  form: ReactNode
  results: ReactNode
  /** Changes when a new result arrives; used to bring results into view on small screens. */
  resultKey?: unknown
}

export function CalculatorLayout({ title, description, form, results, resultKey }: Props) {
  const resultsRef = useRef<HTMLElement>(null)

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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <section aria-labelledby="calc-heading" className="min-w-0">
        <h1 id="calc-heading" className="text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 max-w-prose text-sm text-neutral-600">{description}</p>
        <div className="mt-6">{form}</div>
      </section>

      <section
        ref={resultsRef}
        aria-labelledby="results-heading"
        className="min-w-0 scroll-mt-4 lg:sticky lg:top-6 lg:self-start"
      >
        <h2 id="results-heading" className="eyebrow mb-3">
          Results
        </h2>
        {results}
      </section>
    </div>
  )
}
