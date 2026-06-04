// Reusable SVG primitives for the architecture diagrams.

import React from 'react'
import { EuiIcon } from '@elastic/eui'

/**
 * Renders an EUI icon at (x, y) inside an SVG via foreignObject. The icon is
 * centered in a `size`x`size` box. `type` is an EUI icon type string (e.g.
 * "logoElasticsearch", "logoKibana", "machineLearningApp").
 */
export function DiagramIcon({ type, x, y, size = 36 }) {
  if (!type) return null
  return (
    <foreignObject x={x} y={y} width={size} height={size}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EuiIcon type={type} size={size >= 32 ? 'xl' : 'l'} />
      </div>
    </foreignObject>
  )
}

export const ACCENT = {
  teal:   '#00BFB3',
  blue:   '#0077CC',  // cold tier
  gray:   '#6E7681',  // snapshots, neutral
  purple: '#7B5EA7',  // frozen tier (and ML group — visually adjacent but in different lanes)
  green:  '#2EA043',  // ILM/SLM policy, on-prem cluster
  coral:  '#CF4F27',  // Kibana/SIEM, SOC, sensitive data protection
  yellow: '#D29922',  // BYOK, NTP
  orange: '#EC7211',  // hot tier
  pink:   '#F04E98',  // Kibana node infrastructure (matches Kibana brand pink)
  cyan:   '#06B6D4',  // ML compute + AI/ML enrichment workload
}

// Arrow color palette — semantic, not per-tier.
export const ARROW = {
  data: '#00BFB3',     // solid teal: primary data flow
  policy: '#D29922',   // yellow: control plane / policy / Fleet
  export: '#CF4F27',   // coral: incident / CISA-FBI export
  muted: '#8B949E',    // gray: secondary / read paths
}

const BADGE_COLORS = {
  SEARCHABLE: { fill: '#0E3A2A', stroke: '#2EA043', text: '#7EE39A' },
  RETRIEVABLE: { fill: '#1A2438', stroke: '#0077CC', text: '#7BB7F5' },
  UNMOUNTED: { fill: '#2A1F38', stroke: '#7B5EA7', text: '#C6A8E8' },
  OPTIONAL: { fill: '#332518', stroke: '#D29922', text: '#F0C36D' },
  L3: { fill: '#2A1A28', stroke: '#CF4F27', text: '#F0A088' },
  L4: { fill: '#1A2A2E', stroke: '#00BFB3', text: '#6FDCD3' },
}

/**
 * Architecture node. New larger size (220x100) with room for an optional icon
 * in the upper-left corner.
 */
export function Node({
  x,
  y,
  w = 220,
  h = 100,
  title,
  subtitle,
  color = 'teal',
  badges = [],
  dashed = false,
  icon, // EUI icon type string
  bullets, // optional string[] — renders as compact bulleted list below subtitle
  onClick,
  componentId,
}) {
  const accent = ACCENT[color] || ACCENT.teal
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  const hasIcon = Boolean(icon)
  const titleX = x + (hasIcon ? 60 : 18)
  return (
    <g
      className="diagram-node"
      onClick={handleClick}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        ry={10}
        fill="#161B22"
        stroke={dashed ? accent : '#2A3344'}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      {/* left accent bar */}
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />
      {/* icon (EUI icon type string) */}
      {hasIcon && <DiagramIcon type={icon} x={x + 14} y={y + 12} size={36} />}
      {/* title */}
      <text
        className="diagram-label"
        x={titleX}
        y={y + 32}
        fontSize="14"
        fontWeight="700"
        fill="#E6EDF3"
      >
        {title}
      </text>
      {/* subtitle (Elastic product) */}
      {subtitle && (
        <text
          className="diagram-label"
          x={titleX}
          y={y + 52}
          fontSize="11"
          fill="#8B949E"
        >
          {subtitle}
        </text>
      )}
      {/* bulleted capability list (used for the Sensitive Data Protection card) */}
      {bullets && bullets.length > 0 && (
        <g transform={`translate(${x + 16}, ${y + (subtitle ? 72 : 56)})`}>
          {bullets.map((b, i) => (
            <text
              key={b}
              y={i * 15}
              fontSize="10.5"
              fill="#E6EDF3"
              className="diagram-label"
            >
              <tspan fill="#6FDCD3" fontWeight="700">›</tspan>
              <tspan dx="6">{b}</tspan>
            </text>
          ))}
        </g>
      )}
      {/* badges */}
      {badges.length > 0 && (
        <g transform={`translate(${x + 16}, ${y + h - 22})`}>
          {badges.map((label, i) => (
            <Badge key={label} label={label} x={i * 82} />
          ))}
        </g>
      )}
    </g>
  )
}

