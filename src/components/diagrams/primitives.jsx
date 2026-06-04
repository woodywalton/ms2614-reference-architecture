// Reusable SVG primitives for the architecture diagrams.

import React from 'react'
import { EuiIcon } from '@elastic/eui'
import { useTheme } from '../../ThemeContext.jsx'

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
  purple: '#7B5EA7',  // frozen tier (and IOC matching)
  green:  '#2EA043',  // ILM/SLM policy, on-prem cluster
  coral:  '#CF4F27',  // Kibana/SIEM workload, SOC, sensitive data protection
  yellow: '#D29922',  // BYOK, NTP
  orange: '#EC7211',  // hot tier
  pink:   '#F04E98',  // Kibana node infrastructure (matches Kibana brand pink)
  cyan:   '#06B6D4',  // ML compute + AI/ML enrichment workload
}

export const ARROW = {
  data:   '#8B949E',
  policy: '#8B949E',
  export: '#8B949E',
  muted:  '#8B949E',
}

// ── Theme color palettes ──────────────────────────────────────────────────────

const DARK = {
  swimFill:           '#11161F',
  swimStroke:         '#1F2A3A',
  nodeFill:           '#161B22',
  nodeStroke:         '#2A3344',
  miniFill:           '#1C2333',
  bandFill:           '#0D111A',
  bandStroke:         '#1F2A3A',
  textPrimary:        '#E6EDF3',
  textMuted:          '#8B949E',
  textAccentTeal:     '#6FDCD3',
  legendFill:         '#0D1117',
  legendStroke:       '#2A3344',
  stageCircleBg:      '#1A2A2E',
  stageCircleStroke:  '#00BFB3',
  stageCircleText:    '#6FDCD3',
  stageSeparator:     '#2A3344',
  stageLabel:         '#E6EDF3',
  controlLabel:       '#8B949E',
  securityPanelText:  '#E6EDF3',
  securityPanelLine:  '#2A3344',
  federationRingFill: '#0F1620',
  federationRingStroke: '#1F2A3A',
  federationSOCFill:  '#161B22',
  federationText:     '#E6EDF3',
  federationSub:      '#8B949E',
  federationBadgeBg:  '#1A2A2E',
  federationBadgeStroke: '#00BFB3',
  federationBadgeText: '#6FDCD3',
  federationDivider:  '#2A3344',
  federationLabel:    '#E6EDF3',
  federationDesc:     '#8B949E',
  federationSpoke:    '#6FDCD3',
}

const LIGHT = {
  swimFill:           '#F0F4FA',
  swimStroke:         '#CBD5E1',
  nodeFill:           '#FFFFFF',
  nodeStroke:         '#CBD5E1',
  miniFill:           '#EEF2F7',
  bandFill:           '#F5F8FC',
  bandStroke:         '#CBD5E1',
  textPrimary:        '#1E2532',
  textMuted:          '#576070',
  textAccentTeal:     '#006B65',
  legendFill:         '#F8FAFC',
  legendStroke:       '#CBD5E1',
  stageCircleBg:      '#E0F5F4',
  stageCircleStroke:  '#008578',
  stageCircleText:    '#005F56',
  stageSeparator:     '#CBD5E1',
  stageLabel:         '#1E2532',
  controlLabel:       '#576070',
  securityPanelText:  '#1E2532',
  securityPanelLine:  '#CBD5E1',
  federationRingFill: '#F0F4FA',
  federationRingStroke: '#CBD5E1',
  federationSOCFill:  '#FFFFFF',
  federationText:     '#1E2532',
  federationSub:      '#576070',
  federationBadgeBg:  '#E0F5F4',
  federationBadgeStroke: '#008578',
  federationBadgeText: '#005F56',
  federationDivider:  '#CBD5E1',
  federationLabel:    '#1E2532',
  federationDesc:     '#576070',
  federationSpoke:    '#006B65',
}

