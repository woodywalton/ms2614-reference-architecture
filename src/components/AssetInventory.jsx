import React from 'react'

export default function AssetInventory() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Asset Inventory</h1>
      <p className="mt-3 text-sm text-text-muted max-w-2xl leading-relaxed">
        The Elastic M-26-14 compliance pack includes pre-built assets for each maturity level:
        detection rules, Kibana dashboards, ILM policies, ingest pipelines, SLM policies,
        Fleet integration configurations, and osquery packs.
      </p>
      <div className="mt-8 rounded-lg border border-line border-dashed bg-ink-800 p-12 text-center">
        <p className="text-text-muted text-sm">Asset inventory coming soon.</p>
        <p className="mt-2 text-xs text-text-muted/60">
          Will list all downloadable compliance pack assets organized by level and type.
        </p>
      </div>
    </main>
  )
}
