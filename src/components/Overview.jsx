import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EuiToolTip } from '@elastic/eui'
import { LEVELS } from '../data/levels.js'
import { sizingTable, SIZE_ORDER } from '../data/sizing.js'

export default function Overview() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-8">

      {/* Title + program description + CEM/THIRF definitions */}
      <section>
        <h1 className="text-3xl font-semibold text-text-primary">
          OMB M-26-14 Logging Maturity Model Overview
        </h1>
        <p className="mt-6 text-base text-text-muted leading-relaxed">
          OMB Memorandum M-26-14 (May 22, 2026) establishes a four-level Logging Maturity Model
          for federal agencies and requires Elasticsearch-based logging architectures aligned
          with two core objectives:
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-accent-yellow/40 bg-ink-800 p-7" style={{ borderStyle: 'solid' }}>
            <p className="text-lg font-semibold text-accent-yellow mb-2">CEM — Continuous Event Monitoring</p>
            <p className="text-base text-text-primary leading-relaxed mb-3">
              CEM requires agencies to maintain continuous, real-time visibility into network and system
              activity across all Appendix B log categories — enabling active threat detection, timely
              alerting, and compliance reporting as events occur.
            </p>
          </div>
          <div className="rounded-lg border border-accent-coral/40 bg-ink-800 p-7" style={{ borderStyle: 'solid' }}>
            <p className="text-lg font-semibold text-accent-coral mb-2">THIRF — Threat Hunting, Investigation, Response &amp; Forensics</p>
            <p className="text-base text-text-primary leading-relaxed">
              THIRF requires agencies to preserve sufficient log history to support after-the-fact
              security operations — investigating incidents, hunting for advanced persistent threats,
              and conducting forensic analysis in response to a breach or audit.
            </p>
          </div>
        </div>
      </section>

      {/* Maturity Timeline */}
      <section className="rounded-lg border border-line bg-ink-800 pt-6 px-6 pb-2" style={{ borderStyle: 'solid' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">
          Maturity Timeline
        </h2>
        <Timeline />
      </section>

      {/* 4 Level cards — link to /level/:id/small */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEVELS.map((lvl) => (
          <LevelCard key={lvl.id} level={lvl} />
        ))}
      </section>

      {/* Organization Size Tiers — rows link to /maturity/:size/1 */}
      <section className="rounded-lg border border-line bg-ink-800 p-6" style={{ borderStyle: 'solid' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-2">
          Organization Size Tiers
        </h2>
        <p className="text-sm text-text-muted mb-4 leading-relaxed">
          Each maturity level scales across three size tiers — Small, Medium, and Large — keyed
          to daily ingest volume. The hot/cold/frozen node counts and S3 footprint below come
          from Elastic's reference deployment sizing table. Select a tier to explore the full
          architecture by level.
        </p>
        <SizingTable />
        <p className="mt-3 text-sm text-text-muted italic">
          Organizations ingesting &gt; 25 TB/day (e.g., CISA, VA) should treat the Large tier as a
          starting point and engage Elastic Professional Services for custom sizing.
        </p>
      </section>

    </main>
  )
}

function LevelCard({ level }) {
  return (
    <Link
      to={`/maturity/small/${level.id}`}
      className="flex flex-col rounded-lg border border-line bg-ink-800 p-5 hover:border-accent-teal hover:bg-accent-teal/10 hover:ring-2 hover:ring-accent-teal/30 transition-all"
      style={{ borderStyle: 'solid' }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{level.name}</h3>
        <span className="text-xs font-semibold text-accent-teal">L{level.id}</span>
      </div>
      <p className="mt-1 text-sm text-text-muted">Due: {level.deadline}</p>

      <dl className="mt-4 space-y-2 text-base">
        <Row
          label="Searchable"
          tooltip="Immediately accessible with no additional retrieval step (CEM)"
          value={level.searchable ?? '— not required'}
          valueColor={level.searchable ? 'text-accent-yellow' : null}
        />
        <Row
          label="Retrievable"
          tooltip="Accessible from storage within a reasonable timeframe (THIRF)"
          value={level.retrievable}
          valueColor="text-accent-coral"
        />
      </dl>

      <p className="mt-4 text-sm text-text-muted leading-relaxed flex-1">{level.summary}</p>

      <span className="mt-4 inline-flex items-center text-sm text-accent-teal">
        View architecture →
      </span>
    </Link>
  )
}

function Row({ label, tooltip, value, valueColor }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0">
        <EuiToolTip content={tooltip} position="top">
          <span className="text-text-muted underline decoration-dotted decoration-text-muted/40 cursor-help">
            {label}
          </span>
        </EuiToolTip>
      </dt>
      <dd className={valueColor ? `${valueColor} font-medium text-right` : 'text-text-muted italic text-right'}>{value}</dd>
    </div>
  )
}

function SizingTable() {
  const navigate = useNavigate()
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base border-collapse">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-text-muted">
            <th className="border-b border-line py-2 pr-4 pl-4">Size</th>
            <th className="border-b border-line py-2 pr-4">Daily ingest</th>
            <th className="border-b border-line py-2 pr-4">Hot nodes</th>
            <th className="border-b border-line py-2 pr-4">
              Cold nodes{' '}
              <span className="text-xs normal-case italic text-text-muted">(L3 / L4)</span>
            </th>
            <th className="border-b border-line py-2 pr-4">Frozen nodes</th>
            <th className="border-b border-line py-2">S3 stored</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_ORDER.map((key) => {
            const s = sizingTable[key]
            return (
              <tr
                key={key}
                onClick={() => navigate(`/maturity/${key}/1`)}
                className="text-text-primary hover:bg-accent-blue/10 transition-colors cursor-pointer"
              >
                <td className="border-b border-line/60 py-4 pr-4 pl-4 font-semibold text-accent-blue">{s.label}</td>
                <td className="border-b border-line/60 py-4 pr-4">{s.ingestRange}</td>
                <td className="border-b border-line/60 py-4 pr-4">{s.hotNodes}</td>
                <td className="border-b border-line/60 py-4 pr-4">{s.coldNodes}</td>
                <td className="border-b border-line/60 py-4 pr-4">{s.frozenNodes}</td>
                <td className="border-b border-line/60 py-4">{s.s3StoredTB.toLocaleString()} TB</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const MARKER_STYLES = {
  'accent-purple': { bar: 'bg-accent-purple', text: 'text-accent-purple' },
  'accent-teal':   { bar: 'bg-accent-teal',   text: 'text-accent-teal'   },
  'accent-coral':  { bar: 'bg-accent-coral',  text: 'text-accent-coral'  },
}

function Timeline() {
  // Fixed visual positions for even spacing; day labels retain accuracy
  const markers = [
    { pct: 14, label: 'Submit Logging Plan', detail: '90 days',  color: 'accent-purple' },
    { pct: 30, label: 'L1',                  detail: '120 days', color: 'accent-teal'   },
    { pct: 50, label: 'L2',                  detail: '180 days', color: 'accent-teal'   },
    { pct: 76, label: 'L3',                  detail: '320 days', color: 'accent-teal'   },
    { pct: 90, label: 'L4',                  detail: 'ongoing',  color: 'accent-coral'  },
  ]
  return (
    <div className="relative pt-2 pb-10">
      <div className="h-1 w-full rounded-full bg-line" />
      <div className="absolute right-0 -top-3 text-xs text-text-muted">
        <span>≈ 1 year+</span>
      </div>

      {/* LRA publication — double chevron, coral, point centered on bar */}
      <div className="absolute" style={{ left: 0, top: 0 }}>
        <svg className="text-accent-coral" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '1px' }}>
          <polyline points="4,4 10,10 4,16"/>
          <polyline points="10,4 16,10 10,16"/>
        </svg>
        <div className="mt-1 text-center">
          <p className="text-xs text-text-muted whitespace-nowrap">LRA publication</p>
        </div>
      </div>

      {/* Coral urgency bar starts at L3 position */}
      <div
        className="absolute top-0 h-1 rounded-r-full bg-gradient-to-r from-accent-coral/60 to-accent-coral/20"
        style={{ left: '76%', right: 0 }}
      />

      {markers.map((m) => {
        const s = MARKER_STYLES[m.color]
        return (
          <div key={m.pct} className="absolute" style={{ left: `${m.pct}%`, top: 0 }}>
            <div className={`h-4 w-px ${s.bar}`} />
            <div className="mt-1 -translate-x-1/2 text-center">
              <p className={`text-xs font-semibold ${s.text} whitespace-nowrap`}>{m.label}</p>
              <p className="text-xs text-text-muted whitespace-nowrap">{m.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
