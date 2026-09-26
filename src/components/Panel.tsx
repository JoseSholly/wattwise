import type { ReactNode } from 'react'
import { useId } from 'react'

type Props = {
  /** Section number, e.g. "01". */
  index?: string
  title: string
  aside?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/** Bordered section with a numbered mono header, used for form blocks and the results sheet. */
export function Panel({ index, title, aside, footer, children }: Props) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="panel min-w-0 overflow-hidden">
      <div className="flex h-11 items-center justify-between gap-3 border-b border-line bg-surface2/60 px-4 sm:px-5">
        <h2 id={headingId} className="label-mono flex gap-2.5">
          {index && <span className="text-accent-ink">{index}</span>}
          <span>{title}</span>
        </h2>
        {aside}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {footer && (
        <div className="border-t border-line bg-surface2/60 px-4 py-3 sm:px-5">{footer}</div>
      )}
    </section>
  )
}