/**
 * Tier fleet card — shows a tier (hot/cold/frozen/ml/master/kibana) along
 * with the node fleet inside it as a strip of mini-node rectangles.
 *
 *  - If nodeCount ≤ 6: render that many mini-nodes, each labeled prefix-1..prefix-N.
 *  - If nodeCount > 6: render `prefix-1`, `prefix-2`, `prefix-3`, …, `prefix-N`
 *    (3 leading mini-nodes + ellipsis + 1 trailing mini-node showing the total).
 *
 * The card is clickable like any Node and opens the drawer for `componentId`.
 */
export function TierFleetCard({
  x,
  y,
  w = 300,
  h = 140,
  title,
  subtitle,
  color = 'blue',
  nodeCount,
  nodePrefix,
  instanceType,
  badges = [],
  azsLabel = '3 AZs',
  icon, // EUI icon type
  onClick,
  componentId,
}) {
  const accent = ACCENT[color] || ACCENT.teal
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // Mini-node strip
  const minis =
    nodeCount <= 6
      ? Array.from({ length: nodeCount }, (_, i) => ({ label: `${nodePrefix}-${i + 1}` }))
      : [
          { label: `${nodePrefix}-1` },
          { label: `${nodePrefix}-2` },
          { label: `${nodePrefix}-3` },
          { ellipsis: true },
          { label: `${nodePrefix}-${nodeCount}` },
        ]
  const miniW = 44
  const miniH = 20
  const miniGap = 4
  const ellipsisW = 16
  const stripWidth =
    minis.reduce((acc, m) => acc + (m.ellipsis ? ellipsisW : miniW), 0) +
    (minis.length - 1) * miniGap
  const stripStartX = x + (w - stripWidth) / 2
  const stripY = y + 64

  return (
    <g
      className="diagram-node"
      onClick={handleClick}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`${title} (${nodeCount} nodes)`}
    >
      <rect x={x} y={y} width={w} height={h} rx={10} ry={10} fill="#161B22" stroke="#2A3344" strokeWidth={1.5} />
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />

      {/* Icon (EUI) — sits above the title */}
      {icon && <DiagramIcon type={icon} x={x + 14} y={y + 10} size={28} />}

      {/* Title (offset right if icon is present) */}
      <text className="diagram-label" x={x + (icon ? 50 : 18)} y={y + 26} fontSize="14" fontWeight="700" fill="#E6EDF3">
        {title}
      </text>
      {subtitle && (
        <text className="diagram-label" x={x + (icon ? 50 : 18)} y={y + 44} fontSize="11" fill="#8B949E">
          {subtitle}
        </text>
      )}

      {/* Top-right: node count + instance type */}
      <text x={x + w - 14} y={y + 26} fontSize="11" fontWeight="700" fill="#6FDCD3" textAnchor="end" style={{ letterSpacing: '0.06em' }}>
        {nodeCount} {nodeCount === 1 ? 'NODE' : 'NODES'}
      </text>
      <text x={x + w - 14} y={y + 44} fontSize="10.5" fill="#8B949E" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, monospace">
        {instanceType}
      </text>

      {/* Node strip */}
      {(() => {
        let cursor = stripStartX
        return minis.map((m, i) => {
          const width = m.ellipsis ? ellipsisW : miniW
          const cx = cursor
          cursor += width + miniGap
          if (m.ellipsis) {
            return (
              <text
                key={`e-${i}`}
                x={cx + width / 2}
                y={stripY + miniH / 2 + 4}
                fontSize="16"
                fontWeight="700"
                fill="#8B949E"
                textAnchor="middle"
              >
                …
              </text>
            )
          }
          return (
            <g key={`n-${i}`}>
              <rect x={cx} y={stripY} width={miniW} height={miniH} rx={3} fill="#1C2333" stroke={accent} strokeWidth={1} />
              <text
                x={cx + miniW / 2}
                y={stripY + miniH / 2 + 3.5}
                fontSize="9"
                fontWeight="600"
                fill="#E6EDF3"
                textAnchor="middle"
              >
                {m.label}
              </text>
            </g>
          )
        })
      })()}

      {/* AZ label + badges row */}
      <text x={x + 18} y={y + h - 14} fontSize="9.5" fontWeight="700" fill="#8B949E" style={{ letterSpacing: '0.12em' }}>
        {azsLabel}
      </text>
      {badges.length > 0 && (
        <g transform={`translate(${x + 64}, ${y + h - 26})`}>
          {badges.map((label, i) => (
            <Badge key={label} label={label} x={i * 82} />
          ))}
        </g>
      )}
    </g>
  )
}

