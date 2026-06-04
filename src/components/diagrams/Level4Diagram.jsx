import React from 'react'
import { EuiIcon } from '@elastic/eui'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  ACCENT, ARROW, arrowPath, zpath, zpathV, useDiagramTheme,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',                    x: 30,   width: 180, height: 270 },
  { label: 'COLLECTION',                 x: 265,  width: 200, height: 560 },
  { label: 'ELASTIC SEARCH AI PLATFORM', x: 520,  width: 422, height: 850 },
  { label: 'CEM',                        x: 997,  width: 230, height: 580 },
  { label: 'THIRF',                      x: 1282, width: 230, height: 700 },
]

const SWIM_Y      = 60
const SNAP_Y      = 1016

const SOC = { cx: 770, cy: 1446 }
const SPOKE_R = 220
const SOC_R   = 90

function radial(angleDeg, r = SPOKE_R) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: SOC.cx + r * Math.cos(rad), y: SOC.cy + r * Math.sin(rad) }
}

function spokeLine(targetX, targetY, halfW = 110, halfH = 40) {
  const dx = targetX - SOC.cx
  const dy = targetY - SOC.cy
  const len = Math.sqrt(dx * dx + dy * dy)
  const startInset = SOC_R + 4
  const endInset   = Math.min(halfW, halfH) + 12
  return {
    x1: SOC.cx + dx * (startInset / len),
    y1: SOC.cy + dy * (startInset / len),
    x2: SOC.cx + dx * ((len - endInset) / len),
    y2: SOC.cy + dy * ((len - endInset) / len),
  }
}

