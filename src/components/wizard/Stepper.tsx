import { Link, useLocation } from 'react-router'
import { WIZARD_STEPS, type WizardStepSlug } from '../../lib/stepFields'

type Props = {
  version: 'v1' | 'v2'
  /** Which steps have been successfully completed and can be navigated back to. */
  completed: Set<WizardStepSlug>
}

function stepState(
  current: WizardStepSlug,
  target: WizardStepSlug,
  completed: Set<WizardStepSlug>,
) {
  if (target === current) return 'current' as const
  if (completed.has(target)) return 'done' as const
  return 'upcoming' as const
}

export function Stepper({ version, completed }: Props) {
  const { pathname } = useLocation()
  const currentSlug = (WIZARD_STEPS.find((s) => pathname.endsWith(`/${s.slug}`))?.slug ??
    'system') as WizardStepSlug
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.slug === currentSlug)
  const currentLabel = WIZARD_STEPS[currentIndex]?.label ?? 'System'

  return (
    <nav aria-label="Wizard progress" className="border-b border-line">
      {/* Mobile: compact progress bar + current-step label. */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:hidden">
        <span className="num shrink-0 text-[11px] font-medium uppercase tracking-wider text-subtle">
          Step {currentIndex + 1}/3
        </span>
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-surface2"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-accent-ink transition-all"
            style={{ width: `${((currentIndex + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-fg">{currentLabel}</span>
      </div>

      {/* Desktop: full clickable stepper. */}
      <ol className="mx-auto hidden max-w-6xl items-center gap-6 px-6 py-4 sm:flex">
        {WIZARD_STEPS.map((step, i) => {
          const state = stepState(currentSlug, step.slug, completed)
          const canJump = state === 'done'
          const num = String(i + 1).padStart(2, '0')
          const inner = (
            <span className="flex items-baseline gap-2.5">
              <span
                className={`num text-[11px] tabular-nums ${
                  state === 'current'
                    ? 'text-accent-ink'
                    : state === 'done'
                      ? 'text-muted'
                      : 'text-subtle'
                }`}
              >
                {num}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-medium ${
                  state === 'current'
                    ? 'text-fg'
                    : state === 'done'
                      ? 'text-muted'
                      : 'text-subtle'
                }`}
              >
                {step.label}
              </span>
            </span>
          )

          return (
            <li key={step.slug} className="flex items-center gap-6">
              {canJump ? (
                <Link
                  to={`/${version}/${step.slug}`}
                  className="rounded outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ink"
                >
                  {inner}
                </Link>
              ) : (
                <span
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={state === 'current' ? '' : 'cursor-default'}
                >
                  {inner}
                </span>
              )}
              {i < WIZARD_STEPS.length - 1 && (
                <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
