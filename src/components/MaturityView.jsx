import React, { useState, useRef, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'
import { SIZE_ORDER, sizingTable, getSizing, getTierNodeCount } from '../data/sizing.js'
import { COMPONENTS } from '../data/components.js'
import { ASSET_FILES, ASSET_TYPE_META, ASSET_COLUMNS } from '../data/assets.js'
import { useTheme } from '../ThemeContext.jsx'
import Drawer from './Drawer.jsx'
import AssetViewer from './AssetViewer.jsx'
import Level1Diagram from './diagrams/Level1Diagram.jsx'
import Level2Diagram from './diagrams/Level2Diagram.jsx'
import Level3Diagram from './diagrams/Level3Diagram.jsx'
import Level4Diagram from './diagrams/Level4Diagram.jsx'

const DIAGRAMS = {
  1: Level1Diagram,
  2: Level2Diagram,
  3: Level3Diagram,
  4: Level4Diagram,
}

const SIZE_LABELS = {
  small:  'Small-sized Organization',
  medium: 'Medium-sized Organization',
  large:  'Large-sized Organization',
}

const DETAIL_TABS = ['Maturity Level Requirements', 'Component Details', 'Elastic Assets']

const LEVEL_COMPONENTS = {
  1: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  2: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  3: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  4: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'ingestPipelines', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'ccs', 'onPremStore', 'cloudCold', 'cloudObjectStore', 'iotEdge', 'byok', 'ntp', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes', 'soc'],
}

export default function MaturityView() {
  const { size, level } = useParams()
  const levelNum = Number(level)
  const [activeTab, setActiveTab] = useState('Maturity Level Requirements')
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [viewerAssetId, setViewerAssetId] = useState(null)
  const { theme } = useTheme()
  const diagramRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const ZOOM_MIN = 0.5
  const ZOOM_MAX = 2
  const ZOOM_STEP = 0.1

  // Compute fit zoom when level/size changes
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const container = diagramRef.current
      if (!container) return
      const svg = container.querySelector('svg')
      if (!svg?.viewBox?.baseVal?.width) return
      const vb = svg.viewBox.baseVal
      const padding = 16
      const maxContainerH = Math.min(800, window.innerHeight - 300)
      const availW = Math.max(0, container.clientWidth - padding)
      const availH = Math.max(0, maxContainerH - padding)
      if (availW === 0 || availH === 0) return
      const naturalH = availW * (vb.height / vb.width)
      const fit = naturalH > availH
        ? Math.max(ZOOM_MIN, +(availH / naturalH).toFixed(2))
        : 1
      setZoom(fit)
    })
    return () => cancelAnimationFrame(id)
  }, [levelNum, size])

  if (!SIZE_ORDER.includes(size)) return <Navigate to="/maturity/small/1" replace />
  const meta = LEVELS.find((l) => l.id === levelNum)
  if (!meta) return <Navigate to="/maturity/small/1" replace />

  const Diagram = DIAGRAMS[levelNum]

  return (
    <main className="mx-auto max-w-[1800px] px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-text-primary">
          M-26-14 Maturity Levels by Organizational Size
        </h1>
        <p className="mt-8 mb-8 text-base text-text-muted leading-relaxed">
          Select a maturity level to explore the reference architecture, requirements, and compliance
          assets for that configuration. Choose an organization size tier based on daily ingest volume.
        </p>
      </header>

      {/* Maturity level selector row */}
      <div className="flex items-center gap-4">
        <h2 className="text-text-primary text-xl font-semibold w-44 shrink-0 text-right">
          Maturity Level
        </h2>
        <div className="grid grid-cols-4 gap-2 flex-1">
          {LEVELS.map((lvl) => {
            const isActive = lvl.id === levelNum
            return (
              <Link
                key={lvl.id}
                to={`/maturity/${size}/${lvl.id}`}
                replace
                className={
                  `block rounded-lg border px-4 py-3 text-center text-base font-semibold transition-colors ` +
                  (isActive
                    ? 'border-accent-teal/60 bg-accent-teal/15 text-accent-teal'
                    : 'border-line bg-ink-800 text-text-muted hover:border-accent-teal/30 hover:bg-accent-teal/5 hover:text-text-primary')
                }
              >
                {lvl.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* View Details selector row */}
      <div className="flex items-center gap-4">
        <h2 className="text-text-primary text-xl font-semibold w-44 shrink-0 text-right">
          View Details
        </h2>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab && infoPanelOpen
            return (
              <button
                key={tab}
                onClick={() => {
                  if (infoPanelOpen && activeTab === tab) {
                    setInfoPanelOpen(false)
                  } else {
                    setActiveTab(tab)
                    setInfoPanelOpen(true)
                  }
                }}
                className={
                  `rounded-lg border px-4 py-2 text-sm font-medium transition-colors ` +
                  (isActive
                    ? 'border-accent-blue/60 bg-accent-blue/15 text-accent-blue'
                    : 'border-line bg-ink-800 text-text-muted hover:border-accent-blue/30 hover:bg-accent-blue/5 hover:text-text-primary')
                }
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content: push-flyout info panel + fluid diagram */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: infoPanelOpen ? '340px minmax(0,1fr)' : '44px minmax(0,1fr)',
          transition: 'grid-template-columns 250ms ease',
        }}
      >
        {/* Left: info panel — push flyout */}
        <div
          className="rounded-lg bg-ink-800 flex flex-col overflow-hidden"
          style={{
            border: '1px solid rgb(var(--color-line))',
            height: 'min(800px, calc(100vh - 300px))',
          }}
        >
          {infoPanelOpen ? (
            <>
              {/* Header — active tab label */}
              <div className="px-4 py-3 shrink-0">
                <p className="text-sm font-semibold text-accent-blue">{activeTab}</p>
              </div>
              {/* Scrollable content */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                {activeTab === 'Maturity Level Requirements' && <RequirementsTab meta={meta} onNodeClick={setSelectedNode} />}
                {activeTab === 'Component Details'         && <ComponentsTab levelNum={levelNum} size={size} onNodeClick={setSelectedNode} />}
                {activeTab === 'Elastic Assets'            && <AssetsTab levelNum={levelNum} onViewAsset={setViewerAssetId} />}
              </div>
              {/* Footer — collapse button */}
              <div className="shrink-0 flex justify-end px-3 py-2">
                <button
                  onClick={() => setInfoPanelOpen(false)}
                  className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-ink-700 transition-colors"
                  title="Collapse panel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" role="presentation" aria-hidden="true">
                    <path d="M10.854 5.854 9.207 7.5H13v1H9.207l1.646 1.646-.707.707L7.293 8l2.853-2.854.707.708Z"/>
                    <path fillRule="evenodd" d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12ZM2 13.207V14h.793L5 11.793v-1.586l-3 3ZM4.207 14H5v-.793L4.207 14ZM6 14h8V2H6v12Zm-4-3.793v1.586l3-3V7.207l-3 3Zm0-3v1.586l3-3V4.207l-3 3Zm0-3v1.586l3-3V2h-.793L2 4.207Zm0-1.414L2.793 2H2v.793Z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* Narrow closed bar — click anywhere to expand */
            <div
              className="flex flex-col items-center justify-end h-full pb-4 cursor-pointer hover:bg-ink-700/30 transition-colors"
              onClick={() => setInfoPanelOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setInfoPanelOpen(true) }}
              title="Expand panel"
            >
              <button
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-ink-700 transition-colors pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" role="presentation" aria-hidden="true">
                  <path d="m12.707 8-2.853 2.854-.708-.707L10.793 8.5H7v-1h3.793L9.146 5.854l.708-.708L12.707 8Z"/>
                  <path fillRule="evenodd" d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12ZM2 13.207V14h.793L5 11.793v-1.586l-3 3ZM4.207 14H5v-.793L4.207 14ZM6 14h8V2H6v12Zm-4-3.793v1.586l3-3V7.207l-3 3Zm0-3v1.586l3-3V4.207l-3 3Zm0-3v1.586l3-3V2h-.793L2 4.207Zm0-1.414L2.793 2H2v.793Z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right: architecture diagram with zoom controls */}
        <div className="relative" style={{ height: 'min(800px, calc(100vh - 300px))' }}>
          <div
            ref={diagramRef}
            className="rounded-lg p-2 overflow-auto"
            style={{
              border: '1px solid rgb(var(--color-line))',
              backgroundColor: theme === 'dark' ? '#0B1628' : '#FFFFFF',
              height: '100%',
            }}
          >
            <div style={{ width: `${zoom * 100}%`, margin: '0 auto' }}>
              <Diagram size={size} onNodeClick={setSelectedNode} />
            </div>
          </div>
          <div
            className="absolute top-3 right-3 z-10 flex items-center rounded-lg border border-line bg-ink-800 shadow-lg overflow-hidden"
            style={{ borderStyle: 'solid' }}
          >
            <button
              onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
              disabled={zoom <= ZOOM_MIN}
              className="px-3 py-1.5 text-text-muted hover:text-text-primary hover:bg-ink-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
              title="Zoom out" aria-label="Zoom out"
            >−</button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-ink-700 transition-colors tabular-nums min-w-[3.25rem] text-center"
              title="Reset zoom" aria-label="Reset zoom"
            >{Math.round(zoom * 100)}%</button>
            <button
              onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
              disabled={zoom >= ZOOM_MAX}
              className="px-3 py-1.5 text-text-muted hover:text-text-primary hover:bg-ink-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
              title="Zoom in" aria-label="Zoom in"
            >+</button>
          </div>
        </div>
      </div>

      {/* Org size selector row */}
      <div className="flex items-center gap-4">
        <h2 className="text-text-primary text-xl font-semibold w-44 shrink-0 text-right">
          Organization Size
        </h2>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {SIZE_ORDER.map((s) => {
            const isActive = s === size
            return (
              <Link
                key={s}
                to={`/maturity/${s}/${level}`}
                replace
                className={
                  `block rounded-lg border px-6 py-4 text-center transition-colors ` +
                  (isActive
                    ? 'border-accent-blue/60 bg-accent-blue/15 text-accent-blue'
                    : 'border-line bg-ink-800 text-text-muted hover:border-accent-blue/30 hover:bg-accent-blue/5 hover:text-text-primary')
                }
              >
                <p className="text-base font-semibold">{SIZE_LABELS[s]}</p>
                <p className="text-sm text-text-muted mt-0.5">{sizingTable[s].ingestRange} / day</p>
              </Link>
            )
          })}
        </div>
      </div>

      <Drawer componentId={selectedNode} size={size} onClose={() => setSelectedNode(null)} />
      <AssetViewer assetId={viewerAssetId} onClose={() => setViewerAssetId(null)} />
    </main>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ComponentLink({ componentId, onNodeClick, children }) {
  return (
    <button
      onClick={() => onNodeClick(componentId)}
      className="text-accent-teal font-medium underline decoration-dotted hover:decoration-solid cursor-pointer"
    >
      {children}
    </button>
  )
}

// ─── Requirements tab ─────────────────────────────────────────────────────────

function ReqList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-text-primary leading-relaxed">
          <span className="text-text-muted shrink-0 select-none mt-0.5">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function RequirementsTab({ meta, onNodeClick }) {
  const L = (id, label) => (
    <ComponentLink componentId={id} onNodeClick={onNodeClick}>{label}</ComponentLink>
  )

  const cemContent = {
    1: null,
    2: null,
    3: (
      <ReqList items={[
        <>Maintain ≥ 3 months of immediately searchable logs across {L('hotTier', 'hot')}, {L('coldTier', 'cold')}, and {L('frozenTier', 'frozen')} tiers.</>,
        <>Apply {L('sensitiveDataProtection', 'sensitive data protection controls')} in the ingest pipeline before data reaches storage.</>,
        <>Enable automated anomaly and behavioral detection via {L('ml', 'Elastic ML jobs')} running against 6+ months of baseline data.</>,
        <>Ingest and match known {L('iocMatching', 'indicators of compromise')} (STIX/TAXII, CISA KEV) against live event streams.</>,
        <>Prioritize alerts with {L('alertCorrelator', 'risk scoring and correlation')} before SOC triage.</>,
      ]} />
    ),
    4: (
      <ReqList items={[
        <>Maintain ≥ 6 months of immediately searchable logs across {L('hotTier', 'hot')}, {L('coldTier', 'cold')}, and {L('frozenTier', 'frozen')} tiers.</>,
        <>Enable top-level SOC to query all distributed agency log stores via {L('ccs', 'Cross-Cluster Search')}.</>,
        <>Enforce encryption at rest and in transit using {L('byok', 'agency-controlled key management (BYOK)')}.</>,
        <>Maintain {L('ntp', 'USNO/NIST-traceable NTP timestamps')} across all agents and nodes for tamper-evident forensic timelines.</>,
      ]} />
    ),
  }

  const thifrContent = {
    1: (
      <ReqList items={[
        <>Collect logs from all {L('sources', 'Appendix B log categories')} across all agency systems — no gaps.</>,
        <>Deploy {L('elasticAgent', 'Elastic Agent')} as primary collector; route legacy and OT systems through {L('logstash', 'Logstash')}.</>,
        <>Register all log-producing systems in the Agency Logging Plan via {L('fleetServer', 'Fleet Server')} enrollment.</>,
        <>Retain all collected logs in a {L('snapshot6mo', 'retrievable state')} for a minimum of 6 months.</>,
        <>Submit Agency Logging Plan within 90 days of LRA publication, documenting all sources and coverage gaps.</>,
      ]} />
    ),
    2: (
      <ReqList items={[
        <>Achieve full coverage of all {L('sources', 'Appendix B log categories')} — no gaps.</>,
        <>Maintain a complete asset and system inventory reflected in {L('fleetServer', 'Fleet Server')}.</>,
        <>Retain logs in a {L('snapshot12mo', 'retrievable state')} for a minimum of 12 months.</>,
      ]} />
    ),
    3: (
      <ReqList items={[
        <>Maintain ≥ 12 months of {L('snapshot12mo', 'retrievable log data')} (unmounted snapshot repository).</>,
      ]} />
    ),
    4: (
      <ReqList items={[
        <>Maintain ≥ 12 months of {L('snapshot12mo', 'retrievable log data')}.</>,
        <>Maintain a documented and annually-tested procedure for {L('cisaExport', 'sharing logs with CISA and the FBI')} upon request.</>,
      ]} />
    ),
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xl font-bold text-accent-teal leading-tight">{meta.name}</p>
        <p className="text-sm text-text-muted mt-1">{meta.deadline}</p>
      </div>

      {/* CEM panel */}
      <div className="rounded-lg p-3 space-y-2.5 bg-accent-yellow/5"
        style={{ border: '1px solid rgba(212, 157, 0, 0.35)', borderStyle: 'solid' }}>
        <div>
          <h3 className="text-xs font-bold tracking-wider text-accent-yellow">
            CEM — <span className="font-semibold">Continuous Event Monitoring</span>
          </h3>
          {meta.searchable
            ? <p className="mt-0.5 pl-3 text-sm font-semibold text-accent-yellow/70">{meta.searchable} searchable</p>
            : <p className="mt-0.5 pl-3 text-xs text-text-muted italic">Not required at this level</p>
          }
        </div>
        {cemContent[meta.id] ?? (
          <p className="text-sm text-text-muted italic leading-relaxed">
            No searchable retention requirement at Level {meta.id}. CEM obligations first apply at Level 3.
          </p>
        )}
      </div>

      {/* THIRF panel */}
      <div className="rounded-lg p-3 space-y-2.5 bg-accent-coral/5"
        style={{ border: '1px solid rgba(207, 79, 39, 0.35)', borderStyle: 'solid' }}>
        <div>
          <h3 className="text-xs font-bold tracking-wider text-accent-coral">
            THIRF — <span className="font-semibold">Threat Hunting, Investigation, Response &amp; Forensics</span>
          </h3>
          <p className="mt-0.5 pl-3 text-sm font-semibold text-accent-coral/70">{meta.retrievable} retrievable</p>
        </div>
        {thifrContent[meta.id]}
      </div>
    </div>
  )
}

// ─── Components tab ───────────────────────────────────────────────────────────

const COLUMN_GROUPS = [
  {
    label: 'Sources',
    keys: ['sources', 'legacySources', 'iotEdge'],
  },
  {
    label: 'Collection',
    keys: ['elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'ingestPipelines'],
  },
  {
    label: 'Elastic Search AI Platform',
    keys: ['hotTier', 'coldTier', 'frozenTier', 'ilm', 'mlNodes', 'masterNodes', 'kibanaNodes', 'ccs', 'onPremStore', 'cloudCold', 'cloudObjectStore', 'byok', 'ntp'],
  },
  {
    label: 'CEM',
    keys: ['ml', 'iocMatching', 'alertCorrelator', 'kibana', 'soc'],
  },
  {
    label: 'THIRF',
    keys: ['snapshot6mo', 'snapshot12mo', 'cisaExport'],
  },
]

function Accordion({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-line bg-ink-700 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-ink-600 transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-px border-t border-line/50">
          {children}
        </div>
      )}
    </div>
  )
}

function ComponentsTab({ levelNum, size, onNodeClick }) {
  const levelKeys = new Set(LEVEL_COMPONENTS[levelNum] || [])
  const s = getSizing(size)

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted mb-3 leading-relaxed">
        Architecture components at Level {levelNum}. Select any item to open full configuration, M-26-14 mapping, and documentation.
      </p>
      {COLUMN_GROUPS.map((group) => {
        const groupKeys = group.keys.filter(k => levelKeys.has(k))
        if (!groupKeys.length) return null
        return (
          <Accordion key={group.label} label={group.label} defaultOpen={group.label === 'Sources'}>
            {groupKeys.map((key) => {
              const comp = COMPONENTS[key]
              if (!comp) return null
              const nodeCount = comp.tierKey ? getTierNodeCount(comp.tierKey, size) : null
              const instanceType = comp.tierKey ? s.instanceTypes[comp.tierKey] : null
              const roleShort = comp.role.split(/\.\s/)[0] + '.'
              return (
                <div key={key} className="py-2 border-b border-line/40 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <button
                      onClick={() => onNodeClick(key)}
                      className="text-sm font-medium text-accent-teal hover:underline text-left leading-snug"
                    >
                      {comp.name}
                    </button>
                    {comp.optional && (
                      <span className="text-[10px] text-text-muted bg-ink-600 border border-line px-1.5 py-0.5 rounded shrink-0">
                        optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{roleShort}</p>
                  {nodeCount != null && (
                    <p className="text-xs text-accent-blue mt-1">{nodeCount} nodes · {instanceType}</p>
                  )}
                </div>
              )
            })}
          </Accordion>
        )
      })}
    </div>
  )
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

function AssetsTab({ levelNum, onViewAsset }) {
  const byColumn = ASSET_COLUMNS.map(col => ({
    col,
    files: ASSET_FILES.filter(f => f.column === col && f.levels.includes(levelNum)),
  })).filter(g => g.files.length)

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted leading-relaxed">
        Compliance pack assets for Level {levelNum}, by architecture layer. Click{' '}
        <span className="text-accent-blue font-medium">View</span> to inspect the file content. See{' '}
        <Link to="/asset-inventory" className="text-accent-teal hover:underline">
          Asset Inventory
        </Link>{' '}
        for deployment instructions.
      </p>
      {byColumn.map(({ col, files }) => (
        <div key={col} className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">{col}</p>
          {files.map(f => {
            const typeMeta = ASSET_TYPE_META[f.type] ?? { label: f.type, color: 'text-text-muted', bg: 'bg-ink-700 border-line' }
            return (
              <div key={f.id} className="rounded-lg bg-ink-700 p-3" style={{ border: '1px solid rgb(var(--color-line))' }}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeMeta.bg} ${typeMeta.color}`}
                        style={{ borderStyle: 'solid' }}>
                        {typeMeta.label}
                      </span>
                      {f.ruleCount && (
                        <span className="text-[9px] text-text-muted">{f.ruleCount} rules</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary leading-snug">{f.label}</p>
                    <p className="mt-1 text-xs text-text-muted leading-relaxed">{f.desc}</p>
                  </div>
                  <button
                    onClick={() => onViewAsset(f.id)}
                    className="shrink-0 text-xs px-2.5 py-1 rounded border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10 transition-colors mt-0.5"
                    style={{ borderStyle: 'solid' }}
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
