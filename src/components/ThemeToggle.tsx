import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemePreference } from '../lib/theme'

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'system', label: 'System theme', Icon: Monitor },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
]

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="inline-flex items-center rounded-md border border-line bg-surface2 p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            title={label}
            onClick={() => setPreference(value)}
            className={`grid h-7 w-7 place-items-center rounded transition-colors ${
              active ? 'bg-surface text-fg shadow-sm ring-1 ring-line' : 'text-subtle hover:text-fg'
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
