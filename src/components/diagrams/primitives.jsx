// Reusable SVG primitives for the architecture diagrams.

import React from 'react'

export const ACCENT = {
  teal: '#00BFB3',
  blue: '#0077CC',
  gray: '#6E7681',
  purple: '#7B5EA7',
  green: '#2EA043',
  coral: '#CF4F27',
  yellow: '#D29922',
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
  icon, // optional path to an SVG/PNG in /public
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
      {/* icon */}
      {hasIcon && (
        <image
          href={icon}
          x={x + 16}
          y={y + 14}
          width={36}
          height={36}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
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
