import React from 'react'
import { Link } from 'react-router-dom'
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
          <div className="rounded-lg border border-accent-teal/40 bg-ink-800 p-5">
            <p className="text-base font-semibold text-accent-teal mb-1">CEM — Continuous Event Monitoring</p>
            <p className="text-sm text-text-primary leading-relaxed">
              Real-time, <em>searchable</em> data. Immediately usable — no thaw or mount step required.
            </p>
          </div>
          <div className="rounded-lg border border-accent-blue/40 bg-ink-800 p-5">
            <p className="text-base font-semibold text-accent-blue mb-1">THIRF — Threat Hunting, Investigation, Response &amp; Forensics</p>
            <p className="text-sm text-text-primary leading-relaxed">
              <em>Retrievable</em> data; may require intermediate steps (e.g., mounting an unmounted
              snapshot) before it is queryable.
            </p>
          </div>
        </div>
      </section>

      {/* Maturity Timeline */}
      <section className="rounded-lg border border-line bg-ink-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
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
      <section className="rounded-lg border border-line bg-ink-800 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2">
          Organization Size Tiers
        </h2>
        <p className="text-xs text-text-muted mb-4 max-w-3xl leading-relaxed">
          Each maturity level scales across three size tiers — Small, Medium, and Large — keyed
          to daily ingest volume. The hot/cold/frozen node counts and S3 footprint below come
          from Elastic's reference deployment sizing table. Select a tier to explore the full
          architecture by level.
        </p>
        <SizingTable />
        <p className="mt-3 text-xs text-text-muted italic">
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
      className="block rounded-lg border border-line bg-ink-800 p-5 hover:border-accent-teal/60 hover:bg-ink-700/60 transition-colors"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{level.name}</h3>
        <span className="text-xs font-semibold text-accent-teal">L{level.id}</span>
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

function SizingTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-text-muted">
            <th className="border-b border-line py-2 pr-4">Size</th>
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
                className="text-text-primary hover:bg-ink-700/40 transition-colors group"
              >
                <td className="border-b border-line/60 py-2.5 pr-4">
                  <Link
                    to={`/maturity/${key}/1`}
                    className="font-semibold text-accent-teal hover:underline"
                  >
                    {s.label}
                  </Link>
                </td>
                <td className="border-b border-line/60 py-2.5 pr-4">{s.ingestRange}</td>
                <td className="border-b border-line/60 py-2.5 pr-4">{s.hotNodes}</td>
                <td className="border-b border-line/60 py-2.5 pr-4">{s.coldNodes}</td>
                <td className="border-b border-line/60 py-2.5 pr-4">{s.frozenNodes}</td>
                <td className="border-b border-line/60 py-2.5">{s.s3StoredTB.toLocaleString()} TB</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Timeline() {
  const HORIZON = 400
  const fixedLabels = [
    { id: 1, days: 120, label: 'L1', detail: '120 days' },
    { id: 2, days: 180, label: 'L2', detail: '180 days' },
    { id: 3, days: 320, label: 'L3', detail: '320 days' },
  ]
  return (
    <div className="relative pt-2 pb-14">
      <div className="h-1 w-full rounded-full bg-line" />
      <div className="absolute left-0 right-0 -top-3 text-xs text-text-muted">
        <span className="absolute left-0">LRA publication</span>
        <span className="absolute right-0">≈ 1 year+</span>
      </div>
      {fixedLabels.map((l) => (
        <div key={l.id} className="absolute" style={{ left: `${(l.days / HORIZON) * 100}%`, top: 0 }}>
          <div className="h-4 w-px bg-accent-teal mx-auto" />
          <div className="mt-1 -translate-x-1/2 text-center">
            <p className="text-xs font-semibold text-accent-teal">{l.label}</p>
            <p className="text-xs text-text-muted whitespace-nowrap">{l.detail}</p>
          </div>
        </div>
      ))}
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
          <p className="text-xs text-text-muted whitespace-nowrap">ongoing</p>
        </div>
      </div>
    </div>
  )
}
