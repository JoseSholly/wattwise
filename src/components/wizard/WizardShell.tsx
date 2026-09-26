import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { WizardStepSlug } from '../../lib/stepFields'

type ActionButton = {
  onClick?: () => void
  to?: string
  /** Full label, shown on ≥sm. */
  label: string
  /** Compact label for phones. Falls back to `label` if unset. */
  labelShort?: string
  disabled?: boolean
  loading?: boolean
  /** Show as amber CTA instead of dark primary. Only used for `primary`. */
  accent?: boolean
}

type Props = {
  version: 'v1' | 'v2'
  currentStep: WizardStepSlug
  title: string
  description: ReactNode
  children: ReactNode
  back: ActionButton | null
  primary: ActionButton | null
}

const stepNumber: Record<WizardStepSlug, string> = {
  system: '1',
  loads: '2',
  spec: '3',
}

function ButtonLabel({ full, short }: { full: string; short?: string }) {
  if (!short || short === full) return <span>{full}</span>
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  )
}

/** Per-step layout: page header, content area, sticky Back / Continue footer. */
export function WizardShell({
  version,
  currentStep,
  title,
  description,
  children,
  back,
  primary,
}: Props) {
  const primaryClass = primary?.accent ? 'btn-accent' : 'btn-primary'

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-14 sm:pb-32">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="label-mono">
            {version === 'v1' ? 'Standard sizing' : 'Custom sizing'}
            <span className="mx-2 text-line-strong">/</span>
            Step {stepNumber[currentStep]} of 3
          </p>
          <h1 className="display mt-3 text-[26px] font-semibold text-fg sm:text-4xl">{title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
        </header>

        {children}
      </div>

      <div className="sticky bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            {back &&
              (back.to ? (
                <Link
                  to={back.to}
                  className="btn-ghost !px-2 sm:!px-4"
                  aria-disabled={back.disabled || undefined}
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <ButtonLabel full={back.label} short={back.labelShort} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={back.onClick}
                  disabled={back.disabled}
                  className="btn-ghost !px-2 sm:!px-4"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <ButtonLabel full={back.label} short={back.labelShort} />
                </button>
              ))}
          </div>

          <div className="min-w-0 shrink-0">
            {primary &&
              (primary.to ? (
                <Link
                  to={primary.to}
                  className={`${primaryClass} !px-4 sm:!px-5`}
                  aria-disabled={primary.disabled || undefined}
                >
                  <ButtonLabel full={primary.label} short={primary.labelShort} />
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primary.onClick}
                  disabled={primary.disabled || primary.loading}
                  className={`${primaryClass} !px-4 sm:!px-5`}
                >
                  {primary.loading ? (
                    'Calculating…'
                  ) : (
                    <>
                      <ButtonLabel full={primary.label} short={primary.labelShort} />
                      <ArrowRight size={15} aria-hidden="true" />
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
