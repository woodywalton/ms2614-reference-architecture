import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, underPath,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

// Stage definitions — five M-26-14 phases.
const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 360 },
  { label: 'LONG-TERM STORAGE',x: 1020, width: 240 },
  { label: 'SOC ACCESS',       x: 1320, width: 220 },
]

const SWIM_Y = 70
const SWIM_H = 670

export default function Level1Diagram({ size = 'small', onNodeClick }) {
  const s = getSizing(size)
  const hotCount = getTierNodeCount('hot', size)
  const frozenCount = getTierNodeCount('frozen', size)
  const mlCount = getTierNodeCount('ml', size)
  const masterCount = getTierNodeCount('master', size)
  const kibanaInfraCount = getTierNodeCount('kibana', size)

  return (
    <svg
      viewBox="0 0 1580 880"
      className="w-full h-auto"
      role="img"
      aria-label={`Level 1 architecture diagram — ${s.label} size`}
    >
      <Defs />

      {STAGES.map((stg) => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* Sources */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Endpoints · Cloud · Network · IAM" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      {/* Collection */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="300+ integrations · ECS" color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="gear" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" dashed icon="logoLogstash" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />

      {/* Elastic Stack — tier fleet cards (centered in 360-wide stack column) */}
      <TierFleetCard
        x={630} y={80} w={300} h={130}
        title="Hot Tier" subtitle="~1 day SSD · ILM ingest" color="blue"
        icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        onClick={onNodeClick} componentId="hotTier"
      />
      <TierFleetCard
        x={630} y={230} w={300} h={130}
        title="Frozen Tier" subtitle="~1 day local cache" color="gray"
        icon="logoElasticsearch"
        nodeCount={frozenCount} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['RETRIEVABLE']}
        onClick={onNodeClick} componentId="frozenTier"
      />
      <TierFleetCard
        x={630} y={380} w={300} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM · provisioned, idle at L1`} color="purple"
        icon="machineLearningApp"
        nodeCount={mlCount} nodePrefix="ml" instanceType={s.instanceTypes.ml}
        onClick={onNodeClick} componentId="mlNodes"
      />

      {/* ILM bar */}
      <Node
        x={620} y={530} w={320} h={70}
        title="ILM + SLM" subtitle="Hot → Frozen → Snapshot"
        color="green" icon="indexManagementApp"
        onClick={onNodeClick} componentId="ilm"
      />

      {/* Control plane lane */}
      <text x={620} y={624} fontSize="9.5" fontWeight="700" fill="#8B949E" style={{ letterSpacing: '0.16em' }}>
        CONTROL PLANE (FIXED ACROSS SIZES)
      </text>
      <ControlPlaneCard
        x={620} y={630} w={155} h={100}
        title="Master Nodes" ramLabel={`${s.masterNodeRamGB} GB`} instanceType={s.instanceTypes.master}
        nodeCount={masterCount} nodePrefix="master" color="gray" icon="logoElasticsearch"
        onClick={onNodeClick} componentId="masterNodes"
      />
      <ControlPlaneCard
        x={785} y={630} w={155} h={100}
        title="Kibana" ramLabel={`${s.kibanaRamGB} GB`} instanceType={s.instanceTypes.kibana}
        nodeCount={kibanaInfraCount} nodePrefix="kib" color="coral" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes"
      />

      {/* Long-term storage */}
      <Node x={1020} y={80}  w={240} title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={1020} y={220} w={240} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['OPTIONAL']} />

      {/* SOC Access */}
      <Node x={1320} y={80}  w={220} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />
      <Node x={1320} y={220} w={220} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport" />

      {/* === Arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" variant="dashed" />

      {/* Fleet policy */}
      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Collection → Hot tier */}
      <Arrow d={arrowPath(540, 130, 630, 145)} kind="data" />
      <Arrow d={zpath(540, 410, 630, 145, 580)} kind="data" variant="dashed" />

      {/* Tier transitions */}
      <Arrow d={arrowPath(780, 210, 780, 230)} kind="data" />

      {/* SLM: Frozen → snapshot repos */}
      <Arrow d={zpath(930, 295, 1020, 130, 975)} kind="data" />
      <Arrow d={arrowPath(930, 295, 1020, 290)} kind="data" variant="dashed" />

      {/* SOC access: Hot → Kibana (ducks under the snapshot row at y=215) */}
      <Arrow d={underPath(930, 145, 1320, 130, 215)} kind="data" />

      {/* CISA exports */}
      <Arrow d={zpath(1260, 130, 1320, 270, 1290)} kind="export" />
      <Arrow d={arrowPath(1260, 290, 1320, 270)} kind="export" />
      <Arrow d={arrowPath(1430, 180, 1430, 220)} kind="export" />

      <Legend x={40} y={760} />
    </svg>
  )
}
