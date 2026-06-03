import React from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'

export default function Overview() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-text-primary">OMB M-26-14 Logging Maturity Model</h1>
        <p className="mt-3 max-w-3xl text-sm text-text-muted leading-relaxed">
          OMB Memorandum M-26-14 (May 22, 2026) establishes a four-level Logging Maturity Model
          for federal agencies and requires Elasticsearch-based logging architectures aligned
          with two objectives:
        </p>
        <ul className="mt-3 max-w-3xl space-y-1.5 text-sm text-text-primary">
          <li>
            <span className="text-accent-green font-semibold">CEM</span> — Continuous Event
            Monitoring. Real-time, <em>searchable</em> data. <span className="text-text-muted">"Searchable" = immediately usable, no prep steps.</span>
          </li>
          <li>
            <span className="text-accent-blue font-semibold">THIRF</span> — Threat Hunting,
            Investigation, Response &amp; Forensics. <em>Retrievable</em> data; may require thawing
            from cold storage. <span className="text-text-muted">"Retrievable" = usable after intermediary steps.</span>
          </li>
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEVELS.map((lvl) => (
          <LevelCard key={lvl.id} level={lvl} />
        ))}
      </section>

      <section className="rounded-lg border border-line bg-ink-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Deadline Timeline
        </h2>
        <Timeline />
      </section>

      <section className="rounded-lg border border-line bg-ink-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Key architectural decisions
        </h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-text-primary max-w-4xl">
          <li>
            L1/L2 use MINIMAL hot (1 day) + frozen (1 day cache) to minimize cost — no cold tier
            needed because searchable is <strong>not</strong> required.
          </li>
          <li>Snapshot repos are UNMOUNTED — zero Elasticsearch overhead until thawed.</li>
          <li>
            Thaw path: unmounted snapshot → frozen tier (searchable snapshot mount) → analyst can
            query.
          </li>
          <li>
            L3 adds the cold tier (7 days) and treats frozen as searchable via mounted searchable
            snapshots to satisfy the "searchable ≥ 6 months" CEM requirement.
          </li>
          <li>
            L4 adds federated search so distributed agencies don't replicate everything to a
            central SIEM.
          </li>
          <li>
            CISA/FBI access path must be pre-defined in the Agency Logging Plan, not figured out
            during an incident.
          </li>
          <li>
            Sensitive-data masking (PII, field-level redaction) happens in the pipeline BEFORE
            storage.
          </li>
        </ol>
      </section>
    </main>
  )
}

function LevelCard({ level }) {
  return (
    <Link
      to={`/level/${level.id}`}
      className="block rounded-lg border border-line bg-ink-800 p-5 hover:border-accent-teal/60 hover:bg-ink-700/60 transition-colors"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{level.name}</h3>
        <span className="text-[11px] font-semibold text-accent-teal">L{level.id}</span>
      </div>
      <p className="mt-1 text-xs text-text-muted">Due: {level.deadline}</p>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Searchable" value={level.searchable ?? '— not required'} dim={!level.searchable} />
        <Row label="Retrievable" value={level.retrievable} />
      </dl>

      <p className="mt-4 text-xs text-text-muted leading-relaxed line-clamp-5">{level.summary}</p>

      <span className="mt-4 inline-flex items-center text-xs text-accent-teal">
        View architecture →
      </span>
    </Link>
  )
}

function Row({ label, value, dim }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className={dim ? 'text-text-muted italic' : 'text-text-primary font-medium'}>{value}</dd>
    </div>
  )
}

function Timeline() {
  // Position markers proportionally to days. Total horizon = 400 days so the
  // L3 marker at 320d sits at 80% and L4 ("ongoing") anchors the right edge.
  const HORIZON = 400
  const fixedLabels = [
    { id: 1, days: 120, label: 'L1', detail: '120 days' },
    { id: 2, days: 180, label: 'L2', detail: '180 days' },
    { id: 3, days: 320, label: 'L3', detail: '320 days' },
  ]
  return (
    <div className="relative pt-2 pb-14">
      <div className="h-1 w-full rounded-full bg-line" />
      {/* axis tick labels */}
      <div className="absolute left-0 right-0 -top-3 text-[10px] text-text-muted">
        <span className="absolute left-0">LRA publication</span>
        <span className="absolute right-0">≈ 1 year+</span>
      </div>
      {fixedLabels.map((l) => (
        <div key={l.id} className="absolute" style={{ left: `${(l.days / HORIZON) * 100}%`, top: 0 }}>
          <div className="h-4 w-px bg-accent-teal mx-auto" />
          <div className="mt-1 -translate-x-1/2 text-center">
            <p className="text-xs font-semibold text-accent-teal">{l.label}</p>
            <p className="text-[11px] text-text-muted whitespace-nowrap">{l.detail}</p>
          </div>
        </div>
      ))}
      {/* L4: ongoing — shown as a hatched band extending past L3 */}
      <div
        className="absolute top-0 h-1 rounded-r-full bg-gradient-to-r from-accent-coral/60 to-accent-coral/20"
        style={{ left: `${(320 / HORIZON) * 100}%`, right: 0 }}
      />
      <div
        className="absolute"
        style={{ left: `${(360 / HORIZON) * 100}%`, top: 0 }}
      >
        <div className="h-4 w-px bg-accent-coral mx-auto" />
        <div className="mt-1 -translate-x-1/2 text-center">
          <p className="text-xs font-semibold text-accent-coral">L4</p>
          <p className="text-[11px] text-text-muted whitespace-nowrap">ongoing</p>
        </div>
      </div>
    </div>
  )
}
