import { ArrowUpRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { API_DOCS_URL, API_REPO_URL, REPO_URL } from '../lib/links'
import { LogoMark } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  { to: '/', label: 'Overview', end: true },
  { to: '/v1', label: 'v1 Calculator', short: 'v1' },
  { to: '/v2', label: 'v2 Calculator', short: 'v2' },
]

export function Layout() {
  const { pathname } = useLocation()

  // New page, start at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Watt Wise home">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight">Watt Wise</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive ? 'bg-surface2 text-fg' : 'text-muted hover:text-fg'
                  }`
                }
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
              className="hidden items-center gap-1 text-sm text-muted hover:text-fg sm:inline-flex"
            >
              API docs
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Phones: a full-width segmented switch instead of wrapping links. */}
        <nav aria-label="Main" className="border-t border-line px-4 py-2 md:hidden">
          <div className="grid grid-cols-3 rounded-md border border-line bg-surface2 p-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded px-2 py-1.5 text-center text-[13px] font-medium transition-colors ${
                    isActive ? 'bg-surface text-fg shadow-sm ring-1 ring-line' : 'text-muted'
                  }`
                }
              >
                {item.short ?? item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Estimates only. Confirm sizing with a qualified installer.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="hover:text-fg">
              API docs
            </a>
            <a href={API_REPO_URL} target="_blank" rel="noreferrer" className="hover:text-fg">
              API source
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-fg">
              App source
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
