import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, zpathV, underPath, useDiagramTheme,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',                    x: 30,   width: 200 },
  { label: 'COLLECTION',                 x: 258,  width: 200 },
  { label: 'ELASTIC SEARCH AI PLATFORM', x: 486,  width: 422 },
  { label: 'CEM',                        x: 936,  width: 270 },
  { label: 'THIRF',                      x: 1234, width: 270 },
]

const SWIM_Y  = 60
const SWIM_H  = 640
const SNAP_Y  = 724
const LEG_Y   = 846

export default function Level1Diagram({ size = 'small', onNodeClick }) {
  const s         = getSizing(size)
  const hotCount  = getTierNodeCount('hot',    size)
  const frozenCnt = getTierNodeCount('frozen', size)
  const mlCount   = getTierNodeCount('ml',     size)
  const masterCnt = getTierNodeCount('master', size)
  const kibanaCnt = getTierNodeCount('kibana', size)

  const { isDark, C } = useDiagramTheme()

  const HOT_CX      = 641
  const TIER_RIGHT  = 786
  // ILM now sits below the control plane
  const CP_LABEL_Y  = 512
  const CP_CARD_Y   = 520
  const ILM_Y       = 630
  const ILM_BOTTOM  = ILM_Y + 60

  return (
    <svg viewBox="0 0 1540 912"
      className="w-full h-auto"
      style={{ backgroundColor: isDark ? '#0D1117' : '#FFFFFF' }}
      role="img" aria-label={`Level 1 architecture diagram — ${s.label} size`}>
      <Defs />

      {STAGES.map(stg => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}
      <StageHeader stages={STAGES} />

      {/* ── Sources ── */}
      <Node x={30} y={72} title="Log Sources" subtitle="Endpoints · Cloud · Network · IAM"
        color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={30} y={212} title="Legacy / OT" subtitle="Syslog · SNMP · ICS"
        color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      {/* ── Collection ── */}
      <Node x={258} y={72}  title="Elastic Agent" subtitle="300+ integrations · ECS"
        color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={258} y={212} title="Fleet Server"  subtitle="Agent policy plane"
        color="teal" icon="gear"      onClick={onNodeClick} componentId="fleetServer" />
      <Node x={258} y={352} title="Logstash"      subtitle="Legacy / OT pipeline"
        color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />

      {/* ── ES AI Platform — tiers ── */}
      <TierFleetCard x={496} y={72} w={290} h={130}
        title="Hot Tier" subtitle="~1 day SSD · ILM ingest" color="blue" icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        onClick={onNodeClick} componentId="hotTier" />
      <TierFleetCard x={496} y={222} w={290} h={130}
        title="Frozen Tier" subtitle="~1 day local cache · backed by S3" color="gray" icon="logoElasticsearch"
        nodeCount={frozenCnt} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['RETRIEVABLE']} onClick={onNodeClick} componentId="frozenTier" />
      <TierFleetCard x={496} y={372} w={290} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM · provisioned, idle at L1`}
        color="purple" icon="machineLearningApp"
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
        nodeCount={kibanaCnt} nodePrefix="kib" color="coral" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes" />

      {/* ILM + SLM — below control plane */}
      <Node x={486} y={ILM_Y} w={306} h={60}
        title="ILM + SLM" subtitle="Hot → Frozen → Snapshot"
        color="green" icon="indexManagementApp" onClick={onNodeClick} componentId="ilm" />

      {/* ── CEM ── */}
      <Node x={946} y={72} w={250} h={100}
        title="Kibana / SIEM" subtitle="Elastic Security · search &amp; dashboards"
        color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* ── THIRF ── */}
      <Node x={1244} y={72} w={250} h={100}
        title="CISA / FBI Export" subtitle="On-request forensic retrieval"
        color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport"
        badges={['OPTIONAL']} />

      {/* ── Long-term object storage band ── */}
      <rect x={468} y={712} width={800} height={114} rx={10}
        fill={C.bandFill} stroke={C.bandStroke} strokeWidth={1} />
      <text x={486} y={728} fontSize="9.5" fontWeight="700" fill={C.textMuted}
        style={{ letterSpacing: '0.14em' }}>LONG-TERM OBJECT STORAGE (SLM)</text>
      <Node x={486} y={SNAP_Y} w={196} h={82}
        title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted"
        color="purple" dashed onClick={onNodeClick} componentId="snapshot6mo"
        badges={['RETRIEVABLE']} />
      <Node x={692} y={SNAP_Y} w={196} h={82}
        title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted"
        color="purple" dashed onClick={onNodeClick} componentId="snapshot12mo"
        badges={['OPTIONAL']} />

      {/* ── Arrows ── */}
      <Arrow d={arrowPath(230, 122, 258, 122)} kind="data" />
      <Arrow d={zpath(230, 262, 258, 402, 244)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(358, 212, 358, 172)} kind="policy" />
      <Arrow d={arrowPath(458, 122, 496, 137)} kind="data" />
      <Arrow d={zpath(458, 402, 496, 137, 472)} kind="data" variant="dashed" />
      <Arrow d={arrowPath(HOT_CX, 202, HOT_CX, 222)} kind="data" />
      {/* ILM → Snapshot 6-mo */}
      <Arrow d={zpathV(582, ILM_BOTTOM, 584, SNAP_Y, 706)} kind="data" />
      {/* Hot → Kibana SIEM (CEM) */}
      <Arrow d={underPath(TIER_RIGHT, 137, 946, 122, 218)} kind="data" />

      <Legend x={30} y={LEG_Y} width={1480} />
    </svg>
  )
}
