// Counts are for Readiness Pack 0.3.0, from the pack's generated
// docs/asset-inventory.md; re-key at each release.
import React from 'react'
import { Link } from 'react-router-dom'
import { LIVE_KIBANA_BASE } from '../data/liveLinks.js'

const PACK_VERSION = '0.3.0'

const COUNTS = [
  { n: 37, label: 'Index templates' },
  { n: 47, label: 'Ingest pipelines' },
  { n: 18, label: 'Transforms' },
  { n: 13, label: 'Enrich policies' },
  { n: 13, label: 'ILM policies' },
  { n: 6,  label: 'Watchers' },
  { n: 1,  label: 'SLM policy' },
  { n: 6,  label: 'Security roles' },
  { n: 8,  label: 'ML jobs' },
  { n: 21, label: 'Dashboards' },
  { n: 58, label: 'Detection and ML rules' },
  { n: 9,  label: 'Index patterns' },
  { n: 1,  label: 'Osquery pack' },
  { n: 3,  label: 'AI agents' },
  { n: 4,  label: 'Agent tools' },
  { n: 14, label: 'Workflows' },
]

// App-level landing pages in the read-only demo Kibana. Object ids are
// generated at install time, so every link points at the app, not an object.
const APPS = {
  dashboards: { path: '/app/dashboards',                  label: 'Dashboards' },
  rules:      { path: '/app/security/rules/management',   label: 'Detection rules' },
  ml:         { path: '/app/ml/jobs',                     label: 'ML jobs' },
  transforms: { path: '/app/management/data/transform',   label: 'Transforms' },
  workflows:  { path: '/app/workflows',                   label: 'Workflows' },
  osquery:    { path: '/app/osquery/packs',               label: 'Osquery packs' },
  agents:     { path: '/app/agent_builder/agents',        label: 'Agent Builder' },
}