const BADGE_DARK = {
  SEARCHABLE: { fill: '#0E3A2A', stroke: '#2EA043', text: '#7EE39A' },
  RETRIEVABLE: { fill: '#1A2438', stroke: '#0077CC', text: '#7BB7F5' },
  UNMOUNTED:   { fill: '#2A1F38', stroke: '#7B5EA7', text: '#C6A8E8' },
  OPTIONAL:    { fill: '#332518', stroke: '#D29922', text: '#F0C36D' },
  L3:          { fill: '#2A1A28', stroke: '#CF4F27', text: '#F0A088' },
  L4:          { fill: '#1A2A2E', stroke: '#00BFB3', text: '#6FDCD3' },
}

const BADGE_LIGHT = {
  SEARCHABLE: { fill: '#D1FAE5', stroke: '#059669', text: '#065F46' },
  RETRIEVABLE: { fill: '#DBEAFE', stroke: '#2563EB', text: '#1E3A8A' },
  UNMOUNTED:   { fill: '#EDE9FE', stroke: '#7C3AED', text: '#4C1D95' },
  OPTIONAL:    { fill: '#FEF3C7', stroke: '#D97706', text: '#825803' },
  L3:          { fill: '#FEE2E2', stroke: '#DC2626', text: '#7F1D1D' },
  L4:          { fill: '#CCFBF1', stroke: '#0D9488', text: '#134E4A' },
}

function useDiagramColors() {
  const { theme } = useTheme()
  return theme === 'dark' ? DARK : LIGHT
}

function useBadgeColors() {
  const { theme } = useTheme()
  return theme === 'dark' ? BADGE_DARK : BADGE_LIGHT
}

// Export so Level*Diagram files can use for inline elements
export function useDiagramTheme() {
  const { theme } = useTheme()
  return { isDark: theme === 'dark', C: theme === 'dark' ? DARK : LIGHT }
}

// ── Components ────────────────────────────────────────────────────────────────

export function Node({
  x,
  y,
  w = 220,
  h = 100,
  title,
  titleLines, // optional string[] — wrap title across multiple lines when long
  subtitle,
  color = 'teal',
  badges = [],
  dashed = false,
  icon, // EUI icon type string
  bullets, // optional string[] — renders as compact bulleted list below subtitle
  onClick,
  componentId,
}) {
  const C = useDiagramColors()
  const accent = ACCENT[color] || ACCENT.teal
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }
  const hasIcon = Boolean(icon)
  const titleX = x + (hasIcon ? 60 : 18)
  // Render title: if titleLines is provided, render each as its own line.
  const titleArr = titleLines && titleLines.length > 0 ? titleLines : (title ? [title] : [])
  const TITLE_LINE_H = 18 // baseline-to-baseline for 16px title font
  // Y baseline of the LAST title line — drives subtitle / bullet positioning.
  const lastTitleY = 32 + (titleArr.length - 1) * TITLE_LINE_H
  const subtitleY = lastTitleY + 20
  // Bullet group starts a few px below the title (or subtitle if present).
  const bulletStartY = (subtitle ? subtitleY + 24 : lastTitleY + 28)
  return (
    <g className="diagram-node" onClick={handleClick} onKeyDown={handleKey}
      tabIndex={0} role="button" aria-label={title || (titleLines || []).join(' ')}>
      <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
        fill={C.nodeFill}
        stroke={dashed ? accent : C.nodeStroke}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '6 4' : undefined}
      />
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />
      {hasIcon && <DiagramIcon type={icon} x={x + 14} y={y + 12} size={36} />}
      {titleArr.map((line, i) => (
        <text key={`title-${i}`} className="diagram-label" x={titleX}
          y={y + 32 + i * TITLE_LINE_H}
          fontSize="15" fontWeight="700" fill={C.textPrimary}>
          {line}
        </text>
      ))}
      {subtitle && (
        <text className="diagram-label" x={titleX} y={y + subtitleY}
          fontSize="12" fill={C.textMuted}>
          {subtitle}
        </text>
      )}
      {/* bulleted capability list (used for the Sensitive Data Protection card) */}
      {bullets && bullets.length > 0 && (
        <g transform={`translate(${x + 16}, ${y + bulletStartY})`}>
          {bullets.map((b, i) => (
            <text
              key={b}
              y={i * 18}
              fontSize="11"
              fill={C.textPrimary}
              className="diagram-label"
            >
              <tspan fill={C.textAccentTeal} fontWeight="700">›</tspan>
              <tspan dx="6">{b}</tspan>
            </text>
          ))}
        </g>
      )}
      {/* badges — right-aligned */}
      {badges.length > 0 && (
        <g transform={`translate(${x + w - badgesGroupWidth(badges) - 16}, ${y + h - 26})`}>
          {badges.map((label, i) => <Badge key={label} label={label} x={i * 82} />)}
        </g>
      )}
    </g>
  )
}

