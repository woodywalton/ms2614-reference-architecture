import React, { useState, useRef, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'
import { SIZE_ORDER, sizingTable } from '../data/sizing.js'
import { COMPONENTS } from '../data/components.js'
import { useTheme } from '../ThemeContext.jsx'
import Drawer from './Drawer.jsx'
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

const DETAIL_TABS = ['Maturity Level Requirements', 'Required Components', 'Elastic Assets']

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
  const [infoPanelOpen, setInfoPanelOpen] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const { theme } = useTheme()
  const diagramRef = useRef(null)
  const [diagramHeight, setDiagramHeight] = useState(null)
  const [zoom, setZoom] = useState(1)
  const ZOOM_MIN = 0.5
  const ZOOM_MAX = 2
  const ZOOM_STEP = 0.1

  useEffect(() => {
    const el = diagramRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setDiagramHeight(entry.target.getBoundingClientRect().height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Reset height + recompute fit zoom on level/size change
  useEffect(() => {
    setDiagramHeight(null)
    const id = requestAnimationFrame(() => {
      const container = diagramRef.current
      if (!container) return
      const svg = container.querySelector('svg')
      if (!svg?.viewBox?.baseVal?.width) return
      const vb = svg.viewBox.baseVal
      const padding = 16 // p-2
      // Use container's CSS max-height ceiling (not current height, which depends on zoom)
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
            height: diagramHeight ?? undefined,
            minHeight: diagramHeight ? undefined : 500,
            maxHeight: 'min(800px, calc(100vh - 300px))',
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
                {activeTab === 'Required Components'       && <ComponentsTab levelNum={levelNum} onNodeClick={setSelectedNode} />}
                {activeTab === 'Elastic Assets'            && <AssetsTab levelNum={levelNum} />}
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
            /* Narrow closed bar — expand button at bottom */
            <div className="flex flex-col items-center justify-end h-full pb-4">
              <button
                onClick={() => setInfoPanelOpen(true)}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-ink-700 transition-colors"
                title="Expand panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" role="presentation" aria-hidden="true">
                  <path d="m12.707 8-2.853 2.854-.708-.707L10.793 8.5H7v-1h3.793L9.146 5.854l.708-.708L12.707 8Z"/>
                  <path fillRule="evenodd" d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12ZM2 13.207V14h.793L5 11.793v-1.586l-3 3ZM4.207 14H5v-.793L4.207 14ZM6 14h8V2H6v12Zm-4-3.793v1.586l3-3V7.207l-3 3Zm0-3v1.586l3-3V4.207l-3 3Zm0-3v1.586l3-3V2h-.793L2 4.207Zm0-1.414L2.793 2H2v.793Z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right: architecture diagram — ResizeObserver source of truth for panel height */}
        <div className="relative">
          <div
            ref={diagramRef}
            className="rounded-lg p-2 overflow-auto"
            style={{
              border: '1px solid rgb(var(--color-line))',
              backgroundColor: theme === 'dark' ? '#0D1117' : '#FFFFFF',
              maxHeight: 'min(800px, calc(100vh - 300px))',
            }}
          >
            <div style={{ width: `${zoom * 100}%`, margin: '0 auto' }}>
              <Diagram size={size} onNodeClick={setSelectedNode} />
            </div>
          </div>
          {/* Floating zoom controls — pinned to bottom-right of diagram panel */}
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center rounded-lg border border-line bg-ink-800 shadow-lg overflow-hidden"
            style={{ borderStyle: 'solid' }}
          >
            <button
              onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
              disabled={zoom <= ZOOM_MIN}
              className="px-3 py-1.5 text-text-muted hover:text-text-primary hover:bg-ink-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-ink-700 transition-colors tabular-nums min-w-[3.25rem] text-center"
              title="Reset zoom to 100%"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
              disabled={zoom >= ZOOM_MAX}
              className="px-3 py-1.5 text-text-muted hover:text-text-primary hover:bg-ink-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              +
            </button>
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

function ReqBadge({ label, value, on, color }) {
  const onColors = {
    yellow: 'border-accent-yellow/50 bg-accent-yellow/10',
    coral:  'border-accent-coral/50  bg-accent-coral/10',
    teal:   'border-accent-teal/50   bg-accent-teal/10',
  }
  const valueColors = {
    yellow: 'text-accent-yellow',
    coral:  'text-accent-coral',
    teal:   'text-accent-teal',
  }
  return (
    <div className={`rounded border px-3 py-2 ${on ? onColors[color] : 'border-line bg-ink-700'}`}>
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${on ? valueColors[color] : 'text-text-muted italic'}`}>{value}</p>
    </div>
  )
}

function ReqSection({ title, children }) {
  return (
    <div className="rounded-lg border border-line bg-ink-700 p-3 mt-3 first:mt-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function ReqItem({ children }) {
  return (
    <li className="flex gap-2 text-sm text-text-primary leading-relaxed">
      <span className="text-accent-teal mt-0.5 shrink-0">›</span>
      <span>{children}</span>
    </li>
  )
}

// ─── Requirements tab ─────────────────────────────────────────────────────────

function RequirementsTab({ meta, onNodeClick }) {
  const L = (id, label) => (
    <ComponentLink componentId={id} onNodeClick={onNodeClick}>{label}</ComponentLink>
  )

  const content = {
    1: (
      <>
        <ReqSection title="Log Collection">
          <ReqItem>Enumerate and collect logs from all agency systems across all required {L('sources', 'Appendix B event categories')}.</ReqItem>
          <ReqItem>Deploy {L('elasticAgent', 'Elastic Agent')} as the primary collection mechanism. Route legacy and OT sources through {L('logstash', 'Logstash')} where direct agent deployment is not possible.</ReqItem>
          <ReqItem>Register all log-producing systems in the Agency Logging Plan via {L('fleetServer', 'Fleet Server')} enrollment.</ReqItem>
        </ReqSection>
        <ReqSection title="Retention">
          <ReqItem>Retain all collected logs in a {L('snapshot6mo', 'retrievable state')} for a minimum of 6 months (THIRF).</ReqItem>
          <ReqItem><span className="text-text-muted italic">No searchable (CEM) retention requirement at this level.</span></ReqItem>
        </ReqSection>
        <ReqSection title="Administrative">
          <ReqItem>Submit Agency Logging Plan within 90 days of LRA publication, documenting all log sources and coverage gaps.</ReqItem>
        </ReqSection>
      </>
    ),
    2: (
      <>
        <ReqSection title="Log Collection">
          <ReqItem>Achieve full coverage of all {L('sources', 'Appendix B log categories')} — no gaps in required event categories.</ReqItem>
          <ReqItem>Maintain a complete asset and system inventory reflected in the logging pipeline via {L('fleetServer', 'Fleet Server')}.</ReqItem>
        </ReqSection>
        <ReqSection title="Retention">
          <ReqItem>Retain logs in a {L('snapshot12mo', 'retrievable state')} for a minimum of 12 months (THIRF).</ReqItem>
          <ReqItem><span className="text-text-muted italic">No searchable (CEM) retention requirement at this level.</span></ReqItem>
        </ReqSection>
        <ReqSection title="Administrative">
          <ReqItem>Update the Agency Logging Plan to reflect full Appendix B coverage and complete asset inventory.</ReqItem>
        </ReqSection>
      </>
    ),
    3: (
      <>
        <ReqSection title="Retention (CEM first applies)">
          <ReqItem>Maintain ≥ 3 months of immediately searchable log data across {L('hotTier', 'hot')}, {L('coldTier', 'cold')}, and {L('frozenTier', 'frozen')} tiers (CEM requirement first applies at this level).</ReqItem>
          <ReqItem>Maintain ≥ 12 months of {L('snapshot12mo', 'retrievable log data')} (THIRF).</ReqItem>
        </ReqSection>
        <ReqSection title="Threat Detection">
          <ReqItem>Implement automated threat detection and anomaly detection via {L('ml', 'Elastic ML jobs')} running behavioral baselines.</ReqItem>
          <ReqItem>Ingest and match known indicators of compromise against live event streams using {L('iocMatching', 'IOC matching')}.</ReqItem>
          <ReqItem>Prioritize alerts with {L('alertCorrelator', 'risk scoring and alert correlation')} before SOC triage.</ReqItem>
        </ReqSection>
        <ReqSection title="Data Protections">
          <ReqItem>Apply {L('sensitiveDataProtection', 'sensitive data protection controls')} in the ingest pipeline before log data reaches storage.</ReqItem>
        </ReqSection>
      </>
    ),
    4: (
      <>
        <ReqSection title="Retention">
          <ReqItem>Maintain ≥ 6 months of immediately searchable log data (CEM) across the {L('hotTier', 'hot')}, {L('coldTier', 'cold')}, and {L('frozenTier', 'frozen')} tiers.</ReqItem>
          <ReqItem>Maintain ≥ 12 months of {L('snapshot12mo', 'retrievable log data')} (THIRF).</ReqItem>
        </ReqSection>
        <ReqSection title="Architecture">
          <ReqItem>Operate a federated, distributed logging architecture enabling the top-level SOC to query all agency log stores via {L('ccs', 'Cross-Cluster Search')}.</ReqItem>
          <ReqItem>Enforce encryption at rest and in transit using {L('byok', 'agency-controlled key management (BYOK)')}.</ReqItem>
          <ReqItem>Ensure tamper-evident log integrity and {L('ntp', 'USNO/NIST-traceable NTP timestamps')} across all agents and nodes.</ReqItem>
        </ReqSection>
        <ReqSection title="Log Access">
          <ReqItem>Maintain a documented and tested procedure for {L('cisaExport', 'sharing logs with CISA and the FBI')} upon request. Procedure must be included in the Agency Logging Plan and tested at least annually.</ReqItem>
        </ReqSection>
      </>
    ),
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-2 mb-4">
        <ReqBadge label="Searchable (CEM)" value={meta.searchable ?? '— not required'} on={Boolean(meta.searchable)} color="yellow" />
        <ReqBadge label="Retrievable (THIRF)" value={meta.retrievable} on color="coral" />
      </div>
      <p className="text-xs text-text-muted mb-3">Due: {meta.deadline}</p>
      <div className="space-y-1 text-sm">
        {content[meta.id]}
      </div>
    </div>
  )
}

// ─── Components tab ───────────────────────────────────────────────────────────

function ComponentsTab({ levelNum, onNodeClick }) {
  const keys = LEVEL_COMPONENTS[levelNum] || []
  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted mb-3 leading-relaxed">
        Components present in the Level {levelNum} architecture. Select any component to open detailed configuration, M-26-14 requirements mapping, and reference documentation.
      </p>
      {keys.map((key) => {
        const comp = COMPONENTS[key]
        if (!comp) return null
        return (
          <button
            key={key}
            onClick={() => onNodeClick(key)}
            className="w-full text-left rounded-lg border border-line bg-ink-700 p-3 hover:border-accent-teal/40 hover:bg-accent-teal/5 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-text-primary">{comp.name}</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{comp.role}</p>
          </button>
        )
      })}
    </div>
  )
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

const ASSET_CATEGORIES = [
  {
    label: 'Kibana Dashboards',
    count: 7,
    levels: [1, 2, 3, 4],
    desc: 'Maturity overview, asset coverage, alert coverage, retention compliance, log management, Appendix B coverage, and compliance attestation dashboards.',
    usage: 'Deploy to a shared Kibana space. Used by SOC analysts and compliance officers to verify log source coverage and monitor retention health in real time.',
  },
  {
    label: 'Detection Rules',
    count: 27,
    levels: [3, 4],
    desc: '13 threshold-based Appendix B rules, 13 ML-based anomaly rules, 1 compliance degradation meta-rule.',
    usage: 'Import via Kibana Security → Rules → Import. Rules map directly to M-26-14 Appendix B event categories; review rule descriptions for applicable log sources.',
  },
  {
    label: 'ILM Policies',
    count: 5,
    levels: [3, 4],
    desc: 'Hot → Cold → Frozen → Delete lifecycle policies for L3 and L4, plus a dedicated asset inventory retention policy.',
    usage: 'Apply to all ingest index templates in Fleet. Policy names encode the retention tier (e.g., `m2614-l3-hot-cold-frozen`). Review phase durations before applying to production.',
  },
  {
    label: 'Ingest Pipelines',
    count: 3,
    levels: [3, 4],
    desc: 'Log integrity hash (SHA-256), osquery normalization, and alert category enrichment pipelines.',
    usage: 'Reference in Fleet integration policies via the `pipeline` field. Integrity hash pipeline must be applied before any redaction step to preserve the tamper-evident chain.',
  },
  {
    label: 'ML Job Definitions',
    count: 6,
    levels: [3, 4],
    desc: 'Anomaly detection jobs and datafeeds for behavioral baselines and UBA/UEBA workloads.',
    usage: 'Import via Machine Learning → Anomaly Detection → Import job. Run datafeed initialization across ≥ 3 months of historical data before enabling alerting.',
  },
  {
    label: 'Fleet Packs',
    count: 1,
    levels: [1, 2, 3, 4],
    desc: 'Osquery pack for hardware, software, and network asset inventory collection.',
    usage: 'Add to the Fleet agent policy for all enrolled endpoints. Results index into `logs-osquery_manager.result-*`; the Kibana Asset Coverage dashboard reads from this index.',
  },
]

function AssetsTab({ levelNum }) {
  const applicable = ASSET_CATEGORIES.filter((a) => a.levels.includes(levelNum))
  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted leading-relaxed mb-3">
        Elastic-built compliance pack assets for M-26-14 Level {levelNum}. See{' '}
        <Link to="/asset-inventory" className="text-accent-teal hover:underline">
          Asset Inventory
        </Link>{' '}
        for download and deployment instructions.
      </p>
      <div className="space-y-3">
        {applicable.map((a) => (
          <div key={a.label} className="rounded-lg border border-line bg-ink-700 p-3">
            <div className="flex gap-3 mb-2">
              <div className="shrink-0 w-7 text-right">
                <span className="text-lg font-bold text-accent-teal">{a.count}</span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary">{a.label}</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-2">{a.desc}</p>
            <p className="text-xs text-text-primary/80 leading-relaxed border-t border-line/60 pt-2">
              <span className="font-medium text-text-muted uppercase tracking-wider text-[10px]">How to use · </span>
              {a.usage}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