const CAPABILITIES = [
  {
    id: 'coverage',
    title: 'Coverage and fidelity',
    body: [
      'The pack measures which Appendix B log categories are actually arriving from which systems, and scores each category against the sources in scope rather than against a list of installed integrations.',
      'Fidelity checks run alongside coverage, so a category that is arriving but arriving thin, malformed or schema-drifted is reported as a gap instead of a pass.',
    ],
    app: 'dashboards',
    shot: { src: '/screenshots/06-appendix-b-coverage.png', alt: 'Appendix B coverage dashboard' },
  },
  {
    id: 'timeliness',
    title: 'Timeliness (ingest latency)',
    body: [
      'Every pack data stream carries the gap between when an event happened and when it became searchable, broken out by dataset and by collection path.',
      'The ingestion-rate ML job learns each dataset’s normal delivery shape and flags the datasets that slow down or stop, which is the failure mode that quietly breaks an attestation.',
    ],
    app: 'ml',
    shot: { src: '/screenshots/05-log-management.png', alt: 'Log management dashboard' },
  },
  {
    id: 'failure-handling',
    title: 'Failure handling (failure store and pipeline health)',
    body: [
      'Rejected documents are kept, not dropped: each pack data stream has its failure store enabled, so a document that fails a pipeline lands in the failure store with the pipeline name, the failing step and the error.',
      'Pipeline health counts those failures and a spike rule alerts on a burst, so a silent mapping conflict surfaces as an alert rather than as missing evidence months later.',
    ],
    app: 'dashboards',
  },
  {
    id: 'canary',
    title: 'Canary validation',
    body: [
      'Synthetic probe documents are written through the same pipelines and data streams as production traffic, then read back to confirm the path is intact end to end.',
      'A canary that fails to land, or lands with the wrong shape, proves the break before an auditor or an incident does.',
    ],
    app: 'workflows',
  },
  {
    id: 'policy',
    title: 'Policy enforcement (redact, minimize, tag, route)',
    body: [
      'Ingest-time policy redacts sensitive values, minimizes fields that do not need to be retained, tags events with their Appendix B category and routes them to the right data stream.',
      'Exceptions are managed rather than ad hoc: each one is recorded with an owner and a scope, so the set of things the agency chose not to collect is itself auditable.',
    ],
    app: 'workflows',
  },
  {
    id: 'authorized-production',
    title: 'Authorized production',
    body: [
      'The pack compares the software and services actually producing logs against the agency’s authorized inventory, so an unapproved producer is visible as a finding.',
      'Osquery collection keeps that inventory current from the endpoint rather than from a spreadsheet.',
    ],
    app: 'osquery',
    shot: { src: '/screenshots/11-swam-software.png', alt: 'Software inventory dashboard' },
  },
  {
    id: 'retrieval-drill',
    title: 'Retrieval drill',
    body: [
      'M-26-14 requires that retained logs can be produced on request, not merely that they were stored. The pack runs the retrieval as a drill: restore from the frozen or snapshot tier, query it, and record how long it took.',
      'The drill result is written as evidence, so the agency can show a tested recovery time instead of a retention policy document.',
    ],
    app: 'workflows',
    shot: { src: '/screenshots/04-retention-compliance.png', alt: 'Retention readiness dashboard' },
  },
  {
    id: 'attack-coverage',
    title: 'ATT&CK coverage',
    body: [
      'Every pack detection rule carries its MITRE ATT&CK tactic and technique, so coverage can be read as a technique map rather than as a rule count.',
      'The map shows which techniques are covered by a rule, which are covered only by an ML job, and which are not covered at all given the log sources currently arriving.',
    ],
    app: 'rules',
    shot: { src: '/screenshots/03-alert-coverage.png', alt: 'Alert coverage dashboard' },
  },
  {
    id: 'zero-trust',
    title: 'Zero Trust context',
    body: [
      'Transforms and enrich policies attach identity, device and network-segment context to events at ingest, so a log line carries the subject and the asset it belongs to.',
      'That context is what lets a Zero Trust question be answered from the log estate: who acted, from which device, on which segment, against which resource.',
    ],
    app: 'transforms',
    shot: { src: '/screenshots/02-asset-coverage.png', alt: 'Asset coverage dashboard' },
  },
  {
    id: 'hva',
    title: 'High-value asset uplift',
    body: [
      'Assets marked high value are held to a stricter standard: more categories required, longer retention, tighter timeliness.',
      'The hardware asset views separate the high-value estate from the rest, so an uplift gap is not averaged away by a large, healthy general population.',
    ],
    app: 'dashboards',
    shot: { src: '/screenshots/08-hwam-overview.png', alt: 'Hardware asset management overview' },
  },
  {
    id: 'cost',
    title: 'Cost visibility',
    body: [
      'Volume and storage are reported per dataset and per tier, so the cost of a retention decision is visible before it is made.',
      'That lets minimization and tiering be argued with numbers, which is usually what unblocks a longer retention period on the categories that matter.',
    ],
    app: 'dashboards',
  },
  {
    id: 'time-sync',
    title: 'Time sync (NTP attestation)',
    body: [
      'Log timestamps are only evidence if the clocks behind them agree. The pack collects time-synchronization state from hosts and reports the ones that are unsynchronized or drifting.',
      'An NTP attestation gives the agency a defensible answer to the question an auditor asks about correlated timelines across systems.',
    ],
    app: 'osquery',
  },
  {
    id: 'ai-audit',
    title: 'AI audit (Agent Builder traces)',
    body: [
      'The pack ships AI agents that answer readiness questions from live data, including a Plan of Action and Milestones drafting agent that reads the same indices as the dashboards.',
      'Agent Builder traces record what each agent was asked, which tools it called and what it returned, so AI-assisted work carries its own audit trail.',
    ],
    app: 'agents',
    shot: { src: '/screenshots/07-compliance-attestation.png', alt: 'Readiness attestation dashboard' },
  },
]

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M6.5 3.5H3.8A1.3 1.3 0 002.5 4.8v7.4a1.3 1.3 0 001.3 1.3h7.4a1.3 1.3 0 001.3-1.3V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9.5 2.5h4v4M13.2 2.8L7.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SeeItLive({ app }) {
  const target = APPS[app]
  if (!target) return null
  return (
    <a
      href={`${LIVE_KIBANA_BASE}${target.path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-accent-blue/50 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors"
      style={{ borderStyle: 'solid' }}
    >
      <ExternalIcon />
      See it live: {target.label}
    </a>
  )
}

function Shot({ shot }) {
  if (!shot) return null
  return (
    <figure className="mt-5">
      <img
        src={shot.src}
        alt={shot.alt}
        loading="lazy"
        className="w-full rounded-lg border border-line/40 shadow-lg"
      />
      <figcaption className="mt-2 text-xs text-text-muted/70">{shot.alt}</figcaption>
    </figure>
  )
}

export default function Capabilities() {
  return (
    <main className="mx-auto max-w-5xl px-8 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-text-primary">
          M-26-14 Readiness Pack capabilities
        </h1>
        <p className="mt-4 text-base text-text-muted leading-relaxed">
          What the Readiness Pack does once it is installed, capability by capability. Each section
          links to the app in the read-only demo cluster where that capability is visible against
          live data. For a guided tour of the same cluster, use the{' '}
          <Link to="/demo-guide" className="text-accent-teal hover:underline">self-guided walkthrough</Link>.
        </p>
        <p className="mt-3 text-sm text-text-muted leading-relaxed">
          The Readiness Pack installs from its release package; ask your Elastic account team for the
          current release.
        </p>
      </header>

      {/* Counts strip */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold uppercase tracking-widest text-text-primary">
            What installs
          </h2>
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-text-muted">Readiness Pack {PACK_VERSION}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {COUNTS.map(c => (
            <div
              key={c.label}
              className="rounded-lg border border-line bg-ink-800 px-3 py-3"
              style={{ borderStyle: 'solid' }}
            >
              <p className="text-xl font-semibold text-accent-teal leading-none">{c.n}</p>
              <p className="mt-1.5 text-[11px] text-text-muted leading-snug">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      <figure>
        <img
          src="/screenshots/01-maturity-overview.png"
          alt="M-26-14 maturity overview dashboard"
          loading="lazy"
          className="w-full rounded-lg border border-line/40 shadow-lg"
        />
        <figcaption className="mt-2 text-xs text-text-muted/70">
          M-26-14 maturity overview dashboard
        </figcaption>
      </figure>

      {/* Capability sections */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold uppercase tracking-widest text-text-primary">
            Capabilities
          </h2>
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-text-muted">{CAPABILITIES.length} capabilities</span>
        </div>

        {CAPABILITIES.map(cap => (
          <article
            key={cap.id}
            id={cap.id}
            className="rounded-lg border border-line bg-ink-800 px-7 py-6"
            style={{ borderStyle: 'solid' }}
          >
            <h3 className="text-lg font-semibold text-text-primary">{cap.title}</h3>
            {cap.body.map((para, i) => (
              <p key={i} className="mt-3 text-sm text-text-primary leading-relaxed">{para}</p>
            ))}
            <div className="mt-5">
              <SeeItLive app={cap.app} />
            </div>
            <Shot shot={cap.shot} />
          </article>
        ))}
      </section>
    </main>
  )
}
