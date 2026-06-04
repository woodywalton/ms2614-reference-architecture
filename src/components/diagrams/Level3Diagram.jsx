import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, zpathV, useDiagramTheme,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',                    x: 30,   width: 180, height: 270 },
  { label: 'COLLECTION',                 x: 265,  width: 200, height: 420 },
  { label: 'ELASTIC SEARCH AI PLATFORM', x: 520,  width: 422, height: 850 },
  { label: 'CEM',                        x: 997,  width: 230, height: 580 },
  { label: 'THIRF',                      x: 1282, width: 230, height: 130 },
]

const SWIM_Y      = 60
const SNAP_Y      = 976
const LEG_Y       = 1084

export default function Level3Diagram({ size = 'small', onNodeClick }) {
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

  return (
    <svg viewBox="0 0 1540 1180"
      className="w-full h-auto"
      style={{ backgroundColor: isDark ? '#0B1628' : '#FFFFFF' }}
      role="img" aria-label={`Level 3 architecture diagram — ${s.label} size`}>
      <Defs />

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
      <Node x={265} y={72} w={200} title="Elastic Agent" subtitle="Complete Fleet inventory"
        color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={265} y={212} w={200} title="Fleet Server"  subtitle="Agent policy plane"
        color="teal" icon="gear"      onClick={onNodeClick} componentId="fleetServer" />
      <Node x={265} y={352} w={200} title="Logstash"      subtitle="Legacy / OT pipeline"
        color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />

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
        title="Frozen Tier" subtitle="→ 3 / 12 months (searchable snapshot)"
        color="purple" icon="logoElasticsearch"
        nodeCount={frozenCnt} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="frozenTier" />
      <TierFleetCard x={530} y={522} w={400} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM · active at L3`}
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

      {/* ── CEM — detection stack + SIEM ── */}
      <Node x={1007} y={72}  w={210} h={100}
        title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt"
        color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L3']} />
      <Node x={1007} y={222} w={210} h={100}
        title="IOC Matching" subtitle="STIX/TAXII · CISA KEV"
        color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" badges={['L3']} />
      <Node x={1007} y={372} w={210} h={100}
        title="Alert Correlator" subtitle="Risk scoring → SIEM"
        color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" badges={['L3']} />
      <Node x={1007} y={522} w={210} h={100}
        title="Kibana / SIEM" subtitle="Elastic Security · Detection"
        color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* ── THIRF ── */}
      <Node x={1292} y={72} w={210} h={100}
        title="CISA / FBI Export" subtitle="On-request export"
        color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport"
        badges={['OPTIONAL']} />

      {/* ── Long-term object storage section ── */}
      <text x={265} y={944} fontSize="10" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.14em' }}>LONG-TERM OBJECT STORAGE (SLM)</text>
      <line x1={265} y1={952} x2={1227} y2={952} stroke={C.stageSeparator} strokeWidth={1} />
      <Node x={520} y={SNAP_Y} w={280} h={92}
        title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted"
        color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo"
        badges={['RETRIEVABLE']} />

      {/* ── Arrows ── */}
      <Arrow d={arrowPath(210, 122, 265, 122)} kind="data" />
      <Arrow d={zpath(210, 262, 265, 402, 237)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(365, 212, 365, 172)} kind="policy" />
      {/* Agent → Hot — straight horizontal */}
      <Arrow d={arrowPath(465, 122, 530, 122)} kind="data" />
      {/* Logstash → Hot (dashed, legacy) — enters Hot lower portion via gutter lane x=492 */}
      <Arrow d="M 465 402 L 492 402 L 492 182 L 530 182" kind="data" variant="dashed" />
      <Arrow d={arrowPath(HOT_CX, 202, HOT_CX, 222)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 352, HOT_CX, 372)} kind="data" />
      {/* ILM → Snapshot 12-mo */}
      {/* ILM → Snap12 — lane x=750 past title, midY=905 below title (title y=892) */}
      <Arrow d={zpathV(750, ILM_BOTTOM, 660, SNAP_Y, 964)} kind="data" />
      {/* Cold → AI/ML (CEM) */}
      <Arrow d={zpath(TIER_RIGHT, 287, 1007, 122, 970)} kind="data" />
      <Arrow d={arrowPath(1112, 172, 1112, 222)} kind="data" />
      <Arrow d={arrowPath(1112, 322, 1112, 372)} kind="data" />
      <Arrow d={arrowPath(1112, 472, 1112, 522)} kind="data" />

      <Legend x={30} y={LEG_Y} width={1480} />
    </svg>
  )
}
