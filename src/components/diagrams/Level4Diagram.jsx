import React from 'react'
import {
  Node, Arrow, Defs, Legend, StageHeader, SwimLane, ACCENT, ARROW,
  arrowPath, zpath,
} from './primitives.jsx'

// At L4 the COLLECTION stage widens to include Cribl + PII Masking as a
// second sub-column ("pre-storage enrichment"), and ELASTIC STACK widens to
// include tiers + ML sub-columns. Stage labels still match the spec.
const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 500 },
  { label: 'ELASTIC STACK',    x: 880,  width: 500 },
  { label: 'LONG-TERM STORAGE',x: 1440, width: 220 },
  { label: 'SOC ACCESS',       x: 1720, width: 220 },
]

const PIPELINE_SWIM_Y = 70
const PIPELINE_SWIM_H = 550

// Federation hub geometry
const SOC = { cx: 980, cy: 940 }
const SPOKE_R = 220
const SOC_R = 88

function radial(angleDeg, r = SPOKE_R) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: SOC.cx + r * Math.cos(rad), y: SOC.cy + r * Math.sin(rad) }
}

function spokeLine(targetX, targetY, halfW = 110, halfH = 40) {
  const dx = targetX - SOC.cx
  const dy = targetY - SOC.cy
  const len = Math.sqrt(dx * dx + dy * dy)
  const startInset = SOC_R + 4
  const endInset = Math.min(halfW, halfH) + 12
  return {
    x1: SOC.cx + dx * (startInset / len),
    y1: SOC.cy + dy * (startInset / len),
    x2: SOC.cx + dx * ((len - endInset) / len),
    y2: SOC.cy + dy * ((len - endInset) / len),
  }
}

