import React from 'react'
import { EuiIcon } from '@elastic/eui'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  ACCENT, ARROW, arrowPath, zpath, zpathV, useDiagramTheme,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',                    x: 30,   width: 200 },
  { label: 'COLLECTION',                 x: 258,  width: 200 },
  { label: 'ELASTIC SEARCH AI PLATFORM', x: 486,  width: 422 },
  { label: 'CEM',                        x: 936,  width: 270 },
  { label: 'THIRF',                      x: 1234, width: 270 },
]

const SWIM_Y      = 60
const SWIM_H      = 840
const SNAP_BAND_Y = 916
const SNAP_Y      = 940

const SOC = { cx: 1010, cy: 1370 }
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

  const HOT_CX      = 641
  const TIER_RIGHT  = 786
  const CP_LABEL_Y  = 662
  const CP_CARD_Y   = 670
  const ILM_Y       = 772
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
    <svg viewBox="0 0 2020 1712"
      className="w-full h-auto"
      style={{ backgroundColor: isDark ? '#0D1117' : '#FFFFFF' }}
      role="img" aria-label={`Level 4 architecture diagram — ${s.label} size`}>
      <Defs />

      {/* ===== PIPELINE SECTION ===== */}
      {STAGES.map(stg => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}
      <StageHeader stages={STAGES} />

      {/* ── Sources ── */}
      <Node x={30} y={72}  title="Log Sources" subtitle="Full Appendix B coverage"
        color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={30} y={212} title="Legacy / OT" subtitle="Syslog · SNMP · ICS"
        color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      {/* ── Collection (5 nodes at L4) ── */}
      <Node x={258} y={72}  title="Elastic Agent"      subtitle="ECS-normalized at edge"
        color="teal" icon="logoBeats"    onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={258} y={212} title="Fleet Server"        subtitle="Agent policy plane"
        color="teal" icon="gear"         onClick={onNodeClick} componentId="fleetServer" />
      <Node x={258} y={352} title="Logstash"            subtitle="Legacy / OT pipeline"
        color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />
      <Node x={258} y={492} title="Ingest Pipelines"   subtitle="40–60% volume reduction"
        color="teal" icon="pipelineApp" onClick={onNodeClick} componentId="ingestPipelines" badges={['L4']} />
      <Node x={258} y={632} w={220} h={130}
        title="Sensitive Data Protection" color="coral" icon="lock"
        bullets={['Redact processor', 'NER via ELSER', 'Anonymization processor']}
        onClick={onNodeClick} componentId="sensitiveDataProtection" />

      {/* ── ES AI Platform — 4 tiers ── */}
      <TierFleetCard x={496} y={72} w={290} h={130}
        title="Hot Tier" subtitle="3 days SSD" color="orange" icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="hotTier" />
      <TierFleetCard x={496} y={222} w={290} h={130}
        title="Cold Tier" subtitle="7 days" color="blue" icon="logoElasticsearch"
        nodeCount={coldCount} nodePrefix="cold" instanceType={s.instanceTypes.cold}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="coldTier" />
      <TierFleetCard x={496} y={372} w={290} h={130}
        title="Frozen Tier" subtitle="→ 6 / 12 months (searchable snapshot)"
        color="purple" icon="logoElasticsearch"
        nodeCount={frozenCnt} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="frozenTier" />
      <TierFleetCard x={496} y={522} w={290} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM`}
        color="cyan" icon="machineLearningApp"
        nodeCount={mlCount} nodePrefix="ml" instanceType={s.instanceTypes.ml}
        onClick={onNodeClick} componentId="mlNodes" />

      {/* Control plane */}
      <text x={486} y={CP_LABEL_Y} fontSize="9.5" fontWeight="700" fill={C.controlLabel}
        style={{ letterSpacing: '0.16em' }}>CONTROL PLANE (FIXED ACROSS SIZES)</text>
      <ControlPlaneCard x={486} y={CP_CARD_Y} w={148} h={90}
        title="Master Nodes" ramLabel={`${s.masterNodeRamGB} GB`} instanceType={s.instanceTypes.master}
        nodeCount={masterCnt} nodePrefix="master" color="gray" icon="logoElasticsearch"
        onClick={onNodeClick} componentId="masterNodes" />
      <ControlPlaneCard x={640} y={CP_CARD_Y} w={148} h={90}
        title="Kibana" ramLabel={`${s.kibanaRamGB} GB`} instanceType={s.instanceTypes.kibana}
        nodeCount={kibanaCnt} nodePrefix="kib" color="pink" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes" />

      {/* ILM + SLM — below control plane */}
      <Node x={486} y={ILM_Y} w={306} h={60}
        title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots"
        color="green" icon="indexManagementApp" onClick={onNodeClick} componentId="ilm" />

      {/* ── CEM — same detection stack as L3 ── */}
      <Node x={946} y={72}  w={250} h={100}
        title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt"
        color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L4']} />
      <Node x={946} y={222} w={250} h={100}
        title="IOC Matching" subtitle="STIX/TAXII · CISA KEV"
        color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" />
      <Node x={946} y={372} w={250} h={100}
        title="Alert Correlator" subtitle="Risk scoring → SIEM"
        color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" />
      <Node x={946} y={522} w={250} h={100}
        title="Kibana / SIEM" subtitle="Elastic Security · Federated SOC"
        color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* ── THIRF ── */}
      <Node x={1244} y={72} w={250} h={100}
        title="CISA / FBI Export" subtitle="On-request — documented &amp; tested"
        color="coral" icon="exportAction" onClick={onNodeClick} componentId="cisaExport"
        badges={['L4']} />
      <Node x={1244} y={222} w={250} h={100}
        title="Cross-Cluster Search" subtitle="Federated log retrieval"
        color="teal" icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccs"
        badges={['L4']} />

      {/* ── L4 Security Controls ── */}
      <text x={1524} y={72} fontSize="10" fontWeight="700" fill={C.securityPanelText}
        style={{ letterSpacing: '0.16em' }}>L4 SECURITY CONTROLS</text>
      <line x1={1524} y1={84} x2={1760} y2={84} stroke={C.securityPanelLine} strokeWidth={1} />
      <Node x={1524} y={96}  w={210} title="BYOK Encryption"   subtitle="AWS KMS · Azure KV · GCP KMS"
        color="yellow" dashed icon="lock" onClick={onNodeClick} componentId="byok" badges={['L4']} />
      <Node x={1524} y={216} w={210} title="NTP Time Sync"     subtitle="USNO / NIST traceable"
        color="yellow" dashed icon="clock" onClick={onNodeClick} componentId="ntp" badges={['L4']} />
      <Node x={1524} y={336} w={210} title="Cross-Cluster Repl" subtitle="Optional resilience"
        color="teal" dashed icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccr"
        badges={['OPTIONAL']} />

      {/* ── Long-term object storage band ── */}
      <rect x={468} y={SNAP_BAND_Y} width={410} height={106} rx={10}
        fill={C.bandFill} stroke={C.bandStroke} strokeWidth={1} />
      <text x={486} y={932} fontSize="9.5" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.14em' }}>LONG-TERM OBJECT STORAGE (SLM)</text>
      <Node x={486} y={SNAP_Y} w={280} h={82}
        title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted"
        color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo"
        badges={['UNMOUNTED']} />

      {/* ── Pipeline Arrows ── */}
      <Arrow d={arrowPath(230, 122, 258, 122)} kind="data" />
      <Arrow d={zpath(230, 262, 258, 402, 244)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(358, 212, 358, 172)} kind="policy" />
      <Arrow d="M 358 172 L 460 172 L 460 462 L 358 462 L 358 492" kind="data" />
      <Arrow d={arrowPath(358, 452, 358, 492)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(358, 592, 358, 632)} kind="data" />
      {/* Sensitive Data Protection → Hot (card is now h=130, center y=697) */}
      <Arrow d={zpath(478, 697, 496, 137, 487)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 202, HOT_CX, 222)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 352, HOT_CX, 372)} kind="data" />
      {/* ILM → Snapshot 12-mo */}
      <Arrow d={zpathV(639, ILM_BOTTOM, 626, SNAP_Y, 873)} kind="data" />
      {/* Cold → AI/ML (CEM) */}
      <Arrow d={zpath(TIER_RIGHT, 287, 946, 122, 910)} kind="data" />
      <Arrow d={arrowPath(1071, 172, 1071, 222)} kind="data" />
      <Arrow d={arrowPath(1071, 322, 1071, 372)} kind="data" />
      <Arrow d={arrowPath(1071, 472, 1071, 522)} kind="data" />
      <Arrow d={zpath(1196, 572, 1244, 122, 1220)} kind="export" />

      {/* ===== DIVIDER + FEDERATION HEADER ===== */}
      <line x1={30} y1={1046} x2={1980} y2={1046} stroke={C.federationDivider} strokeWidth={1} />
      <text x={30} y={1076} fontSize="13" fontWeight="700" fill={C.federationLabel}
        style={{ letterSpacing: '0.18em' }}>FEDERATED SOC TOPOLOGY</text>
      <text x={30} y={1096} fontSize="11" fill={C.federationDesc}>
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
              <text x={labelX} y={labelY} fontSize="10" fill={C.federationSpoke} fontWeight="700"
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
          fontSize="14" fontWeight="700" fill={C.federationText}>Agency SOC</text>
        <text x={SOC.cx} y={SOC.cy + 28} textAnchor="middle"
          fontSize="11" fill={C.federationSub}>Federated hub</text>
        <g transform={`translate(${SOC.cx - 22}, ${SOC.cy + 38})`}>
          <rect width={44} height={16} rx={8}
            fill={C.federationBadgeBg} stroke={C.federationBadgeStroke} />
          <text x={22} y={11} textAnchor="middle" fontSize="9" fontWeight="700"
            fill={C.federationBadgeText} style={{ letterSpacing: '0.05em' }}>L4</text>
        </g>
      </g>

      {placed.map(sp => (
        <Node key={sp.id} x={sp.x} y={sp.y} w={W} h={H}
          title={sp.label} subtitle={sp.sub} color={sp.color} dashed={sp.dashed}
          onClick={onNodeClick} componentId={sp.componentId}
          badges={sp.dashed ? [] : ['L4']} />
      ))}

      <Legend x={30} y={1640} width={1940} />
    </svg>
  )
}
