import type { ReactNode } from 'react'
import { useId } from 'react'

type Props = {
  /** Optional section number for standalone panels. Omitted inside the wizard, which has its own stepper. */
  index?: string
  title: string
  /** Shown above the panel in muted type. */
  eyebrow?: string
  aside?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /** Removes the header row entirely. */
  bare?: boolean
}

/** Bordered section used for the spec sheet and freestanding form blocks. */
export function Panel({ index, title, eyebrow, aside, footer, children, bare = false }: Props) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="panel min-w-0 overflow-hidden">
      {!bare && (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface2/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {eyebrow && <div className="label-mono">{eyebrow}</div>}
            <h2
              id={headingId}
              className={`text-[15px] font-semibold tracking-tight text-fg ${eyebrow ? 'mt-1' : ''}`}
            >
              {index && <span className="mr-2 font-mono text-xs text-accent-ink">{index}</span>}
              {title}
            </h2>
          </div>
          {aside}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
      {footer && (
        <div className="border-t border-line bg-surface2/60 px-4 py-3 sm:px-5">{footer}</div>
      )}
    </section>
  )
}
