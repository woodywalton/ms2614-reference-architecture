import React, { useState } from 'react'
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

const DETAIL_TABS = ['Requirements', 'Components', 'Assets']

const LEVEL_COMPONENTS = {
  1: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  2: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  3: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  4: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'ingestPipelines', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'ccs', 'onPremStore', 'cloudCold', 'cloudObjectStore', 'iotEdge', 'byok', 'ntp', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes', 'soc'],
}

export default function MaturityView() {
  const { size, level } = useParams()
  const levelNum = Number(level)
  const [activeTab, setActiveTab] = useState('Requirements')
  const [selectedNode, setSelectedNode] = useState(null)
  const { theme } = useTheme()

  if (!SIZE_ORDER.includes(size)) return <Navigate to="/maturity/small/1" replace />
  const meta = LEVELS.find((l) => l.id === levelNum)
  if (!meta) return <Navigate to="/maturity/small/1" replace />

  const Diagram = DIAGRAMS[levelNum]

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-text-primary">
          M-26-14 Maturity Levels by Organizational Size
        </h1>
        <p className="mt-8 mb-8 text-base text-text-muted leading-relaxed">
          Select a maturity level to explore the reference architecture, requirements, and compliance
          assets for that configuration. Choose an organization size tier based on daily ingest volume.
        </p>
      </header>

      {/* Maturity level tabs */}
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

      {/* Main content: fixed 340px info panel + fluid diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">

        {/* Left: detail pane */}
        <div className="rounded-lg border border-line bg-ink-800 overflow-hidden min-h-[500px] flex flex-col">
          {/* EUI-style tab bar — inline border bypasses EUI global border-style:none reset */}
          <div className="flex px-2 shrink-0"
            style={{ borderBottom: '1px solid rgb(var(--color-line))' }}>
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  `relative px-4 py-2.5 text-sm transition-colors ` +
                  (activeTab === tab
                    ? 'text-accent-blue font-semibold'
                    : 'text-text-muted hover:text-text-primary')
                }
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 h-[2px] bg-accent-blue" style={{ bottom: '-1px' }} />
                )}
              </button>
            ))}
          </div>
          <div className="p-5 overflow-y-auto flex-1">
            {activeTab === 'Requirements' && <RequirementsTab meta={meta} onNodeClick={setSelectedNode} />}
            {activeTab === 'Components'   && <ComponentsTab levelNum={levelNum} onNodeClick={setSelectedNode} />}
            {activeTab === 'Assets'       && <AssetsTab levelNum={levelNum} />}
          </div>
        </div>

        {/* Right: architecture diagram */}
        <div
          className="rounded-lg border border-line p-4 overflow-x-auto"
          style={{ backgroundColor: theme === 'dark' ? '#0D1117' : '#FFFFFF' }}
        >
          <Diagram size={size} onNodeClick={setSelectedNode} />
        </div>
      </div>

      {/* Org size tabs — bottom */}
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