export default function Level4Diagram({ size = 'small', onNodeClick }) {
  const s         = getSizing(size)
  const hotCount  = getTierNodeCount('hot',    size)
  const coldCount = getTierNodeCount('cold',   size)
  const frozenCnt = getTierNodeCount('frozen', size)
  const mlCount   = getTierNodeCount('ml',     size)
  const masterCnt = getTierNodeCount('master', size)
  const kibanaCnt = getTierNodeCount('kibana', size)

  const { isDark, C } = useDiagramTheme()

  const HOT_CX      = 730
  const TIER_RIGHT  = 930
  const CP_LABEL_Y  = 690
  const CP_CARD_Y   = 700
  const ILM_Y       = 832
  const ILM_BOTTOM  = ILM_Y + 60

  const W = 220, H = 80
  const spokes = [
    { id: 'primaryCluster',   angle: 0,   label: 'Primary Cluster',          sub: 'Hot · Cold · Frozen',     color: 'blue',   componentId: 'hotTier' },
    { id: 'onPremStore',      angle: 60,  label: 'On-Prem Cold / Frozen',     sub: 'Sensitive workloads',     color: 'green',  componentId: 'onPremStore' },
    { id: 'cloudCold',        angle: 120, label: 'Cloud Cold (FedRAMP High)', sub: 'Elastic Cloud GovCloud',  color: 'green',  componentId: 'cloudCold' },
    { id: 'cloudObjectStore', angle: 180, label: 'Cloud Object Store',        sub: 'S3 / Azure Blob / GCS',   color: 'purple', componentId: 'cloudObjectStore' },
    { id: 'iotEdge',          angle: 240, label: 'IoT / OT Edge Cluster',     sub: 'Edge-buffered',           color: 'gray',   componentId: 'iotEdge' },
    { id: 'cisaSpoke',        angle: 300, label: 'CISA / FBI Export',         sub: 'Federated, pre-defined',  color: 'coral',  componentId: 'cisaExport', dashed: true },
  ]
  const placed = spokes.map(sp => {
    const c = radial(sp.angle)
    return { ...sp, cx: c.x, cy: c.y, x: c.x - W / 2, y: c.y - H / 2 }
  })

  return (
    <svg viewBox="0 0 1540 1830"
      className="w-full h-auto"
      style={{ backgroundColor: isDark ? '#0D1117' : '#FFFFFF' }}
      role="img" aria-label={`Level 4 architecture diagram — ${s.label} size`}>
      <Defs />

      {/* ===== PIPELINE SECTION ===== */}
      {STAGES.map(stg => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={stg.height} />
      ))}
      <StageHeader stages={STAGES} />

      {/* ── Sources ── */}
      <Node x={30} y={72} w={180} title="Log Sources" subtitle="Full Appendix B coverage"
        color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={30} y={212} w={180} title="Legacy / OT" subtitle="Syslog · SNMP · ICS"
        color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      {/* ── Collection ── */}
      <Node x={265} y={72} w={200} title="Elastic Agent" subtitle="ECS-normalized at edge"
        color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={265} y={212} w={200} title="Fleet Server"        subtitle="Agent policy plane"
        color="teal" icon="gear"         onClick={onNodeClick} componentId="fleetServer" />
      <Node x={265} y={352} w={200} title="Logstash"            subtitle="Legacy / OT pipeline"
        color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />
      <Node x={265} y={492} w={200} title="Ingest Pipelines"   subtitle="40–60% volume reduction"
        color="teal" icon="pipelineApp" onClick={onNodeClick} componentId="ingestPipelines" badges={['L4']} />

      {/* ── ES AI Platform — 4 tiers ── */}
      <TierFleetCard x={530} y={72} w={400} h={130}
        title="Hot Tier" subtitle="3 days SSD" color="orange" icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="hotTier" />
      <TierFleetCard x={530} y={222} w={400} h={130}
        title="Cold Tier" subtitle="7 days" color="blue" icon="logoElasticsearch"
        nodeCount={coldCount} nodePrefix="cold" instanceType={s.instanceTypes.cold}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="coldTier" />
      <TierFleetCard x={530} y={372} w={400} h={130}
        title="Frozen Tier" subtitle="→ 6 / 12 months (searchable snapshot)"
        color="purple" icon="logoElasticsearch"
        nodeCount={frozenCnt} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="frozenTier" />
      <TierFleetCard x={530} y={522} w={400} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM`}
        color="cyan" icon="machineLearningApp"
        nodeCount={mlCount} nodePrefix="ml" instanceType={s.instanceTypes.ml}
        onClick={onNodeClick} componentId="mlNodes" />

      {/* Control plane */}
      <line x1={530} y1={668} x2={930} y2={668} stroke={C.stageSeparator} strokeWidth={1} />
      <text x={530} y={CP_LABEL_Y} fontSize="10" fontWeight="700" fill={C.controlLabel}
        style={{ letterSpacing: '0.16em' }}>CONTROL PLANE</text>
      <text x={740} y={CP_LABEL_Y} fontSize="10" fontWeight="700" fill={C.controlLabel}
        style={{ letterSpacing: '0.16em' }}>PRESENTATION</text>
      <ControlPlaneCard x={530} y={CP_CARD_Y} w={200} h={120}
        title="Master Nodes" ramLabel={`${s.masterNodeRamGB} GB`} instanceType={s.instanceTypes.master}
        nodeCount={masterCnt} nodePrefix="master" color="gray" icon="logoElasticsearch"
        onClick={onNodeClick} componentId="masterNodes" />
      <ControlPlaneCard x={740} y={CP_CARD_Y} w={200} h={120}
        title="Kibana" ramLabel={`${s.kibanaRamGB} GB`} instanceType={s.instanceTypes.kibana}
        nodeCount={kibanaCnt} nodePrefix="kib" color="pink" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes" />

      {/* ILM + SLM — below control plane */}
      <Node x={530} y={ILM_Y} w={400} h={60}
        title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots"
        color="green" icon="indexManagementApp" onClick={onNodeClick} componentId="ilm" />

      {/* ── CEM — same detection stack as L3 ── */}
      <Node x={1007} y={72}  w={210} h={100}
        title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt"
        color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L4']} />
      <Node x={1007} y={222} w={210} h={100}
        title="IOC Matching" subtitle="STIX/TAXII · CISA KEV"
        color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" />
      <Node x={1007} y={372} w={210} h={100}
        title="Alert Correlator" subtitle="Risk scoring → SIEM"
        color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" />
      <Node x={1007} y={522} w={210} h={100}
        title="Kibana / SIEM" subtitle="Elastic Security · SOC"
        color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* ── THIRF ── */}
      <Node x={1292} y={72} w={210} h={100}
        title="CISA / FBI Export" subtitle="On-request export"
        color="coral" icon="exportAction" onClick={onNodeClick} componentId="cisaExport"
        badges={['L4']} />
      <Node x={1292} y={222} w={210} h={100}
        title="Cross-Cluster Search" subtitle="Federated log retrieval"
        color="teal" icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccs"
        badges={['L4']} />

      {/* ── L4 Security Controls (stacked beneath THIRF nodes) ── */}
      <line x1={1282} y1={352} x2={1512} y2={352} stroke={C.stageSeparator} strokeWidth={1} />
      <text x={1282} y={374} fontSize="10" fontWeight="700" fill={C.controlLabel}
        style={{ letterSpacing: '0.16em' }}>L4 SECURITY CONTROLS</text>
      <Node x={1292} y={390} w={210} title="BYOK Encryption"   subtitle="AWS KMS · Azure KV · GCP KMS"
        color="yellow" dashed icon="lock" onClick={onNodeClick} componentId="byok" badges={['L4']} />
      <Node x={1292} y={510} w={210} title="NTP Time Sync"     subtitle="USNO / NIST traceable"
        color="yellow" dashed icon="clock" onClick={onNodeClick} componentId="ntp" badges={['L4']} />
      <Node x={1292} y={630} w={210} title="Cross-Cluster Repl" subtitle="Optional resilience"
        color="teal" dashed icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccr"
        badges={['OPTIONAL']} />

      {/* ── Long-term object storage section ── */}
      <text x={265} y={984} fontSize="10" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.14em' }}>LONG-TERM OBJECT STORAGE (SLM)</text>
      <line x1={265} y1={992} x2={1227} y2={992} stroke={C.stageSeparator} strokeWidth={1} />
      <Node x={520} y={SNAP_Y} w={280} h={92}
        title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted"
        color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo"
        badges={['RETRIEVABLE']} />

      {/* ── Pipeline Arrows ── */}
      <Arrow d={arrowPath(210, 122, 265, 122)} kind="data" />
      <Arrow d={zpath(210, 262, 265, 402, 237)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(365, 212, 365, 172)} kind="policy" />
      {/* Agent → Ingest Pipelines — elbow out into gutter lane x=478, down, into IP right edge at y=542 */}
      <Arrow d="M 465 122 L 478 122 L 478 542 L 465 542" kind="data" />
      {/* Logstash → Ingest Pipelines (dashed) — Logstash bottom-mid to IP top-mid */}
      <Arrow d={arrowPath(365, 452, 365, 492)} kind="data" variant="dashed" />
      {/* IP → Hot — exits IP right edge at y=542 via lane x=492; horizontal into Hot */}
      <Arrow d="M 465 542 L 492 542 L 492 137 L 530 137" kind="data" />
      <Arrow d={arrowPath(HOT_CX, 202, HOT_CX, 222)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 352, HOT_CX, 372)} kind="data" />
      {/* ILM → Snapshot 12-mo */}
      {/* ILM → Snap12 — lane x=750 past title, midY=945 below title (title y=932) */}
      <Arrow d={zpathV(750, ILM_BOTTOM, 660, SNAP_Y, 1004)} kind="data" />
      {/* Cold → AI/ML (CEM) */}
      <Arrow d={zpath(TIER_RIGHT, 287, 1007, 122, 970)} kind="data" />
      <Arrow d={arrowPath(1112, 172, 1112, 222)} kind="data" />
      <Arrow d={arrowPath(1112, 322, 1112, 372)} kind="data" />
      <Arrow d={arrowPath(1112, 472, 1112, 522)} kind="data" />
      <Arrow d={zpath(1217, 572, 1292, 122, 1255)} kind="export" />

      {/* ===== DIVIDER + FEDERATION HEADER ===== */}
      <line x1={30} y1={1122} x2={1510} y2={1122} stroke={C.federationDivider} strokeWidth={1} />
      <text x={30} y={1152} fontSize="14" fontWeight="700" fill={C.federationLabel}
        style={{ letterSpacing: '0.18em' }}>FEDERATED SOC TOPOLOGY</text>
      <text x={30} y={1172} fontSize="12" fill={C.federationDesc}>
        Agency SOC at center; spokes reach every distributed log store via Cross-Cluster Search.
        Storage may be decentralized but logs must remain readily available to the top-level agency SOC.
      </text>

      {/* ===== FEDERATION HUB ===== */}
      <circle cx={SOC.cx} cy={SOC.cy} r={SPOKE_R + 56}
        fill={C.federationRingFill} stroke={C.federationRingStroke} strokeDasharray="2 4" />

      {placed.map(sp => {
        const ln = spokeLine(sp.cx, sp.cy, W / 2, H / 2)
        const midX = (ln.x1 + ln.x2) / 2
        const midY = (ln.y1 + ln.y2) / 2
        const tangentRad = (sp.angle * Math.PI) / 180
        const off = 20
        const labelX = midX + Math.cos(tangentRad) * off
        const labelY = midY + Math.sin(tangentRad) * off + 3
        return (
          <g key={`spoke-${sp.id}`}>
            <line
              x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
              stroke={sp.dashed ? ARROW.export : ARROW.data}
              strokeWidth={2}
              strokeDasharray={sp.dashed ? '6 4' : undefined}
              strokeLinecap="round"
              markerEnd={`url(#arrow-${sp.dashed ? 'export' : 'data'})`}
            />
            {!sp.dashed && (
              <text x={labelX} y={labelY} fontSize="11" fill={C.federationSpoke} fontWeight="700"
                textAnchor="middle" style={{ letterSpacing: '0.12em' }}>CCS</text>
            )}
          </g>
        )
      })}

      {/* Agency SOC hub */}
      <g
        className="diagram-node"
        onClick={() => onNodeClick && onNodeClick('soc')}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick && onNodeClick('soc') } }}
        tabIndex={0} role="button" aria-label="Agency SOC"
      >
        <circle cx={SOC.cx} cy={SOC.cy} r={SOC_R}
          fill={C.federationSOCFill} stroke={ACCENT.coral} strokeWidth={2.5} />
        <foreignObject x={SOC.cx - 18} y={SOC.cy - 38} width={36} height={36}>
          <div xmlns="http://www.w3.org/1999/xhtml"
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EuiIcon type="logoSecurity" size="xl" />
          </div>
        </foreignObject>
        <text x={SOC.cx} y={SOC.cy + 10} textAnchor="middle"
          fontSize="15" fontWeight="700" fill={C.federationText}>Agency SOC</text>
        <text x={SOC.cx} y={SOC.cy + 28} textAnchor="middle"
          fontSize="12" fill={C.federationSub}>Federated hub</text>
        <g transform={`translate(${SOC.cx - 22}, ${SOC.cy + 38})`}>
          <rect width={44} height={16} rx={8}
            fill={C.federationBadgeBg} stroke={C.federationBadgeStroke} />
          <text x={22} y={11} textAnchor="middle" fontSize="10" fontWeight="700"
            fill={C.federationBadgeText} style={{ letterSpacing: '0.05em' }}>L4</text>
        </g>
      </g>

      {placed.map(sp => (
        <Node key={sp.id} x={sp.x} y={sp.y} w={W} h={H}
          title={sp.label} subtitle={sp.sub} color={sp.color} dashed={sp.dashed}
          onClick={onNodeClick} componentId={sp.componentId}
          badges={sp.dashed ? [] : ['L4']} />
      ))}

      <Legend x={30} y={1720} width={1480} />
    </svg>
  )
}
