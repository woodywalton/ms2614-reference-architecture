// Right-side (or below-on-narrow) readout panel showing the active size's
// node counts, instance types, S3 footprint, and AZ count.

import React from 'react'
import { getSizing, CONTROL_PLANE_DEFAULTS, LEVELS_WITH_COLD } from '../data/sizing.js'

export default function SizingPanel({ size, level }) {
  const s = getSizing(size)
  const hasCold = LEVELS_WITH_COLD.has(Number(level))

  return (
    <aside className="rounded-lg border border-line bg-ink-800 p-5 space-y-5">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Active sizing</p>
        <h2 className="mt-0.5 text-lg font-semibold text-accent-teal">{s.label}</h2>
        <p className="text-xs text-text-muted">{s.ingestRange}</p>
      </header>

      <KV
        items={[
          { k: 'Daily ingest', v: `Up to ${s.representativeIngest} TB/day (entry: ${s.entryIngest} TB/day)` },
          { k: 'Total S3 storage', v: `${s.s3StoredTB.toLocaleString()} TB stored` },
          { k: 'Availability zones', v: `${s.availabilityZones} AZs (${hasCold ? 'h/c/f' : 'h/f'})` },
        ]}
      />

      <section>
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Node breakdown</p>
        <table className="w-full text-xs">
          <tbody className="[&>tr>td]:py-1.5 [&>tr>td:first-child]:text-text-muted [&>tr>td:last-child]:text-right [&>tr>td:last-child]:font-medium [&>tr>td:last-child]:text-text-primary">
            <tr><td>Hot nodes</td><td>{s.hotNodes} × {s.instanceTypes.hot}</td></tr>
            {hasCold && (
              <tr><td>Cold nodes</td><td>{s.coldNodes} × {s.instanceTypes.cold}</td></tr>
            )}
            <tr><td>Frozen nodes</td><td>{s.frozenNodes} × {s.instanceTypes.frozen}</td></tr>
            <tr><td>ML node RAM</td><td>{s.mlNodeRamGB} GB × {s.instanceTypes.ml}</td></tr>
            <tr><td>Master node RAM</td><td>{s.masterNodeRamGB} GB × {s.instanceTypes.master} <span className="text-text-muted">(fixed)</span></td></tr>
            <tr><td>Kibana RAM</td><td>{s.kibanaRamGB} GB × {s.instanceTypes.kibana} <span className="text-text-muted">(fixed)</span></td></tr>
          </tbody>
        </table>
        <p className="mt-3 text-[11px] italic text-text-muted leading-snug">
          Master and Kibana RAM remain constant across size tiers — the control plane is fixed,
          only the data plane scales.
        </p>
      </section>

      <section className="rounded border border-line bg-ink-900/60 p-3">
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Control-plane fleet</p>
        <p className="text-xs text-text-primary">
          {CONTROL_PLANE_DEFAULTS.masterNodes} master · {CONTROL_PLANE_DEFAULTS.kibanaNodes} Kibana · {CONTROL_PLANE_DEFAULTS.mlNodes} ML
          <span className="text-text-muted"> (one per AZ)</span>
        </p>
      </section>
    </aside>
  )
}

function KV({ items }) {
  return (
    <dl className="space-y-2">
      {items.map((i) => (
        <div key={i.k} className="flex justify-between gap-3 text-xs">
          <dt className="text-text-muted">{i.k}</dt>
          <dd className="text-text-primary font-medium text-right">{i.v}</dd>
        </div>
      ))}
    </dl>
  )
}
