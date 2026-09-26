import { NavLink, Outlet } from 'react-router'

const tabs = [
  { to: '/v1', label: 'v1', detail: 'One backup time', short: 'Single' },
  { to: '/v2', label: 'v2', detail: 'Per-appliance backup time', short: 'Per appliance' },
]

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <p className="text-base font-semibold tracking-tight sm:pb-3">Watt Wise</p>
          <nav aria-label="Calculator version" className="-mb-px flex gap-6">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `border-b-2 pb-3 text-sm ${
                    isActive
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`
                }
              >
                <span className="font-medium">{tab.label}</span>
                <span className="text-neutral-500">
                  {' · '}
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.detail}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
