import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

// Keep in sync with the inline script in index.html.
const STORAGE_KEY = 'wattwise-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // Storage blocked (private mode etc.): fall back to the system setting.
  }
  return 'system'
}

function apply(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && media().matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)

  useEffect(() => {
    apply(preference)
    if (preference !== 'system') return
    const mq = media()
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not persisted; still applies for this visit.
    }
    setPreferenceState(next)
  }, [])

  return { preference, setPreference }
}
