import React from 'react'
import { Link } from 'react-router-dom'
import { EuiToolTip } from '@elastic/eui'
import { LEVELS } from '../data/levels.js'

export default function Overview() {
  return (
    <main className="mx-auto max-w-[1800px] px-8 py-10 space-y-8">

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
          <div className="rounded-lg border border-accent-purple/40 bg-ink-800 p-7" style={{ borderStyle: 'solid' }}>
            <p className="text-lg font-semibold text-accent-purple mb-2">CEM — Continuous Event Monitoring</p>
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

      {/* Requirements summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-line bg-ink-800 p-6 flex flex-col gap-4" style={{ borderStyle: 'solid' }}>
          <p className="text-base font-semibold text-text-primary">Data Collection &amp; Retention</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Agencies must collect logs from all 11 Appendix B event categories — identity, network sessions, object access,
            privilege changes, infrastructure changes, security tool alerts, IoC events, automated alerts, anomalous activity,
            error/crash events, and DNS. Every applicable system must be enrolled; coverage gaps are a compliance deficiency.
            Retention windows escalate with each level:
          </p>
          <ul className="text-sm text-text-primary space-y-2">
            <li className="flex gap-2"><span className="font-semibold text-accent-teal shrink-0">L1:</span><span>6 months retrievable (THIRF). All Appendix B sources enrolled via Fleet. Agency Logging Plan submitted within 90 days of LRA.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-blue shrink-0">L2:</span><span>12 months retrievable. Cold-tier frozen storage active. Full asset inventory maintained in Fleet enrollment records.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-purple shrink-0">L3:</span><span>≥ 3 months searchable (CEM) + ≥ 12 months retrievable (THIRF). PII redaction enforced at ingest. Full tiered ILM lifecycle (hot/warm/cold/frozen).</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-coral shrink-0">L4:</span><span>≥ 6 months searchable (CEM) + ≥ 12 months retrievable (THIRF). BYOK encryption at rest. Federated cross-cluster archival. Tamper-evident SHA-256 fingerprints with USNO-traceable timestamps.</span></li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-ink-800 p-6 flex flex-col gap-4" style={{ borderStyle: 'solid' }}>
          <p className="text-base font-semibold text-text-primary">Analytics &amp; Detection</p>
          <p className="text-sm text-text-muted leading-relaxed">
            M-26-14 requires active, automated detection — not just log collection. Each level adds a new detection
            capability tier, culminating in ML-driven behavioral analysis and real-time IoC matching at L3. Agencies
            must demonstrate detection coverage across every Appendix B category to achieve ATO attestation.
          </p>
          <ul className="text-sm text-text-primary space-y-2">
            <li className="flex gap-2"><span className="font-semibold text-accent-teal shrink-0">L1:</span><span>Baseline SIEM rules across all 11 Appendix B categories (A–K). Detection rule deployment documented in the Agency Logging Plan.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-blue shrink-0">L2:</span><span>Behavioral correlation rules added. IoC matching against STIX/TAXII and CISA KEV feeds. Alert deduplication and suppression tuning required.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-purple shrink-0">L3:</span><span>ML anomaly detection running against 6-month behavioral baselines. UEBA for user and host risk scoring. Automated triage via risk-score transforms. ATO evidence dashboard active.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-coral shrink-0">L4:</span><span>Predictive threat analytics. Cross-agency indicator sharing via ISAC feeds. Annually tested CISA/FBI log sharing drill with documented runbook.</span></li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-ink-800 p-6 flex flex-col gap-4" style={{ borderStyle: 'solid' }}>
          <p className="text-base font-semibold text-text-primary">Searchability, Retrievability &amp; Shareability</p>
          <p className="text-sm text-text-muted leading-relaxed">
            M-26-14 distinguishes between two access modes: CEM (Continuous Event Monitoring) requires logs to be
            immediately searchable with no retrieval step. THIRF (Threat Hunting, Investigation, Response &amp; Forensics)
            allows retrieval from cold/frozen storage within a defined SLA window. Both must be evidenced for ATO.
          </p>
          <ul className="text-sm text-text-primary space-y-2">
            <li className="flex gap-2"><span className="font-semibold text-accent-purple shrink-0">CEM:</span><span>Hot-tier logs queryable within seconds from Kibana. No retrieval step, no SLA delay. Required for real-time SOC operations and alert correlation.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-coral shrink-0">THIRF:</span><span>Cold/frozen logs retrievable from S3-compatible object storage. SLA window defined by level (hours at L3, tighter at L4). Supports forensic timelines and incident investigations.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-purple shrink-0">L3+:</span><span>Cross-Cluster Search enables a single Kibana to query across distributed agency log stores without data replication. Required for multi-enclave environments.</span></li>
            <li className="flex gap-2"><span className="font-semibold text-accent-coral shrink-0">L4:</span><span>Federated architecture with exportable dashboards, PDF-ready ATO evidence reports, and a documented on-demand log production procedure for CISA and FBI requests.</span></li>
          </ul>
        </div>
      </section>

    </main>
  )
}

const LEVEL_BADGE_COLOR = {
  1: { badge: 'text-accent-teal',  hover: 'hover:border-accent-teal  hover:bg-accent-teal/10  hover:ring-2 hover:ring-accent-teal/30'  },
  2: { badge: 'text-accent-blue',  hover: 'hover:border-accent-blue  hover:bg-accent-blue/10  hover:ring-2 hover:ring-accent-blue/30'  },
  3: { badge: 'text-accent-purple',   hover: 'hover:border-accent-purple   hover:bg-accent-purple/10   hover:ring-2 hover:ring-accent-purple/30'   },
  4: { badge: 'text-accent-coral', hover: 'hover:border-accent-coral hover:bg-accent-coral/10 hover:ring-2 hover:ring-accent-coral/30' },
}

function LevelCard({ level }) {
  const lc = LEVEL_BADGE_COLOR[level.id]
  return (
    <Link
      to={`/maturity/small/${level.id}`}
      className={`flex flex-col rounded-lg border border-line bg-ink-800 p-5 transition-all ${lc.hover}`}
      style={{ borderStyle: 'solid' }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{level.name}</h3>
        <span className={`text-xs font-semibold ${lc.badge}`}>L{level.id}</span>
      </div>
      <p className="mt-1 text-sm text-text-muted">Due: {level.deadline}</p>

      <dl className="mt-4 space-y-2 text-base">
        <Row
          label="Searchable"
          tooltip="Immediately accessible with no additional retrieval step (CEM)"
          value={level.searchable ?? '— not required'}
          valueColor={level.searchable ? 'text-accent-purple' : null}
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


const MARKER_STYLES = {
  'accent-teal':   { bar: 'bg-accent-teal',   text: 'text-accent-teal'   },
  'accent-blue':   { bar: 'bg-accent-blue',   text: 'text-accent-blue'   },
  'pink':          { bar: 'bg-accent-purple',     text: 'text-accent-purple'    },
  'accent-coral':  { bar: 'bg-accent-coral',  text: 'text-accent-coral'  },
  'gray':          { bar: 'bg-text-muted/60', text: 'text-text-muted'    },
}

function Timeline() {
  // Fixed visual positions for even spacing; day labels retain accuracy
  const markers = [
    { pct: 14, label: 'Submit Logging Plan', detail: '90 days',  color: 'gray'        },
    { pct: 30, label: 'L1',                  detail: '120 days', color: 'accent-teal'  },
    { pct: 50, label: 'L2',                  detail: '180 days', color: 'accent-blue'  },
    { pct: 76, label: 'L3',                  detail: '320 days', color: 'pink'         },
    { pct: 90, label: 'L4',                  detail: 'ongoing',  color: 'accent-coral' },
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
        className="absolute top-0 h-1 rounded-r-full bg-gradient-to-r from-accent-coral/15 to-accent-coral/70"
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
