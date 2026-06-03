import React from 'react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',         label: 'Overview' },
  { to: '/level/1',  label: 'Level 1' },
  { to: '/level/2',  label: 'Level 2' },
  { to: '/level/3',  label: 'Level 3' },
  { to: '/level/4',  label: 'Level 4' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink-900/95 backdrop-blur">
      <div className="mx-auto max-w-[1500px] px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/brand/elastic-logo-white.svg"
            alt="Elastic"
            className="h-7 w-auto opacity-90"
          />
          <div className="h-7 w-px bg-line" />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-text-primary">
              M-26-14 Federal Logging Reference Architecture
            </h1>
            <p className="text-[11px] text-text-muted">
              Logging Maturity Model viewer · Elastic Stack reference designs
            </p>
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-1" role="tablist">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-text-muted hover:text-text-primary hover:bg-ink-700')
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
