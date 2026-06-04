import React, { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'
import { SIZE_ORDER, sizingTable } from '../data/sizing.js'
import { COMPONENTS } from '../data/components.js'
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

const DETAIL_TABS = ['Overview', 'Requirements', 'Components', 'Assets']

const LEVEL_COMPONENTS = {
  1: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  2: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  3: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes'],
  4: ['sources', 'legacySources', 'elasticAgent', 'fleetServer', 'logstash', 'sensitiveDataProtection', 'ingestPipelines', 'hotTier', 'coldTier', 'frozenTier', 'ilm', 'snapshot6mo', 'snapshot12mo', 'ml', 'iocMatching', 'alertCorrelator', 'ccs', 'onPremStore', 'cloudCold', 'cloudObjectStore', 'iotEdge', 'byok', 'ntp', 'kibana', 'masterNodes', 'kibanaNodes', 'mlNodes', 'soc'],
}

export default function MaturityView() {
  const { size, level } = useParams()
  const levelNum = Number(level)
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedNode, setSelectedNode] = useState(null)

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
          Select an organization size tier based on daily ingest volume, then choose a maturity
          level to explore the reference architecture, requirements, and compliance assets for
          that configuration.
        </p>
      </header>

      {/* Org size tabs — label + full-width 3-column grid */}
      <div className="flex items-center gap-4">
        <h2 className="text-text-primary text-lg font-semibold w-44 shrink-0 text-right">
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

      {/* Maturity level tabs — label + full-width 4-column grid */}
      <div className="flex items-center gap-4">
        <h2 className="text-text-primary text-lg font-semibold w-44 shrink-0 text-right">
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

      {/* Main content: 1/4 info panel + 3/4 diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 !mt-12">

        {/* Left: tabbed detail pane (1/4) */}
        <div className="xl:col-span-1 rounded-lg border border-line bg-ink-800 flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-line shrink-0">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  `flex-1 px-2 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ` +
                  (activeTab === tab
                    ? 'border-accent-teal text-accent-teal'
                    : 'border-transparent text-text-muted hover:text-text-primary')
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 overflow-y-auto min-h-[500px] flex-1">
            {activeTab === 'Overview'     && <OverviewTab meta={meta} />}
            {activeTab === 'Requirements' && <RequirementsTab meta={meta} />}
            {activeTab === 'Components'   && <ComponentsTab levelNum={levelNum} />}
            {activeTab === 'Assets'       && <AssetsTab levelNum={levelNum} />}
          </div>
        </div>

        {/* Right: architecture diagram (3/4) */}
        <div className="xl:col-span-3 rounded-lg border border-line bg-ink-800 p-4 overflow-x-auto">
          <Diagram size={size} onNodeClick={setSelectedNode} />
        </div>
      </div>

      <Drawer componentId={selectedNode} size={size} onClose={() => setSelectedNode(null)} />
    </main>
  )
}

function ReqBadge({ label, value, on }) {
  return (
    <div className={`rounded border px-3 py-2 ${on ? 'border-accent-teal/50 bg-accent-teal/10' : 'border-line bg-ink-700'}`}>
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${on ? 'text-accent-teal' : 'text-text-muted italic'}`}>{value}</p>
    </div>
  )
}

function OverviewTab({ meta }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <ReqBadge label="Searchable (CEM)" value={meta.searchable ?? '— not required'} on={Boolean(meta.searchable)} />
        <ReqBadge label="Retrievable (THIRF)" value={meta.retrievable} on />
      </div>
      <p className="text-xs text-text-muted">Due: {meta.deadline}</p>
      <p className="text-base text-text-primary leading-relaxed">{meta.summary}</p>
      <ul className="space-y-2">
        {meta.keyPoints.map((k) => (
          <li key={k} className="flex gap-2 text-sm text-text-muted">
            <span className="text-accent-teal mt-0.5 shrink-0">›</span>
            <span>{k}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RequirementsTab({ meta }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-ink-700 p-4 space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-teal">
          CEM — Continuous Event Monitoring
        </h3>
        <p className="text-base text-text-primary">
          Searchable:{' '}
          <strong className={meta.searchable ? 'text-accent-teal' : 'text-text-muted'}>
            {meta.searchable ?? 'Not required at this level'}
          </strong>
        </p>
        <p className="text-sm text-text-muted leading-relaxed">
          Searchable data is immediately usable — no thaw or mount step required.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-ink-700 p-4 space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-blue">
          THIRF — Threat Hunting, Investigation, Response &amp; Forensics
        </h3>
        <p className="text-base text-text-primary">
          Retrievable: <strong className="text-accent-blue">{meta.retrievable}</strong>
        </p>
        <p className="text-sm text-text-muted leading-relaxed">
          Retrievable data may require intermediate steps (e.g., mounting an unmounted snapshot)
          before it is queryable.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
          Architecture requirements
        </h3>
        <ul className="space-y-2">
          {meta.keyPoints.map((k) => (
            <li key={k} className="flex gap-2 text-sm">
              <span className="text-accent-green mt-0.5 shrink-0">✓</span>
              <span className="text-text-primary">{k}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ComponentsTab({ levelNum }) {
  const keys = LEVEL_COMPONENTS[levelNum] || []
  return (
    <div className="space-y-2">
      {keys.map((key) => {
        const comp = COMPONENTS[key]
        if (!comp) return null
        return (
          <div key={key} className="rounded-lg border border-line bg-ink-700 p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-text-primary">{comp.name}</h4>
              <span className="text-xs text-text-muted shrink-0 mt-0.5">{comp.product}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{comp.role}</p>
          </div>
        )
      })}
    </div>
  )
}

function AssetsTab({ levelNum }) {
  const assetCategories = [
    { label: 'Kibana Dashboards', count: 7, desc: 'Maturity overview, asset coverage, alert coverage, retention compliance, log management, Appendix B coverage, compliance attestation' },
    { label: 'Detection Rules', count: 27, desc: '13 threshold-based Appendix B rules, 13 ML-based anomaly rules, 1 compliance degradation meta-rule' },
    { label: 'ILM Policies', count: 5, desc: 'Hot→Cold→Frozen→Delete lifecycle policies for L3 and L4, plus asset inventory retention' },
    { label: 'Ingest Pipelines', count: 3, desc: 'Log integrity hash (SHA-256), osquery normalization, alert category enrichment' },
    { label: 'ML Job Definitions', count: 6, desc: 'Anomaly detection jobs + datafeeds for behavioral baselines and UBA/UEBA' },
    { label: 'Fleet Packs', count: 1, desc: 'Osquery pack for hardware, software, and network asset inventory' },
  ]
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted leading-relaxed">
        Elastic-built compliance pack assets for M-26-14. See{' '}
        <Link to="/asset-inventory" className="text-accent-teal hover:underline">
          Asset inventory
        </Link>{' '}
        for download and deployment instructions.
      </p>
      <div className="space-y-2">
        {assetCategories.map((a) => (
          <div key={a.label} className="rounded-lg border border-line bg-ink-700 p-3 flex gap-3">
            <div className="shrink-0 w-8 text-right">
              <span className="text-xl font-bold text-accent-teal">{a.count}</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{a.label}</h4>
              <p className="text-xs text-text-muted leading-relaxed">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
