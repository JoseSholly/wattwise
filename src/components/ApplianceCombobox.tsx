import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useAppliances } from '../api/appliances'

type Props = {
  id: string
  /** Currently selected appliance id, or undefined when none is chosen. */
  value: number | undefined
  onChange: (next: number | undefined) => void
  onBlur?: () => void
  error?: string
  label: string
  hideLabel?: boolean
}

/**
 * Type-to-search combobox for the appliance list. Uses the app's `useAppliances`
 * query so we don't refetch. Not a full ARIA combobox (no aria-activedescendant),
 * but supports keyboard nav, click-outside close, and click / touch selection.
 */
export function ApplianceCombobox({
  id,
  value,
  onChange,
  onBlur,
  error,
  label,
  hideLabel,
}: Props) {
  const appliances = useAppliances()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = useMemo(
    () => (value !== undefined ? appliances.data?.find((a) => a.id === value) : undefined),
    [value, appliances.data],
  )

  const filtered = useMemo(() => {
    const list = appliances.data ?? []
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter((a) => a.name.toLowerCase().includes(q))
  }, [appliances.data, query])

  // Input shows the query while the menu is open, otherwise the selected name.
  const inputValue = open ? query : (selected?.name ?? '')

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  // Scroll active item into view when it changes.
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function selectAppliance(applianceId: number) {
    onChange(applianceId)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (!open) return
      e.preventDefault()
      const pick = filtered[activeIndex]
      if (pick) selectAppliance(pick.id)
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setQuery('')
      }
    } else if (e.key === 'Tab') {
      setOpen(false)
      setQuery('')
    }
  }

  const placeholder = appliances.isPending
    ? 'Loading appliances…'
    : appliances.isError
      ? 'Appliances unavailable'
      : 'Search appliances…'

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`text-[13px] font-medium text-muted ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
      </label>

      <div ref={containerRef} className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          disabled={appliances.isPending || appliances.isError}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => onBlur?.()}
          onKeyDown={handleKeyDown}
          className="control pr-9"
        />
        {/* Dropdown chevron */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-subtle"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>

        {open && appliances.data && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-auto rounded-md border border-line-strong bg-surface shadow-lg"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-subtle">No appliances match “{query}”</li>
            )}
            {filtered.map((appliance, i) => {
              const isActive = i === activeIndex
              const isSelected = appliance.id === value
              return (
                <li
                  key={appliance.id}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    // Prevent input blur before we handle the click.
                    e.preventDefault()
                    selectAppliance(appliance.id)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    isActive ? 'bg-accent/15 text-fg' : 'text-fg'
                  } ${isSelected ? 'font-semibold text-accent-ink' : ''}`}
                >
                  {appliance.name}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs leading-snug text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