/**
 * Smaller variant of TierFleetCard for the control-plane lane (master + Kibana).
 * Wider than a regular Node but shorter than a TierFleetCard, since these
 * tiers only ever show 3 fixed nodes.
 */
export function ControlPlaneCard({
  x,
  y,
  w = 220,
  h = 110,
  title,
  ramLabel,
  instanceType,
  nodeCount = 3,
  nodePrefix,
  color = 'gray',
  icon, // EUI icon type
  onClick,
  componentId,
}) {
  const accent = ACCENT[color] || ACCENT.gray
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  const miniW = 38, miniH = 18, miniGap = 4
  const stripWidth = nodeCount * miniW + (nodeCount - 1) * miniGap
  const stripStartX = x + (w - stripWidth) / 2

  return (
    <g
      className="diagram-node"
      onClick={handleClick}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <rect x={x} y={y} width={w} height={h} rx={10} ry={10} fill="#161B22" stroke="#2A3344" strokeWidth={1.5} />
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />

      {icon && <DiagramIcon type={icon} x={x + 12} y={y + 8} size={24} />}

      <text className="diagram-label" x={x + (icon ? 42 : 16)} y={y + 22} fontSize="13" fontWeight="700" fill="#E6EDF3">
        {title}
      </text>
      <text className="diagram-label" x={x + (icon ? 42 : 16)} y={y + 38} fontSize="10" fill="#8B949E">
        {ramLabel} · <tspan fontFamily="ui-monospace, SFMono-Regular, monospace">{instanceType}</tspan>
      </text>

      {/* mini-node strip */}
      {Array.from({ length: nodeCount }).map((_, i) => {
        const mx = stripStartX + i * (miniW + miniGap)
        return (
          <g key={i}>
            <rect x={mx} y={y + 52} width={miniW} height={miniH} rx={3} fill="#1C2333" stroke={accent} strokeWidth={1} />
            <text x={mx + miniW / 2} y={y + 52 + miniH / 2 + 3.5} fontSize="9" fontWeight="600" fill="#E6EDF3" textAnchor="middle">
              {nodePrefix}-{i + 1}
            </text>
          </g>
        )
      })}

      {/* fixed-across-sizes caveat */}
      <text x={x + w / 2} y={y + h - 10} fontSize="9" fontWeight="600" fill="#8B949E" textAnchor="middle" style={{ letterSpacing: '0.08em' }}>
        FIXED ACROSS SIZES
      </text>
    </g>
  )
}

function Badge({ label, x = 0 }) {
  const c = BADGE_COLORS[label] || BADGE_COLORS.OPTIONAL
  const w = label.length * 6.2 + 14
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect width={w} height={16} rx={8} ry={8} fill={c.fill} stroke={c.stroke} strokeWidth={1} />
      <text
        x={w / 2}
        y={11}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={c.text}
        style={{ letterSpacing: '0.05em' }}
      >
        {label}
      </text>
    </g>
  )
}

/**
 * Arrow between two points. Rounded corners + semantic color palette.
 * kind: 'data' | 'policy' | 'export' | 'muted'  (default 'data')
 * variant: 'solid' | 'dashed' (default 'solid'; 'policy' and 'export' default to dashed)
 */