// Approximate total rendered width of a badge group laid out with the
// 82 px-per-slot stride. Used for right-alignment.
function badgesGroupWidth(badges) {
  if (!badges || badges.length === 0) return 0
  const lastW = badges[badges.length - 1].length * 6.2 + 14
  return (badges.length - 1) * 82 + lastW
}

export function TierFleetCard({
  x, y, w = 300, h = 140,
  title, subtitle, color = 'blue',
  nodeCount, nodePrefix, instanceType,
  badges = [], azsLabel = '3 AZs',
  icon, onClick, componentId,
}) {
  const C = useDiagramColors()
  const accent = ACCENT[color] || ACCENT.teal
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const miniW = 60, miniH = 22, miniGap = 4, ellipsisW = 16
  const MAX_COLS = 3

  // Build mini-node items, then ALWAYS wrap into rows of at most 3.
  // ≤6 nodes: numbered (e.g., hot-1 … hot-6). > 6: abbreviated as
  // hot-1 / hot-2 / hot-3 / … / hot-N (5 items → 3+2 grid).
  const items =
    nodeCount <= 6
      ? Array.from({ length: nodeCount }, (_, i) => ({ label: `${nodePrefix}-${i + 1}` }))
      : [
          { label: `${nodePrefix}-1` },
          { label: `${nodePrefix}-2` },
          { label: `${nodePrefix}-3` },
          { ellipsis: true },
          { label: `${nodePrefix}-${nodeCount}` },
        ]
  const itemRows = []
  for (let i = 0; i < items.length; i += MAX_COLS) {
    itemRows.push(items.slice(i, i + MAX_COLS))
  }
  const rowCount = itemRows.length
  // Shift the strip up when there's more than one row so it stays clear of
  // the footer area (AZ label / badges at y+h-22).
  const stripY = y + (rowCount > 1 ? 54 : 66)

  return (
    <g className="diagram-node" onClick={handleClick} onKeyDown={handleKey}
      tabIndex={0} role="button" aria-label={`${title} (${nodeCount} nodes)`}>
      <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
        fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth={1.5} />
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />

      {icon && <DiagramIcon type={icon} x={x + 14} y={y + 10} size={28} />}

      <text className="diagram-label" x={x + (icon ? 50 : 18)} y={y + 26}
        fontSize="15" fontWeight="700" fill={C.textPrimary}>{title}</text>
      {subtitle && (
        <text className="diagram-label" x={x + (icon ? 50 : 18)} y={y + 44}
          fontSize="12" fill={C.textMuted}>{subtitle}</text>
      )}

      <text x={x + w - 14} y={y + 26} fontSize="12" fontWeight="700"
        fill={C.textAccentTeal} textAnchor="end" style={{ letterSpacing: '0.06em' }}>
        {nodeCount} {nodeCount === 1 ? 'NODE' : 'NODES'}
      </text>
      <text x={x + w - 14} y={y + 44} fontSize="11" fill={C.textMuted}
        textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, monospace">
        {instanceType}
      </text>

      {itemRows.map((row, rowIdx) => {
        // Center each row independently so a partial last row (e.g. 5 = 3+2)
        // looks balanced rather than left-aligned.
        const rowWidth =
          row.reduce((acc, m) => acc + (m.ellipsis ? ellipsisW : miniW), 0) +
          (row.length - 1) * miniGap
        const rowStartX = x + (w - rowWidth) / 2
        const rowY = stripY + rowIdx * (miniH + miniGap)
        let cursor = rowStartX
        return (
          <g key={`row-${rowIdx}`}>
            {row.map((m, colIdx) => {
              const width = m.ellipsis ? ellipsisW : miniW
              const cx = cursor
              cursor += width + miniGap
              if (m.ellipsis) {
                return (
                  <text key={`e-${rowIdx}-${colIdx}`} x={cx + width / 2}
                    y={rowY + miniH / 2 + 4}
                    fontSize="17" fontWeight="700" fill={C.textMuted} textAnchor="middle">…</text>
                )
              }
              return (
                <g key={`n-${rowIdx}-${colIdx}`}>
                  <rect x={cx} y={rowY} width={miniW} height={miniH} rx={3}
                    fill={C.miniFill} stroke={accent} strokeWidth={1} />
                  <text x={cx + miniW / 2} y={rowY + miniH / 2 + 3.5}
                    fontSize="10" fontWeight="600" fill={C.textPrimary} textAnchor="middle">
                    {m.label}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      <text x={x + 18} y={y + h - 14} fontSize="10" fontWeight="700"
        fill={C.textMuted} style={{ letterSpacing: '0.12em' }}>{azsLabel}</text>
      {/* badges — right-aligned */}
      {badges.length > 0 && (
        <g transform={`translate(${x + w - badgesGroupWidth(badges) - 16}, ${y + h - 26})`}>
          {badges.map((label, i) => <Badge key={label} label={label} x={i * 82} />)}
        </g>
      )}
    </g>
  )
}

export function ControlPlaneCard({
  x, y, w = 220, h = 110,
  title, ramLabel, instanceType,
  nodeCount = 3, nodePrefix,
  color = 'gray', icon, onClick, componentId,
}) {
  const C = useDiagramColors()
  const accent = ACCENT[color] || ACCENT.gray
  const handleClick = () => onClick && onClick(componentId)
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }
  // Mini-node grid below the title/ram-label, max 2 per row so 3 nodes
  // wrap into a 2+1 grid (true "stacked horizontally AND vertically"
  // like the tier cards). Sizing matches TierFleetCard.
  const miniW = 60, miniH = 22, miniGap = 4
  const MAX_COLS = 2
  const items = Array.from({ length: nodeCount }, (_, i) => ({ label: `${nodePrefix}-${i + 1}` }))
  const itemRows = []
  for (let i = 0; i < items.length; i += MAX_COLS) {
    itemRows.push(items.slice(i, i + MAX_COLS))
  }
  const stripY = y + 56

  return (
    <g className="diagram-node" onClick={handleClick} onKeyDown={handleKey}
      tabIndex={0} role="button" aria-label={title}>
      <rect x={x} y={y} width={w} height={h} rx={10} ry={10}
        fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth={1.5} />
      <rect x={x} y={y} width={6} height={h} rx={3} ry={3} fill={accent} />

      {icon && <DiagramIcon type={icon} x={x + 12} y={y + 8} size={24} />}

      <text className="diagram-label" x={x + (icon ? 42 : 16)} y={y + 22}
        fontSize="14" fontWeight="700" fill={C.textPrimary}>{title}</text>
      <text className="diagram-label" x={x + (icon ? 42 : 16)} y={y + 40}
        fontSize="12" fill={C.textMuted}>
        {ramLabel} · <tspan fontFamily="ui-monospace, SFMono-Regular, monospace">{instanceType}</tspan>
      </text>

      {itemRows.map((row, rowIdx) => {
        // Center each row independently so the trailing partial row sits balanced.
        const rowWidth = row.length * miniW + (row.length - 1) * miniGap
        const rowStartX = x + (w - rowWidth) / 2
        const rowY = stripY + rowIdx * (miniH + miniGap)
        return (
          <g key={`row-${rowIdx}`}>
            {row.map((m, colIdx) => {
              const cx = rowStartX + colIdx * (miniW + miniGap)
              return (
                <g key={`n-${rowIdx}-${colIdx}`}>
                  <rect x={cx} y={rowY} width={miniW} height={miniH} rx={3}
                    fill={C.miniFill} stroke={accent} strokeWidth={1} />
                  <text x={cx + miniW / 2} y={rowY + miniH / 2 + 3.5}
                    fontSize="10" fontWeight="600" fill={C.textPrimary} textAnchor="middle">
                    {m.label}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </g>
  )
}

function Badge({ label, x = 0 }) {
  const BC = useBadgeColors()
  const c = BC[label] || BC.OPTIONAL
  const w = label.length * 6.2 + 14
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect width={w} height={16} rx={8} ry={8}
        fill={c.fill} stroke={c.stroke} strokeWidth={1} />
      <text x={w / 2} y={11} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={c.text} style={{ letterSpacing: '0.05em' }}>{label}</text>
    </g>
  )
}

export function Arrow({ d, kind = 'data', variant, label }) {
  const stroke = ARROW[kind] || ARROW.muted
  const dashed = variant === 'dashed' || (variant == null && (kind === 'policy' || kind === 'export'))
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={2}
        strokeDasharray={dashed ? '6 4' : undefined}
        strokeLinejoin="round" strokeLinecap="round"
        markerEnd={`url(#arrow-${kind})`}
      />
      {label && (
        <text className="diagram-label" fill="#8B949E" fontSize="11">{label}</text>
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

export function StageHeader({ stages }) {
  const C = useDiagramColors()
  return (
    <g>
      {stages.map((s, i) => {
        const n = i + 1
        return (
          <g key={s.label}>
            <circle cx={s.x + 14} cy={26} r={12}
              fill={C.stageCircleBg} stroke={C.stageCircleStroke} strokeWidth={1.5} />
            <text x={s.x + 14} y={30} textAnchor="middle"
              fontSize="12" fontWeight="700" fill={C.stageCircleText}>{n}</text>
            <text x={s.x + 34} y={32} fontSize="14" fontWeight="700"
              fill={C.stageLabel} style={{ letterSpacing: '0.14em' }}>{s.label}</text>
          </g>
        )
      })}
      <line x1={30} y1={48}
        x2={stages[stages.length - 1].x + stages[stages.length - 1].width} y2={48}
        stroke={C.stageSeparator} strokeWidth={1} />
    </g>
  )
}

export function SwimLane({ x, y, width, height }) {
  const C = useDiagramColors()
  return (
    <rect x={x - 12} y={y} width={width + 24} height={height} rx={14}
      fill={C.swimFill} stroke={C.swimStroke} strokeWidth={1} />
  )
}

export function Defs() {
  return (
    <defs>
      {Object.entries(ARROW).map(([key, color]) => (
        <marker key={key} id={`arrow-${key}`}
          viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  )
}

export function Legend({ x, y, width = 520 }) {
  const C = useDiagramColors()
  const q = (width - 64) / 4
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={width} height={56} rx={8} fill={C.legendFill} stroke={C.legendStroke} />
      <text x={16} y={20} fontSize="11" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.16em' }}>LEGEND</text>
      <LegendItem x={64}           y={40} C={C} color={ARROW.data}   label="primary data flow" />
      <LegendItem x={64 + q}       y={40} C={C} color={ARROW.policy} label="control / policy" dashed />
      <LegendItem x={64 + q * 2}   y={40} C={C} color={ARROW.export} label="CISA / FBI export" dashed />
      <g transform={`translate(${64 + q * 3}, 30)`}>
        <rect width={20} height={10} fill={C.nodeFill} stroke={ACCENT.teal} strokeDasharray="4 3" />
        <text x={28} y={9} fontSize="12" fill={C.textPrimary}>
          dashed border = optional / unmounted
        </text>
      </g>
    </g>
  )
}

function LegendItem({ x, y, C, color, label, dashed }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={0} x2={30} y2={0} stroke={color} strokeWidth={2}
        strokeDasharray={dashed ? '6 4' : undefined} strokeLinecap="round" />
      <text x={40} y={4} fontSize="12" fill={C.textPrimary}>{label}</text>
    </g>
  )
}
