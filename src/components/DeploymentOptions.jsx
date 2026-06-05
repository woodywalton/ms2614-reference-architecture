import React from 'react'
import { useNavigate } from 'react-router-dom'
import { sizingTable, SIZE_ORDER } from '../data/sizing.js'

export default function DeploymentOptions() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-text-primary">Deployment Options</h1>
        <p className="mt-3 text-base text-text-muted leading-relaxed">
          M-26-14 compliant architectures can be deployed across several models: Elastic Cloud
          on AWS GovCloud or Azure Government (FedRAMP High), self-managed on-premises, or
          hybrid federated topologies combining both.
        </p>
      </header>

      {/* Organization Size Tiers */}
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

      {/* Deployment patterns placeholder */}
      <div className="rounded-lg border border-line border-dashed bg-ink-800 p-12 text-center">
        <p className="text-text-muted text-sm">Deployment patterns coming soon.</p>
        <p className="mt-2 text-xs text-text-muted/60">
          Will cover Elastic Cloud (FedRAMP High), self-managed on-premises, and hybrid
          federated topologies with architecture diagrams and configuration guidance.
        </p>
      </div>
    </main>
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
