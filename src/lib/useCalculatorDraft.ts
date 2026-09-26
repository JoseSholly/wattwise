import { useEffect } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

type Version = 'v1' | 'v2'

const key = (version: Version) => `wattwise-draft-${version}`

/** Reads a saved draft synchronously so it can seed `useForm` defaults. */
export function readDraft<T>(version: Version): T | null {
  try {
    const raw = window.sessionStorage.getItem(key(version))
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Wipes the draft, e.g. after "Start over". */
export function clearDraft(version: Version) {
  try {
    window.sessionStorage.removeItem(key(version))
  } catch {
    // Storage disabled; nothing to clear.
  }
}

/** Subscribes to the form and mirrors values into sessionStorage on every change. */
export function useCalculatorDraft<T extends FieldValues>(
  version: Version,
  form: UseFormReturn<T>,
) {
  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        window.sessionStorage.setItem(key(version), JSON.stringify(values))
      } catch {
        // Ignore quota / private-mode errors — draft persistence is best-effort.
      }
    })
    return () => sub.unsubscribe()
  }, [form, version])
}
