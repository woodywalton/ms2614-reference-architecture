// Right-side detail drawer. Driven by the global selected component state.

import React, { useEffect } from 'react'
import { COMPONENTS } from '../data/components.js'

const ACCENT = {
  teal: '#00BFB3',
  blue: '#0077CC',
  gray: '#6E7681',
  purple: '#7B5EA7',
  green: '#2EA043',
  coral: '#CF4F27',
  yellow: '#D29922',
}

export default function Drawer({ componentId, onClose }) {
  const open = Boolean(componentId)
  const data = componentId ? COMPONENTS[componentId] : null

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* panel */}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-md bg-ink-800 border-l border-line shadow-2xl
                    transform transition-transform duration-200 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label={data ? `${data.name} details` : 'Component details'}
      >
        {data && (
          <div className="flex h-full flex-col">
            <header
              className="border-b border-line px-5 py-4 flex items-start gap-3"
              style={{ borderTopColor: ACCENT[data.color] || ACCENT.teal, borderTopWidth: 3, borderTopStyle: 'solid' }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-text-primary leading-tight">{data.name}</h2>
                <p className="mt-1 text-xs text-text-muted truncate">{data.product}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                className="rounded p-1.5 text-text-muted hover:bg-ink-700 hover:text-text-primary"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <Section label="Role in this architecture">
                <p className="text-sm text-text-primary leading-relaxed">{data.role}</p>
              </Section>

              <Section label="M-26-14 requirement">
                <p className="text-sm text-text-primary leading-relaxed">{data.requirement}</p>
              </Section>

              <Section label="Elastic config notes">
                <p className="text-sm text-text-primary leading-relaxed">{data.config}</p>
              </Section>

              {data.docs?.length > 0 && (
                <Section label="Reference docs">
                  <ul className="space-y-1.5">
                    {data.docs.map((d) => (
                      <li key={d.url}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-accent-teal hover:underline break-words"
                        >
                          {d.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function Section({ label, children }) {
  return (
    <section>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </h3>
      {children}
    </section>
  )
}
