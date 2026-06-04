import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, zpathV, useDiagramTheme,
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
const SWIM_H      = 800
const SNAP_BAND_Y = 876
const SNAP_Y      = 900
const LEG_Y       = 1002

export default function Level3Diagram({ size = 'small', onNodeClick }) {
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

  return (
    <svg viewBox="0 0 1540 1064"
      className="w-full h-auto"
      style={{ backgroundColor: isDark ? '#0D1117' : '#FFFFFF' }}
      role="img" aria-label={`Level 3 architecture diagram — ${s.label} size`}>
      <Defs />

      {STAGES.map(stg => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}
      <StageHeader stages={STAGES} />

      {/* ── Sources ── */}
      <Node x={30} y={72}  title="Log Sources" subtitle="Full Appendix B coverage"
        color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={30} y={212} title="Legacy / OT" subtitle="Syslog · SNMP · ICS"
        color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      {/* ── Collection (adds PII Masking at L3) ── */}
      <Node x={258} y={72}  title="Elastic Agent" subtitle="Complete Fleet inventory"
        color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={258} y={212} title="Fleet Server"  subtitle="Agent policy plane"
        color="teal" icon="gear"      onClick={onNodeClick} componentId="fleetServer" />
      <Node x={258} y={352} title="Logstash"      subtitle="Legacy / OT pipeline"
        color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />
      <Node x={258} y={492} w={220} h={130}
        title="Sensitive Data Protection" color="coral" icon="lock"
        bullets={['Redact processor', 'NER via ELSER', 'Anonymization processor']}
        onClick={onNodeClick} componentId="sensitiveDataProtection" badges={['L3']} />

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
        title="Frozen Tier" subtitle="→ 3 / 12 months (searchable snapshot)"
        color="purple" icon="logoElasticsearch"
        nodeCount={frozenCnt} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']} onClick={onNodeClick} componentId="frozenTier" />
      <TierFleetCard x={496} y={522} w={290} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM · active at L3`}
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

      {/* ── CEM — detection stack + SIEM ── */}
      <Node x={946} y={72}  w={250} h={100}
        title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt"
        color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L3']} />
      <Node x={946} y={222} w={250} h={100}
        title="IOC Matching" subtitle="STIX/TAXII · CISA KEV"
        color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" badges={['L3']} />
      <Node x={946} y={372} w={250} h={100}
        title="Alert Correlator" subtitle="Risk scoring → SIEM"
        color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" badges={['L3']} />
      <Node x={946} y={522} w={250} h={100}
        title="Kibana / SIEM" subtitle="Elastic Security · Detect &amp; investigate"
        color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* ── THIRF ── */}
      <Node x={1244} y={72} w={250} h={100}
        title="CISA / FBI Export" subtitle="On-request forensic retrieval"
        color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport"
        badges={['OPTIONAL']} />

      {/* ── Long-term object storage band ── */}
      <rect x={468} y={SNAP_BAND_Y} width={410} height={106} rx={10}
        fill={C.bandFill} stroke={C.bandStroke} strokeWidth={1} />
      <text x={486} y={892} fontSize="9.5" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.14em' }}>LONG-TERM OBJECT STORAGE (SLM)</text>
      <Node x={486} y={SNAP_Y} w={280} h={82}
        title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted"
        color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo"
        badges={['UNMOUNTED']} />

      {/* ── Arrows ── */}
      <Arrow d={arrowPath(230, 122, 258, 122)} kind="data" />
      <Arrow d={zpath(230, 262, 258, 402, 244)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(358, 212, 358, 172)} kind="policy" />
      {/* Agent → PII Masking (bypasses Fleet via right lane x=460) */}
      <Arrow d="M 358 172 L 460 172 L 460 462 L 358 462 L 358 492" kind="data" />
      <Arrow d={arrowPath(358, 452, 358, 492)} kind="data" variant="dashed" />
      {/* Sensitive Data Protection → Hot (PII card is now h=130, center y=557) */}
      <Arrow d={zpath(478, 557, 496, 137, 487)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 202, HOT_CX, 222)} kind="data" />
      <Arrow d={arrowPath(HOT_CX, 352, HOT_CX, 372)} kind="data" />
      {/* ILM → Snapshot 12-mo */}
      <Arrow d={zpathV(639, ILM_BOTTOM, 626, SNAP_Y, 866)} kind="data" />
      {/* Cold → AI/ML (CEM) */}
      <Arrow d={zpath(TIER_RIGHT, 287, 946, 122, 910)} kind="data" />
      <Arrow d={arrowPath(1071, 172, 1071, 222)} kind="data" />
      <Arrow d={arrowPath(1071, 322, 1071, 372)} kind="data" />
      <Arrow d={arrowPath(1071, 472, 1071, 522)} kind="data" />

      <Legend x={30} y={LEG_Y} width={1480} />
    </svg>
  )
}
