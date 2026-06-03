// Small / Medium / Large sub-tab control rendered inside each level page.
// Drives the URL: /level/:id/:size.

import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { sizingTable, SIZE_ORDER } from '../data/sizing.js'

export default function SizeTabs() {
  const { id } = useParams()
  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted italic">
        Organizations ingesting &gt; 25 TB/day (e.g., CISA, VA) should treat the Large tier as a
        starting point and engage Elastic Professional Services for custom sizing.
      </p>
      <div role="tablist" className="inline-flex rounded-lg border border-line bg-ink-800 p-1">
        {SIZE_ORDER.map((size) => {
          const s = sizingTable[size]
          return (
            <NavLink
              key={size}
              to={`/level/${id}/${size}`}
              replace
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm transition-colors ` +
                (isActive
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-text-muted hover:text-text-primary hover:bg-ink-700/70')
              }
            >
              <span className="font-semibold">{s.label}</span>
              <span className="ml-2 text-[11px] text-text-muted">{s.ingestRange}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
