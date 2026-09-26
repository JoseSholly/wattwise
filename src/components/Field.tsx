import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Common = {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  /** Hide the label visually from `sm` up, where a table header labels the column. */
  compactLabel?: boolean
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
}

function Label({ id, label, compactLabel }: Pick<Common, 'id' | 'label' | 'compactLabel'>) {
  return (
    <label
      htmlFor={id}
      className={`text-sm text-neutral-600 ${compactLabel ? 'sm:sr-only' : ''}`}
    >
      {label}
    </label>
  )
}

function Messages({ id, error, hint }: Pick<Common, 'id' | 'error' | 'hint'>) {
  return (
    <>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </>
  )
}

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & Common
>(function Field({ id, label, error, hint, compactLabel, className = '', ...inputProps }, ref) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label id={id} label={label} compactLabel={compactLabel} />
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`control ${className}`}
        {...inputProps}
      />
      <Messages id={id} error={error} hint={hint} />
    </div>
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & Common
>(function Select(
  { id, label, error, hint, compactLabel, className = '', children, ...selectProps },
  ref,
) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label id={id} label={label} compactLabel={compactLabel} />
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
      <Messages id={id} error={error} hint={hint} />
    </div>
  )
})