export function Arrow({ d, kind = 'data', variant, label }) {
  const stroke = ARROW[kind] || ARROW.muted
  const dashed = variant === 'dashed' || (variant == null && (kind === 'policy' || kind === 'export'))
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={dashed ? '6 4' : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        markerEnd={`url(#arrow-${kind})`}
      />
      {label && (
        <text className="diagram-label" fill="#8B949E" fontSize="10">
          {label}
        </text>
      )}
    </g>
  )
}

/* ---------- Path helpers ---------- */

export function arrowPath(x1, y1, x2, y2) {
  return `M ${x1} ${y1} L ${x2} ${y2}`
}

export function lpath(x1, y1, x2, y2, mode = 'h') {
  if (mode === 'h') return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`
  return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
}

export function zpath(x1, y1, x2, y2, midX) {
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
}

export function zpathV(x1, y1, x2, y2, midY) {
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`
}

export function underPath(x1, y1, x2, y2, laneY) {
  return `M ${x1} ${y1} L ${x1} ${laneY} L ${x2} ${laneY} L ${x2} ${y2}`
}

/* ---------- Decorative elements ---------- */

/**
 * Stage header — a numbered circle plus column label, separator line.
 * Renders the strip at the top of the diagram.
 */
export function StageHeader({ stages }) {
  return (
    <g>
      {stages.map((s, i) => {
        const n = i + 1
        return (
          <g key={s.label}>
            {/* stage number circle */}
            <circle cx={s.x + 14} cy={26} r={12} fill="#1A2A2E" stroke="#00BFB3" strokeWidth={1.5} />
            <text
              x={s.x + 14}
              y={30}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#6FDCD3"
            >
              {n}
            </text>
            {/* stage label */}
            <text
              x={s.x + 34}
              y={31}
              fontSize="11"
              fontWeight="700"
              fill="#E6EDF3"
              style={{ letterSpacing: '0.16em' }}
            >
              {s.label}
            </text>
          </g>
        )
      })}
      <line x1={30} y1={48} x2={stages[stages.length - 1].x + stages[stages.length - 1].width} y2={48} stroke="#2A3344" strokeWidth={1} />
    </g>
  )
}

/**
 * Swim lane — a subtle column-tinted rectangle that visually groups the
 * nodes of a stage.
 */
export function SwimLane({ x, y, width, height }) {
  return (
    <rect
      x={x - 12}
      y={y}
      width={width + 24}
      height={height}
      rx={14}
      fill="#11161F"
      stroke="#1F2A3A"
      strokeWidth={1}
    />
  )
}

/**
 * SVG defs — one arrowhead marker per arrow color so arrowheads match
 * their line color.
 */
export function Defs() {
  return (
    <defs>
      {Object.entries(ARROW).map(([key, color]) => (
        <marker
          key={key}
          id={`arrow-${key}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  )
}

/**
 * Legend showing arrow type semantics.
 */
export function Legend({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={520} height={70} rx={8} fill="#0D1117" stroke="#2A3344" />
      <text x={16} y={22} fontSize="10" fontWeight="700" fill="#8B949E" style={{ letterSpacing: '0.16em' }}>
        LEGEND
      </text>
      <LegendItem x={16}  y={42} color={ARROW.data}   label="primary data flow" />
      <LegendItem x={180} y={42} color={ARROW.policy} label="control / policy" dashed />
      <LegendItem x={340} y={42} color={ARROW.export} label="CISA / FBI export" dashed />
      <g transform="translate(16, 56)">
        <rect width={20} height={10} fill="#161B22" stroke="#00BFB3" strokeDasharray="4 3" />
        <text x={28} y={9} fontSize="10.5" fill="#E6EDF3">dashed border = optional / unmounted</text>
      </g>
    </g>
  )
}

function LegendItem({ x, y, color, label, dashed }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={0} x2={30} y2={0} stroke={color} strokeWidth={2}
            strokeDasharray={dashed ? '6 4' : undefined}
            strokeLinecap="round" />
      <text x={40} y={4} fontSize="10.5" fill="#E6EDF3">{label}</text>
    </g>
  )
}