export default function Level4Diagram({ onNodeClick }) {
  const W = 220, H = 80
  const spokes = [
    { id: 'primaryCluster', angle: 0,   label: 'Primary Cluster',          sub: 'Hot · Cold · Frozen',     color: 'blue',   componentId: 'hotTier' },
    { id: 'onPremStore',    angle: 60,  label: 'On-Prem Cold / Frozen',     sub: 'Sensitive workloads',     color: 'green',  componentId: 'onPremStore' },
    { id: 'cloudCold',      angle: 120, label: 'Cloud Cold (FedRAMP High)', sub: 'Elastic Cloud GovCloud',  color: 'green',  componentId: 'cloudCold' },
    { id: 'cloudObjectStore', angle: 180, label: 'Cloud Object Store',      sub: 'S3 / Azure Blob / GCS',   color: 'purple', componentId: 'cloudObjectStore' },
    { id: 'iotEdge',        angle: 240, label: 'IoT / OT Edge Cluster',     sub: 'Edge-buffered',           color: 'gray',   componentId: 'iotEdge' },
    { id: 'cisaExport',     angle: 300, label: 'CISA / FBI Export',         sub: 'Federated, pre-defined',  color: 'coral',  componentId: 'cisaExport', dashed: true },
  ]
  const placed = spokes.map((s) => {
    const c = radial(s.angle)
    return { ...s, cx: c.x, cy: c.y, x: c.x - W / 2, y: c.y - H / 2 }
  })

  return (
    <svg
      viewBox="0 0 1980 1280"
      className="w-full h-auto"
      role="img"
      aria-label="Level 4 architecture diagram — federated topology"
    >
      <Defs />

      {/* ====== PIPELINE SECTION ====== */}
      {STAGES.map((s) => (
        <SwimLane key={s.label} x={s.x} y={PIPELINE_SWIM_Y} width={s.width} height={PIPELINE_SWIM_H} />
      ))}
      <StageHeader stages={STAGES} />

      {/* Sources */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Full Appendix B coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      {/* Collection — sub-col 2a (Agent, Fleet, Logstash) */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="ECS-normalized at edge" color="teal" icon="/brand/icon-logging.svg" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="/brand/icon-infra.svg" onClick={onNodeClick} componentId="logstash" />

      {/* Collection — sub-col 2b (Cribl + PII Masking) */}
      <Node x={600} y={80}  title="Cribl Stream" subtitle="40–60% volume reduction" color="teal" icon="/brand/icon-infra.svg" onClick={onNodeClick} componentId="cribl" badges={['L4']} />
      <Node x={600} y={220} title="PII Masking" subtitle="Pre-storage redaction" color="coral" icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="piiMasking" />

      {/* Elastic Stack — tiers */}
      <Node x={880} y={80}  title="Hot Tier" subtitle="3 days SSD" color="blue" onClick={onNodeClick} componentId="hotTier" badges={['SEARCHABLE']} />
      <Node x={880} y={220} title="Cold Tier" subtitle="7 days" color="green" onClick={onNodeClick} componentId="coldTier" badges={['SEARCHABLE']} />
      <Node x={880} y={360} title="Frozen Tier" subtitle="→ 12 months" color="gray" onClick={onNodeClick} componentId="frozenTier" badges={['SEARCHABLE']} />

      {/* Elastic Stack — ML */}
      <Node x={1160} y={80}  title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt" color="purple" icon="/brand/icon-ai.svg" onClick={onNodeClick} componentId="ml" badges={['L4']} />
      <Node x={1160} y={220} title="IOC Matching" subtitle="STIX/TAXII · CISA KEV" color="purple" icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="iocMatching" />
      <Node x={1160} y={360} title="Alert Correlator" subtitle="Risk scoring → SIEM" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="alertCorrelator" />

      {/* ILM bar spanning the Elastic Stack stage */}
      <Node x={880} y={500} w={500} title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots" color="green" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ilm" />

      {/* Long-term storage */}
      <Node x={1440} y={80}  title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      {/* SOC Access — Kibana lives here; the SOC hub itself is in the federation section below */}
      <Node x={1720} y={80}  title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="kibana" />

      {/* === Pipeline arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      {/* Fleet policy */}
      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Agent + Logstash → Cribl */}
      <Arrow d={arrowPath(540, 130, 600, 130)} kind="data" />
      <Arrow d={zpath(540, 410, 600, 130, 570)} kind="data" />

      {/* Cribl → PII Masking (vertical inside sub-col 2b) */}
      <Arrow d={arrowPath(710, 180, 710, 220)} kind="data" />

      {/* PII → Hot via lane x=850 */}
      <Arrow d={zpath(820, 270, 880, 130, 850)} kind="data" />

      {/* Tier ILM chain */}
      <Arrow d={arrowPath(990, 180, 990, 220)} kind="data" />
      <Arrow d={arrowPath(990, 320, 990, 360)} kind="data" />

      {/* Cold → AI/ML via lane x=1130 */}
      <Arrow d={zpath(1100, 270, 1160, 130, 1130)} kind="data" />

      {/* ML chain */}
      <Arrow d={arrowPath(1270, 180, 1270, 220)} kind="data" />
      <Arrow d={arrowPath(1270, 320, 1270, 360)} kind="data" />

      {/* Correlator → Kibana — lane x=1410, across at y=200 */}
      <Arrow d="M 1380 410 L 1410 410 L 1410 200 L 1720 200 L 1720 130" kind="data" />

      {/* Frozen → Snap12 (SLM) — lane x=1130 down to row-3-bottom y=480, across to x=1420, up to row 1 */}
      <Arrow d="M 1100 410 L 1130 410 L 1130 480 L 1420 480 L 1420 130 L 1440 130" kind="data" />

      {/* ====== DIVIDER + FEDERATION HEADER ====== */}
      <line x1={40} y1={660} x2={1940} y2={660} stroke="#2A3344" strokeWidth={1} />
      <text x={40} y={690} fontSize="13" fontWeight="700" fill="#E6EDF3" style={{ letterSpacing: '0.18em' }}>
        FEDERATED SOC TOPOLOGY
      </text>
      <text x={40} y={710} fontSize="11" fill="#8B949E">
        Agency SOC at the center; spokes reach every distributed log store via Cross-Cluster Search. Storage may be decentralized but logs must remain readily available to the top-level agency SOC.
      </text>

      {/* ====== FEDERATION HUB ====== */}
      {/* Subtle backdrop for the hub area */}
      <circle cx={SOC.cx} cy={SOC.cy} r={SPOKE_R + 56} fill="#0F1620" stroke="#1F2A3A" strokeDasharray="2 4" />

      {/* Spoke lines (rendered before nodes so they appear behind) */}
      {placed.map((s) => {
        const ln = spokeLine(s.cx, s.cy, W / 2, H / 2)
        // Offset the CCS label tangentially from the line midpoint so it sits
        // beside the spoke rather than on top of it. Tangent direction is the
        // spoke angle (rotated 90° from the radial direction).
        const midX = (ln.x1 + ln.x2) / 2
        const midY = (ln.y1 + ln.y2) / 2
        const tangentRad = (s.angle * Math.PI) / 180
        const off = 20
        const labelX = midX + Math.cos(tangentRad) * off
        const labelY = midY + Math.sin(tangentRad) * off + 3 // +3 so text baseline visually centers
        return (
          <g key={`spoke-${s.id}`}>
            <line
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke={s.dashed ? ARROW.export : ARROW.data}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              strokeLinecap="round"
              markerEnd={`url(#arrow-${s.dashed ? 'export' : 'data'})`}
            />
            {!s.dashed && (
              <text
                x={labelX}
                y={labelY}
                fontSize="10"
                fill="#6FDCD3"
                fontWeight="700"
                textAnchor="middle"
                style={{ letterSpacing: '0.12em' }}
              >
                CCS
              </text>
            )}
          </g>
        )
      })}

      {/* Agency SOC at center */}
      <g
        className="diagram-node"
        onClick={() => onNodeClick && onNodeClick('soc')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick && onNodeClick('soc') } }}
        tabIndex={0}
        role="button"
        aria-label="Agency SOC"
      >
        <circle cx={SOC.cx} cy={SOC.cy} r={SOC_R} fill="#161B22" stroke={ACCENT.coral} strokeWidth={2.5} />
        <image href="/brand/icon-siem.svg" x={SOC.cx - 18} y={SOC.cy - 38} width={36} height={36} />
        <text x={SOC.cx} y={SOC.cy + 10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#E6EDF3">Agency SOC</text>
        <text x={SOC.cx} y={SOC.cy + 28} textAnchor="middle" fontSize="11" fill="#8B949E">Federated hub</text>
        <g transform={`translate(${SOC.cx - 22}, ${SOC.cy + 38})`}>
          <rect width={44} height={16} rx={8} fill="#1A2A2E" stroke={ACCENT.teal} />
          <text x={22} y={11} textAnchor="middle" fontSize="9" fontWeight="700" fill="#6FDCD3" style={{ letterSpacing: '0.05em' }}>L4</text>
        </g>
      </g>

      {/* Spoke nodes */}
      {placed.map((s) => (
        <Node
          key={s.id}
          x={s.x}
          y={s.y}
          w={W}
          h={H}
          title={s.label}
          subtitle={s.sub}
          color={s.color}
          dashed={s.dashed}
          onClick={onNodeClick}
          componentId={s.componentId}
          badges={s.dashed ? [] : ['L4']}
        />
      ))}

      {/* Right-side support / control plane column */}
      <text x={1720} y={690} fontSize="11" fontWeight="700" fill="#E6EDF3" style={{ letterSpacing: '0.18em' }}>
        SUPPORT INFRASTRUCTURE
      </text>
      <line x1={1720} y1={702} x2={1940} y2={702} stroke="#2A3344" strokeWidth={1} />
      <Node x={1720} y={720} w={220} title="BYOK Encryption" subtitle="AWS KMS · Azure KV · GCP KMS" color="yellow" dashed onClick={onNodeClick} componentId="byok" badges={['L4']} />
      <Node x={1720} y={840} w={220} title="NTP Time Sync" subtitle="USNO / NIST traceable" color="yellow" dashed onClick={onNodeClick} componentId="ntp" badges={['L4']} />
      <Node x={1720} y={960} w={220} title="Cross-Cluster Search" subtitle="Federation mechanism" color="teal" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ccs" badges={['L4']} />
      <Node x={1720} y={1080} w={220} title="Cross-Cluster Replication" subtitle="Optional resilience" color="teal" dashed icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ccr" badges={['OPTIONAL']} />

      <Legend x={40} y={1200} />
    </svg>
  )
}
