// Right-side detail drawer. Driven by the global selected component state.

import React, { useEffect } from 'react'
import { EuiIcon } from '@elastic/eui'
import { COMPONENTS } from '../data/components.js'
import { getSizing } from '../data/sizing.js'

const ACCENT = {
  teal: '#00BFB3',
  blue: '#0077CC',
  gray: '#6E7681',
  purple: '#7B5EA7',
  green: '#2EA043',
  coral: '#CF4F27',
  yellow: '#D29922',
}

export default function Drawer({ componentId, size, onClose }) {
  const open = Boolean(componentId)
  const data = componentId ? COMPONENTS[componentId] : null
  const sizing = size ? getSizing(size) : null
  const tierKey = data?.tierKey
  const showSizing = Boolean(tierKey && sizing)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* backdrop — full viewport, nav sits above (z-50) */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ marginTop: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* panel — full viewport height, nav covers the top strip */}
      <aside
        className={`fixed right-0 z-40 w-full max-w-md bg-ink-800 shadow-2xl
                    flex flex-col
                    transform transition-transform duration-200 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: 0, height: '100vh', paddingTop: 'var(--nav-height, 60px)', marginTop: 0, borderLeft: '1px solid rgb(var(--color-line))' }}
        role="dialog"
        aria-modal="true"
        aria-label={data ? `${data.name} details` : 'Component details'}
      >
        {data && (
          <div className="flex flex-col h-full">
            <header
              className="px-5 py-4 flex items-start gap-3 shrink-0"
              style={{
                borderTopColor: ACCENT[data.color] || ACCENT.teal,
                borderTopWidth: 3,
                borderTopStyle: 'solid',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgb(var(--color-line))',
              }}
            >
              {data.euiIcon && (
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded bg-ink-700/60"
                  style={{ border: '1px solid rgb(var(--color-line))' }}>
                  <EuiIcon type={data.euiIcon} size="l" />
                </div>
              )}
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
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{data.config}</p>
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

              {showSizing && (
                <Section label={`Sizing at this tier — ${sizing.label}`}>
                  <TierSizing tierKey={tierKey} sizing={sizing} />
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
    <section className="rounded-lg bg-ink-700 p-3" style={{ border: '1px solid rgb(var(--color-line))' }}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </h3>
      {children}
    </section>
  )
}

const TIER_LABEL = {
  hot: 'Hot tier — fast SSD nodes handling ingest and immediate query.',
  cold: 'Cold tier — read-only nodes carrying the days 4–10 searchable window.',
  frozen: 'Frozen tier — mounted searchable snapshots backed by object storage.',
  ml: 'ML nodes — dedicated compute pool for Elastic Machine Learning jobs.',
  master: 'Master nodes — dedicated cluster-state management; fixed across sizes.',
  kibana: 'Kibana instances — SOC frontend; fixed across sizes.',
}

function TierSizing({ tierKey, sizing }) {
  const count = (() => {
    switch (tierKey) {
      case 'hot':    return sizing.hotNodes
      case 'cold':   return sizing.coldNodes
      case 'frozen': return sizing.frozenNodes
      default:       return 3 // ml / master / kibana fixed at 3 per AZ
    }
  })()
  const instance = sizing.instanceTypes[tierKey]
  const isFixed = tierKey === 'master' || tierKey === 'kibana'
  const ramByKey = {
    ml: sizing.mlNodeRamGB,
    master: sizing.masterNodeRamGB,
    kibana: sizing.kibanaRamGB,
  }
  const ram = ramByKey[tierKey]

  return (
    <div className="rounded bg-ink-900/60 p-3 space-y-2 text-sm" style={{ border: '1px solid rgb(var(--color-line))' }}>
      <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-xs">
        <span className="text-text-muted">Node count</span>
        <span className="text-text-primary font-medium">
          {count} {count === 1 ? 'node' : 'nodes'}
          {isFixed && <span className="text-text-muted"> (fixed across sizes)</span>}
        </span>
        <span className="text-text-muted">Instance type</span>
        <span className="text-text-primary font-medium font-mono">{instance}</span>
        {ram != null && (
          <>
            <span className="text-text-muted">RAM per node</span>
            <span className="text-text-primary font-medium">{ram} GB</span>
          </>
        )}
      </div>
      <p className="text-xs text-text-muted italic leading-snug pt-2" style={{ borderTop: '1px solid rgba(var(--color-line), 0.6)' }}>
        {TIER_LABEL[tierKey]}
      </p>
    </div>
  )
}
