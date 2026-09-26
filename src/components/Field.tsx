import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Common = {
  id: string
  label: string
  error?: string
  /** Short note shown on the label line (e.g. "×12"), so every input keeps the same baseline. */
  hint?: ReactNode
  /** Hide the label visually from `sm` up, where a table header labels the column. */
  compactLabel?: boolean
  /** Label for screen readers only, at every width. */
  hideLabel?: boolean
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
}

function Label({
  id,
  label,
  hint,
  compactLabel,
  hideLabel,
}: Pick<Common, 'id' | 'label' | 'hint' | 'compactLabel' | 'hideLabel'>) {
  return (
    <div className={`flex h-5 items-baseline justify-between gap-2 ${
        hideLabel ? 'sr-only' : compactLabel ? 'sm:sr-only' : ''
      }`}>
      <label htmlFor={id} className="truncate text-[13px] font-medium text-muted">
        {label}
      </label>
      {hint && (
        <span id={`${id}-hint`} className="shrink-0 font-mono text-[11px] text-subtle">
          {hint}
        </span>
      )}
    </div>
  )
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={`${id}-error`} className="text-xs leading-snug text-danger">
      {error}
    </p>
  )
}

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & Common & { unit?: string }
>(function Field({ id, label, error, hint, compactLabel, unit, className = '', ...inputProps }, ref) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label id={id} label={label} hint={hint} compactLabel={compactLabel} />
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`control ${unit ? 'pr-7' : ''} ${className}`}
          {...inputProps}
        />
        {unit && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2 flex items-center font-mono text-xs text-subtle"
          >
            {unit}
          </span>
        )}
      </div>
      <ErrorText id={id} error={error} />
    </div>
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & Common
>(function Select(
  { id, label, error, hint, compactLabel, hideLabel, className = '', children, ...selectProps },
  ref,
) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label id={id} label={label} hint={hint} compactLabel={compactLabel} hideLabel={hideLabel} />
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`control ${className}`}
        {...selectProps}
      >
        {children}
      </select>
      <ErrorText id={id} error={error} />
    </div>
  )
})
