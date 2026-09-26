import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  hint?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, hint, className = '', ...inputProps },
  ref,
) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`w-full rounded-md border px-3 py-2 text-base text-slate-900 outline-none transition
          placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0
          ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200'
          } ${className}`}
        {...inputProps}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})
