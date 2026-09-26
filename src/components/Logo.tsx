export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <path d="M18 5 8.5 18H15l-1 9 9.5-13H17l1-9z" className="fill-accent-fg" />
    </svg>
  )
}
