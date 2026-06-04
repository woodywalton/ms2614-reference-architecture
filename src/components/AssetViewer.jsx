// Slide-over flyout for viewing compliance pack asset files.
// NDJSON files render as individual expandable JSON blocks.
// JSON/YAML files render as a single syntax-highlighted block.

import React, { useState, useEffect, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ASSET_FILE_MAP, ASSET_TYPE_META, classifyNdjsonLine } from '../data/assets.js'

export default function AssetViewer({ assetId, onClose }) {
  const open = Boolean(assetId)
  const asset = assetId ? ASSET_FILE_MAP[assetId] : null

  const [rawText, setRawText] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Fetch file when assetId changes
  useEffect(() => {
    if (!asset) { setRawText(null); return }
    setLoading(true)
    setError(null)
    setRawText(null)
    fetch(asset.file)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(t => { setRawText(t); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [assetId])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleCopy = useCallback(() => {
    if (!rawText) return
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [rawText])

  const handleDownload = useCallback(() => {
    if (!rawText || !asset) return
    const filename = asset.file.split('/').pop()
    const blob = new Blob([rawText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [rawText, asset])

  const typeMeta = asset ? (ASSET_TYPE_META[asset.type] ?? { label: asset.type, color: 'text-text-muted', bg: 'bg-ink-700 border-line' }) : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-ink-800 shadow-2xl
                    flex flex-col transform transition-transform duration-200 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: '1px solid rgb(var(--color-line))' }}
        role="dialog"
        aria-modal="true"
        aria-label={asset ? `${asset.label} asset viewer` : 'Asset viewer'}
      >
        {asset && (
          <>
            {/* Header */}
            <header className="flex items-start gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgb(var(--color-line))' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <TypeBadge meta={typeMeta} />
                  <span className="text-xs text-text-muted">{asset.column}</span>
                </div>
                <h2 className="text-base font-semibold text-text-primary leading-tight truncate">
                  {asset.label}
                </h2>
                <p className="mt-1 text-xs text-text-muted font-mono truncate">{asset.file.split('/').pop()}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded p-1.5 text-text-muted hover:bg-ink-700 hover:text-text-primary"
                aria-label="Close viewer"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {/* Description */}
            <div className="px-5 py-3 shrink-0 bg-ink-700/40"
              style={{ borderBottom: '1px solid rgb(var(--color-line))' }}>
              <p className="text-sm text-text-primary leading-relaxed">{asset.desc}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {asset.levels.map(l => (
                  <span key={l} className="text-xs px-1.5 py-0.5 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30"
                    style={{ borderStyle: 'solid' }}>L{l}</span>
                ))}
                {asset.ruleCount && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-accent-purple/15 text-accent-purple border border-accent-purple/30"
                    style={{ borderStyle: 'solid' }}>{asset.ruleCount} rules</span>
                )}
              </div>
            </div>

            {/* Action bar */}
            <div className="flex gap-2 px-5 py-2.5 shrink-0"
              style={{ borderBottom: '1px solid rgb(var(--color-line))' }}>
              <button
                onClick={handleCopy}
                disabled={!rawText}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-line text-text-muted hover:text-text-primary hover:border-accent-blue/50 disabled:opacity-40 transition-colors"
                style={{ borderStyle: 'solid' }}
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M11 5V3.5A1.5 1.5 0 009.5 2H3.5A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                    Copy NDJSON
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={!rawText}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-line text-text-muted hover:text-text-primary hover:border-accent-blue/50 disabled:opacity-40 transition-colors"
                style={{ borderStyle: 'solid' }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Download
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-16 text-text-muted text-sm">
                  Loading…
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-accent-coral/30 bg-accent-coral/10 px-4 py-3 text-sm text-accent-coral"
                  style={{ borderStyle: 'solid' }}>
                  Failed to load file: {error}
                </div>
              )}
              {rawText && !loading && (
                asset.format === 'ndjson'
                  ? <NdjsonViewer raw={rawText} />
                  : <SingleFileViewer raw={rawText} format={asset.format} />
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function TypeBadge({ meta }) {
  if (!meta) return null
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}
      style={{ borderStyle: 'solid' }}>
      {meta.label}
    </span>
  )
}

function NdjsonViewer({ raw }) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted px-1">{lines.length} {lines.length === 1 ? 'object' : 'objects'}</p>
      {lines.map((line, i) => {
        let parsed = null
        let parseErr = null
        try { parsed = JSON.parse(line) } catch (e) { parseErr = e.message }
        return (
          <NdjsonBlock key={i} index={i} raw={line} parsed={parsed} parseErr={parseErr} />
        )
      })}
    </div>
  )
}

function NdjsonBlock({ index, raw, parsed, parseErr }) {
  const [expanded, setExpanded] = useState(index === 0)

  const meta = parsed ? classifyNdjsonLine(parsed) : { displayType: 'parse error', title: parseErr }

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ border: '1px solid rgb(var(--color-line))' }}>
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-ink-700 transition-colors bg-ink-700/50"
      >
        <svg
          className={`w-3 h-3 text-text-muted shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-mono text-text-muted shrink-0">{index + 1}</span>
        <TypeBadgeMini type={meta.displayType} />
        <span className="text-sm text-text-primary truncate flex-1">{meta.title}</span>
      </button>
      {expanded && (
        <div className="overflow-x-auto" style={{ borderTop: '1px solid rgb(var(--color-line))' }}>
          {parseErr ? (
            <pre className="px-4 py-3 text-xs text-accent-coral font-mono">{raw}</pre>
          ) : (
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '0.72rem',
                lineHeight: '1.5',
                background: 'rgb(var(--color-ink-900, 13 17 23))',
                padding: '12px 16px',
              }}
              wrapLongLines={false}
            >
              {JSON.stringify(parsed, null, 2)}
            </SyntaxHighlighter>
          )}
        </div>
      )}
    </div>
  )
}

function TypeBadgeMini({ type }) {
  const typeColors = {
    eql:               'text-accent-coral',
    esql:              'text-accent-teal',
    machine_learning:  'text-accent-purple',
    threshold:         'text-accent-yellow',
    query:             'text-accent-blue',
    dashboard:         'text-accent-coral',
    visualization:     'text-accent-blue',
    'lens':            'text-accent-teal',
    'index-pattern':   'text-accent-green',
    'tag':             'text-text-muted',
  }
  const color = typeColors[type] ?? 'text-text-muted'
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider font-mono shrink-0 ${color}`}>
      {type}
    </span>
  )
}

function SingleFileViewer({ raw, format }) {
  const lang = format === 'yaml' ? 'yaml' : 'json'
  let display = raw
  if (format === 'json') {
    try { display = JSON.stringify(JSON.parse(raw), null, 2) } catch (_) { /* keep raw */ }
  }
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgb(var(--color-line))' }}>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.72rem',
          lineHeight: '1.5',
          background: 'rgb(var(--color-ink-900, 13 17 23))',
          padding: '16px',
        }}
        wrapLongLines={false}
      >
        {display}
      </SyntaxHighlighter>
    </div>
  )
}
