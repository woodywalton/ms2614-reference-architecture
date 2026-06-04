import React, { useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../ThemeContext.jsx'
import logoColor from '../img/logo-elastic-horizontal-color.svg'
import logoReverse from '../img/logo-elastic-horizontal-color-reverse.svg'

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    <path fillRule="evenodd" d="M13 9.414V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V9.414l1-1V13h2v-3a1 1 0 0 1 1-1h2l.103.005A1 1 0 0 1 10 10v3h2V8.414l1 1ZM7 13h2v-3H7v3Z" clipRule="evenodd"/>
    <path d="M8.048 2.002a1.002 1.002 0 0 1 .659.291l6 6L14 9 8 3 2 9l-.707-.707 6-6 .076-.068a.994.994 0 0 1 .679-.223ZM13 5.172l-1-1V2h1v3.172Z"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    <path d="M4.05 12.95A6.982 6.982 0 0 1 2 8c0-1.79.684-3.583 2.05-4.95A6.982 6.982 0 0 1 9 1a1 1 0 0 1 .708 1.707 4.982 4.982 0 0 0-1.465 3.536 4.98 4.98 0 0 0 1.465 3.535 4.98 4.98 0 0 0 3.535 1.465 1 1 0 0 1 .707 1.707A6.981 6.981 0 0 1 9 15a6.983 6.983 0 0 1-4.95-2.05Zm.708-.707A5.983 5.983 0 0 0 9 14c1.535 0 3.07-.586 4.242-1.757a5.98 5.98 0 0 1-4.018-1.545L9 10.485a5.982 5.982 0 0 1-1.758-4.242A5.986 5.986 0 0 1 9 2a5.983 5.983 0 0 0-4.243 1.757A5.98 5.98 0 0 0 3 8l.006.288a5.978 5.978 0 0 0 1.75 3.955Z"/>
  </svg>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    <path d="M8.5 15h-1v-2h1v2Zm-3.674-3.107-1.414 1.414-.707-.707 1.414-1.415.707.708Zm8.479.707-.707.707-1.414-1.414.707-.708 1.414 1.415Z"/>
    <path fillRule="evenodd" d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clipRule="evenodd"/>
    <path d="M3.005 8.505h-2v-1h2v1Zm12 0h-2v-1h2v1ZM4.82 4.114l-.708.707-1.414-1.414.707-.707L4.82 4.114Zm8.492-.707-1.414 1.414-.708-.707L12.605 2.7l.707.707ZM8.5 3h-1V1h1v2Z"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Maturity Levels',    to: '/maturity/small/1', matchPrefix: '/maturity' },
  { label: 'Asset Inventory',    to: '/asset-inventory',  matchPrefix: '/asset-inventory' },
  { label: 'Deployment Options', to: '/deployment-options', matchPrefix: '/deployment-options' },
]

export default function Nav() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const headerRef = useRef(null)

  // Set --nav-height CSS variable so flyouts/overlays can align perfectly
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => document.documentElement.style.setProperty('--nav-height', `${el.getBoundingClientRect().height}px`)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isHome = location.pathname === '/'

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-line bg-ink-900/95 backdrop-blur">
      <div className="mx-auto max-w-[1800px] px-6 py-4 flex items-center gap-6">
        {/* Logo + title */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={theme === 'dark' ? logoReverse : logoColor}
            alt="Elastic"
            className="h-8 w-auto"
          />
          <div className="h-7 w-px bg-line" />
          <h1 className="text-xl font-bold text-text-primary leading-tight">
            Elastic M-26-14 Reference Architecture
          </h1>
        </div>

        {/* Nav + theme toggle */}
        <div className="ml-auto flex items-center gap-1">
          {/* Home / Overview */}
          <Link
            to="/"
            className={
              `flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ` +
              (isHome
                ? 'bg-accent-teal/15 text-accent-teal'
                : 'text-text-muted hover:text-text-primary hover:bg-ink-700')
            }
          >
            <HomeIcon />
            <span>M-26-14 Overview</span>
          </Link>

          {NAV_ITEMS.map((item) => (
            <React.Fragment key={item.to}>
              <span className="px-1 text-text-muted/40 text-xs select-none">|</span>
              <Link
                to={item.to}
                className={
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ` +
                  (location.pathname.startsWith(item.matchPrefix)
                    ? 'bg-accent-teal/15 text-accent-teal'
                    : 'text-text-muted hover:text-text-primary hover:bg-ink-700')
                }
              >
                {item.label}
              </Link>
            </React.Fragment>
          ))}

          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded hover:bg-ink-700 text-text-muted hover:text-text-primary transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
