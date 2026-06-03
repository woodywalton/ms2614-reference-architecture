// Horizontal retention timeline bar shown beneath each diagram.
// Communicates two things: tier durations (relative width) and which window
// satisfies M-26-14 "searchable" vs "retrievable".

import React from 'react'

const TIMELINES = {
  1: {
    note: 'Level 1 has no searchable requirement. Hot + frozen are intentionally tiny to minimize cost; the 6-month snapshot repo carries the retrievable obligation.',
    segments: [
      { label: 'Hot ~1 day',            days: 1,   color: '#0077CC', kind: null },
      { label: 'Frozen ~1 day (cache)', days: 1,   color: '#6E7681', kind: 'retrievable' },
      { label: 'Snapshot 6-mo (unmounted)', days: 180, color: '#7B5EA7', kind: 'retrievable' },
    ],
    bands: [
      { label: 'Retrievable ≥ 6 months', from: 1, to: 182, color: '#7BB7F5' },
    ],
  },
  2: {
    note: 'Same shape as Level 1 with both snapshot repos as standard. Still no searchable requirement.',
    segments: [
      { label: 'Hot ~1 day',            days: 1,   color: '#0077CC', kind: null },
      { label: 'Frozen ~1 day (cache)', days: 1,   color: '#6E7681', kind: 'retrievable' },
      { label: 'Snapshot 6-mo',         days: 180, color: '#7B5EA7', kind: 'retrievable' },
      { label: 'Snapshot 12-mo',        days: 180, color: '#7B5EA7', kind: 'retrievable' },
    ],
    bands: [
      { label: 'Retrievable ≥ 12 months', from: 1, to: 362, color: '#7BB7F5' },
    ],
  },
  3: {
    note: 'Hot tier carries the freshest 3 days on SSD; cold extends to 10 days. Frozen via mounted searchable snapshots covers the rest of the searchable window out to 12 months without keeping data on SSD.',
    segments: [
      { label: 'Hot 3 days',           days: 3,   color: '#0077CC', kind: 'searchable' },
      { label: 'Cold 7 days',          days: 7,   color: '#2EA043', kind: 'searchable' },
      { label: 'Frozen → 12 months',   days: 355, color: '#6E7681', kind: 'searchable' },
    ],
    bands: [
      { label: 'Searchable ≥ 6 months (CEM)',     from: 0,  to: 187, color: '#7EE39A' },
      { label: 'Retrievable ≥ 12 months (THIRF)', from: 0,  to: 365, color: '#7BB7F5' },
    ],
  },
  4: {
    note: 'Same hot 3d / cold 7d / frozen 12mo envelope as Level 3, but distributed across federated clusters and reachable via CCS. Pre-storage ingest pipelines trim volume 40–60% before any of these tiers.',
    segments: [
      { label: 'Hot 3 days',           days: 3,   color: '#0077CC', kind: 'searchable' },
      { label: 'Cold 7 days',          days: 7,   color: '#2EA043', kind: 'searchable' },
      { label: 'Frozen → 12 months',   days: 355, color: '#6E7681', kind: 'searchable' },
    ],
    bands: [
      { label: 'Searchable ≥ 6 months (CEM)',     from: 0,  to: 187, color: '#7EE39A' },
      { label: 'Retrievable ≥ 12 months (THIRF)', from: 0,  to: 365, color: '#7BB7F5' },
    ],
  },
}

export default function RetentionTimeline({ level }) {
  const data = TIMELINES[level]
  if (!data) return null
  const totalDays = data.segments.reduce((s, seg) => s + seg.days, 0)

  return (
    <div className="rounded-lg border border-line bg-ink-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-wide text-text-primary uppercase">
          Retention Timeline — Level {level}
        </h3>
        <span className="text-xs text-text-muted">Total horizon ≈ {totalDays} days</span>
      </div>

      {/* segments bar — proportional, no inline labels */}
      <div className="flex w-full overflow-hidden rounded border border-line" style={{ height: 28 }}>
        {data.segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              width: `${(seg.days / totalDays) * 100}%`,
              minWidth: 8,
              background: seg.color,
            }}
            title={seg.label}
          />
        ))}
      </div>

      {/* segment labels beneath the bar — equal-spaced legend, one column per segment */}
      <div
        className="mt-2.5 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${data.segments.length}, minmax(0, 1fr))` }}
      >
        {data.segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-xs text-text-primary truncate">{seg.label}</span>
          </div>
        ))}
      </div>

      {/* compliance bands */}
      <div className="mt-4 space-y-1.5">
        {data.bands.map((band) => (
          <div key={band.label} className="flex items-center gap-3">
            <div
              className="h-2 rounded-full"
              style={{
                marginLeft: `${(band.from / totalDays) * 100}%`,
                width: `${((band.to - band.from) / totalDays) * 100}%`,
                background: band.color,
                minWidth: 30,
              }}
            />
            <span className="text-xs text-text-primary">{band.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-muted leading-relaxed">{data.note}</p>
    </div>
  )
}
