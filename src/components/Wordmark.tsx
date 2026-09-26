type Props = {
  className?: string
  /** Renders as light foreground for use over dark hero backgrounds. */
  onDark?: boolean
}

export function Wordmark({ className = 'text-[17px]', onDark = false }: Props) {
  return (
    <span
      aria-label="WattWise"
      className={`display font-semibold tracking-tight ${onDark ? 'text-white' : 'text-fg'} ${className}`}
    >
      Watt<span className={onDark ? 'text-accent' : 'text-accent-ink'}>Wise</span>
    </span>
  )
}
