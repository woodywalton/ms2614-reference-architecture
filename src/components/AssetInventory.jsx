import React, { useState } from 'react'
import JSZip from 'jszip'
import { ASSET_FILES, ASSET_COLUMNS, ASSET_TYPE_META } from '../data/assets.js'
import AssetViewer from './AssetViewer.jsx'

const LEVELS = [1, 2, 3, 4]

export default function AssetInventory() {
  const [filterLevel, setFilterLevel] = useState(null)
  const [viewerAssetId, setViewerAssetId] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const visible = filterLevel
    ? ASSET_FILES.filter(f => f.levels.includes(filterLevel))
    : ASSET_FILES

  const byColumn = ASSET_COLUMNS.map(col => ({
    col,
    files: visible.filter(f => f.column === col),
  })).filter(g => g.files.length)

  const total = visible.length

  async function handleDownloadBundle() {
    setDownloading(true)
    const zip = new JSZip()
    const label = filterLevel ? `L${filterLevel}` : 'all'
    const folder = zip.folder(`m2614-compliance-pack-${label}`)
    await Promise.all(
      visible.map(async f => {
        try {
          const res = await fetch(f.file)
          if (!res.ok) return
          const text = await res.text()
          const filename = f.file.split('/').pop()
          // Recreate subdirectory structure inside zip
          const subpath = f.file.replace('/assets/', '')
          folder.file(subpath, text)
        } catch (_) { /* skip failed fetch */ }
      })
    )
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `m2614-compliance-pack-${label}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 500)
    setDownloading(false)
  }

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-text-primary">
          M-26-14 Compliance Pack — Asset Inventory
        </h1>
        <p className="mt-4 text-base text-text-muted leading-relaxed max-w-3xl">
          Pre-built Elastic assets for each maturity level, organized by architecture layer.
          Assets are deployed into Kibana, Elasticsearch, and Fleet — each mapped to the
          M-26-14 element it fulfils. Click <span className="text-accent-blue font-medium">View</span> to
          inspect file contents, or download the full bundle for your level.
        </p>
      </header>

      {/* Filter + download bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Filter by level:</span>
          <button
            onClick={() => setFilterLevel(null)}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              filterLevel === null
                ? 'border-accent-teal/60 bg-accent-teal/15 text-accent-teal'
                : 'border-line bg-ink-800 text-text-muted hover:border-accent-teal/30 hover:text-text-primary'
            }`}
            style={{ borderStyle: 'solid' }}
          >
            All levels
          </button>
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setFilterLevel(l === filterLevel ? null : l)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                filterLevel === l
                  ? 'border-accent-blue/60 bg-accent-blue/15 text-accent-blue'
                  : 'border-line bg-ink-800 text-text-muted hover:border-accent-blue/30 hover:text-text-primary'
              }`}
              style={{ borderStyle: 'solid' }}
            >
              L{l}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <span className="text-xs text-text-muted">{total} assets</span>

        <button
          onClick={handleDownloadBundle}
          disabled={downloading}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded border border-accent-blue/50 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 disabled:opacity-50 transition-colors"
          style={{ borderStyle: 'solid' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {downloading ? 'Preparing…' : `Download ${filterLevel ? `L${filterLevel}` : 'full'} bundle`}
        </button>
      </div>

      {/* Column sections */}
      {byColumn.map(({ col, files }) => (
        <section key={col}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">{col}</h2>
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-text-muted">{files.length} assets</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {files.map(f => <AssetCard key={f.id} asset={f} onView={() => setViewerAssetId(f.id)} />)}
          </div>
        </section>
      ))}

      <AssetViewer assetId={viewerAssetId} onClose={() => setViewerAssetId(null)} />
    </main>
  )
}

function AssetCard({ asset, onView }) {
  const typeMeta = ASSET_TYPE_META[asset.type] ?? { label: asset.type, color: 'text-text-muted', bg: 'bg-ink-700 border-line' }
  const filename = asset.file.split('/').pop()

  return (
    <div className="rounded-lg bg-ink-800 p-4 flex flex-col gap-2" style={{ border: '1px solid rgb(var(--color-line))' }}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeMeta.bg} ${typeMeta.color}`}
              style={{ borderStyle: 'solid' }}>
              {typeMeta.label}
            </span>
            {asset.levels.map(l => (
              <span key={l} className="text-[9px] px-1 py-0.5 rounded bg-ink-700 text-text-muted border border-line/50"
                style={{ borderStyle: 'solid' }}>L{l}</span>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-text-primary leading-snug">{asset.label}</h3>
          <p className="mt-1 text-xs font-mono text-text-muted/70 truncate">{filename}</p>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed flex-1">{asset.desc}</p>

      <div className="flex items-center gap-2 pt-1">
        {asset.ruleCount && (
          <span className="text-xs text-text-muted">{asset.ruleCount} rules</span>
        )}
        <div className="flex-1" />
        <button
          onClick={onView}
          className="text-xs px-3 py-1.5 rounded border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10 transition-colors"
          style={{ borderStyle: 'solid' }}
        >
          View
        </button>
        <DownloadButton asset={asset} />
      </div>
    </div>
  )
}

function DownloadButton({ asset }) {
  const [busy, setBusy] = useState(false)

  async function handle() {
    setBusy(true)
    try {
      const res = await fetch(asset.file)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const filename = asset.file.split('/').pop()
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 500)
    } catch (_) { /* silently fail */ }
    setBusy(false)
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="text-xs px-3 py-1.5 rounded border border-line text-text-muted hover:border-accent-blue/40 hover:text-text-primary disabled:opacity-40 transition-colors"
      style={{ borderStyle: 'solid' }}
      title={`Download ${asset.file.split('/').pop()}`}
    >
      {busy ? '…' : (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  )
}
