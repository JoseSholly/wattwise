import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { API_DOCS_URL, API_REPO_URL, REPO_URL } from '../lib/links'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'

const nav = [
  { to: '/', label: 'Overview', end: true, short: 'Home' },
  { to: '/v1', label: 'Standard sizing', short: 'v1' },
  { to: '/v2', label: 'Custom sizing', short: 'v2' },
]

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isLanding = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header
        className={`sticky top-0 z-30 border-b ${
          isLanding
            ? 'border-white/10 bg-transparent backdrop-blur-0 supports-[backdrop-filter]:bg-black/10 supports-[backdrop-filter]:backdrop-blur-md'
            : 'border-line bg-bg/80 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ink"
            aria-label="WattWise home"
          >
            <Wordmark onDark={isLanding} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const base = 'rounded-md px-3 py-1.5 text-sm transition-colors'
                  if (isLanding) {
                    return `${base} ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
                  }
                  return `${base} ${isActive ? 'text-fg' : 'text-muted hover:text-fg'}`
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className={`hidden text-sm transition-colors sm:inline ${
                isLanding ? 'text-white/70 hover:text-white' : 'text-muted hover:text-fg'
              }`}
            >
              API docs
            </a>
            <ThemeToggle />
          </div>
        </div>

      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <Wordmark />
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A backup-power sizing tool for homes on unreliable grids. Estimates only —
                confirm sizing with a qualified installer before purchasing.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <a
                href={API_DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-fg"
              >
                API documentation
              </a>
              <a
                href={API_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-fg"
              >
                API source
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-fg"
              >
                App source
              </a>
            </div>
          </div>
          <p className="mt-8 border-t border-line pt-6 text-xs text-subtle">
            © {new Date().getFullYear()} WattWise. Independent open-source project.
          </p>
        </div>
      </footer>
    </div>
  )
}
