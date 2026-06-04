import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, underPath,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 360 },
  { label: 'LONG-TERM STORAGE',x: 1020, width: 240 },
  { label: 'SOC ACCESS',       x: 1320, width: 220 },
]

const SWIM_Y = 70
const SWIM_H = 670

export default function Level2Diagram({ size = 'small', onNodeClick }) {
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
      aria-label={`Level 2 architecture diagram — ${s.label} size`}
    >
      <Defs />

      {STAGES.map((stg) => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* Sources — expanded at L2, both standard */}
      <Node x={40}  y={80}  title="Log Sources (expanded)" subtitle="Full Appendix B event coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      {/* Collection */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="Complete Fleet inventory" color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="gear" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="logoLogstash" onClick={onNodeClick} componentId="logstash" />
      <Node
        x={320} y={490} w={220} h={130}
        title="Sensitive Data Protection"
        color="coral" icon="lock"
        bullets={['Redact processor', 'NER via ELSER', 'Anonymization processor']}
        onClick={onNodeClick} componentId="sensitiveDataProtection"
      />

      {/* Elastic Stack — tier fleet cards */}
      <TierFleetCard
        x={630} y={80} w={300} h={130}
        title="Hot Tier" subtitle="~1 day SSD · ILM ingest" color="orange"
        icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        onClick={onNodeClick} componentId="hotTier"
      />
      <TierFleetCard
        x={630} y={230} w={300} h={130}
        title="Frozen Tier" subtitle="~1 day local cache" color="purple"
        icon="logoElasticsearch"
        nodeCount={frozenCount} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['RETRIEVABLE']}
        onClick={onNodeClick} componentId="frozenTier"
      />
      <TierFleetCard
        x={630} y={380} w={300} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM · provisioned, idle at L2`} color="cyan"
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
        nodeCount={kibanaInfraCount} nodePrefix="kib" color="pink" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes"
      />

      {/* Long-term storage — both repos standard at L2 */}
      <Node x={1020} y={80}  w={240} title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="gray" onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={1020} y={220} w={240} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="gray" onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      {/* SOC Access */}
      <Node x={1320} y={80}  w={220} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />
      <Node x={1320} y={220} w={220} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport" />

      {/* === Arrows === */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Collection → Sensitive Data Protection → Hot tier */}
      {/* Agent → SDP — right edge, 8px above mid */}
      <Arrow d="M 540 130 L 555 130 L 555 547 L 540 547" kind="data" />
      <Arrow d={arrowPath(430, 460, 430, 490)} kind="data" />
      {/* SDP → Hot — right edge, 8px below mid */}
      <Arrow d="M 540 563 L 575 563 L 575 145 L 630 145" kind="data" />

      <Arrow d={arrowPath(780, 210, 780, 230)} kind="data" />

      {/* Frozen → Snap6 — 10px above Frozen right-mid via lane x=975 */}
      <Arrow d={zpath(930, 285, 1020, 130, 975)} kind="data" />
      {/* Frozen → Snap12 — 10px below Frozen right-mid via lane x=985, orthogonal */}
      <Arrow d={zpath(930, 305, 1020, 270, 985)} kind="data" />

      {/* Hot → Kibana — elbow out, duck under snapshots, approach Kibana horizontally */}
      <Arrow d="M 930 145 L 945 145 L 945 215 L 1305 215 L 1305 130 L 1320 130" kind="data" />

      {/* Snap6 → CISA — 10px above CISA left-mid */}
      <Arrow d={zpath(1260, 130, 1320, 260, 1290)} kind="export" />
      {/* Snap12 → CISA — 10px below CISA left-mid, orthogonal */}
      <Arrow d={zpath(1260, 270, 1320, 280, 1310)} kind="export" />
      <Arrow d={arrowPath(1430, 180, 1430, 220)} kind="export" />

      <Legend x={40} y={760} />
    </svg>
  )
}
