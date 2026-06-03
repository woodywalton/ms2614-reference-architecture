import React, { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { LEVELS } from '../data/levels.js'
import { sizingTable, SIZE_ORDER } from '../data/sizing.js'
import Drawer from './Drawer.jsx'
import RetentionTimeline from './RetentionTimeline.jsx'
import SizeTabs from './SizeTabs.jsx'
import SizingPanel from './SizingPanel.jsx'
import Level1Diagram from './diagrams/Level1Diagram.jsx'
import Level2Diagram from './diagrams/Level2Diagram.jsx'
import Level3Diagram from './diagrams/Level3Diagram.jsx'
import Level4Diagram from './diagrams/Level4Diagram.jsx'

const DIAGRAMS = {
  1: Level1Diagram,
  2: Level2Diagram,
  3: Level3Diagram,
  4: Level4Diagram,
}

export default function LevelView() {
  const { id, size } = useParams()
  const level = Number(id)
  const meta = LEVELS.find((l) => l.id === level)
  const Diagram = DIAGRAMS[level]
  const [selected, setSelected] = useState(null)

  if (!meta || !Diagram) return <Navigate to="/" replace />
  // Validate size — fall back to small on garbage input
  if (!SIZE_ORDER.includes(size)) return <Navigate to={`/level/${level}/small`} replace />

  const activeSize = sizingTable[size]

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{meta.name}</h1>
          <p className="mt-1 text-sm text-text-muted">Due: {meta.deadline}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <ReqPill label="Searchable" value={meta.searchable ?? '— not required'} on={Boolean(meta.searchable)} />
          <ReqPill label="Retrievable" value={meta.retrievable} on />
        </div>
      </header>

      <SizeTabs />

      <section className="rounded-lg border border-line bg-ink-800 p-4">
        <p className="text-sm text-text-primary leading-relaxed max-w-4xl">{meta.summary}</p>
        <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-text-muted">
          {meta.keyPoints.map((k) => (
            <li key={k} className="flex gap-2">
              <span className="text-accent-teal">›</span>
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Diagram + sizing panel: side-by-side on wide screens, stacked on narrow */}
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="rounded-lg border border-line bg-ink-800 p-4 overflow-x-auto">
          <Diagram size={size} onNodeClick={setSelected} />
        </div>
        <SizingPanel size={size} level={level} />
      </section>

      <section>
        <RetentionTimeline level={level} />
      </section>

      <Drawer componentId={selected} size={size} onClose={() => setSelected(null)} />
    </main>
  )
}

function ReqPill({ label, value, on }) {
  return (
    <div className={`rounded border px-3 py-1.5 ${on ? 'border-accent-teal/50 bg-accent-teal/10' : 'border-line bg-ink-800'}`}>
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`text-sm font-semibold ${on ? 'text-accent-teal' : 'text-text-muted'}`}>{value}</p>
    </div>
  )
}
