import React from 'react'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 580 },
  { label: 'LONG-TERM STORAGE',x: 1240, width: 240 },
  { label: 'SOC ACCESS',       x: 1520, width: 220 },
]

const SWIM_Y = 70
const SWIM_H = 820

export default function Level3Diagram({ size = 'small', onNodeClick }) {
  const s = getSizing(size)
  const hotCount = getTierNodeCount('hot', size)
  const coldCount = getTierNodeCount('cold', size)
  const frozenCount = getTierNodeCount('frozen', size)
  const mlCount = getTierNodeCount('ml', size)
  const masterCount = getTierNodeCount('master', size)
  const kibanaInfraCount = getTierNodeCount('kibana', size)

  return (
    <svg
      viewBox="0 0 1780 1080"
      className="w-full h-auto"
      role="img"
      aria-label={`Level 3 architecture diagram — ${s.label} size`}
    >
      <Defs />

      {STAGES.map((stg) => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* Sources */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Full Appendix B coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      {/* Collection */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="Complete Fleet inventory" color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="gear" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="logoLogstash" onClick={onNodeClick} componentId="logstash" />
      <Node
        x={320} y={480} w={220} h={130}
        title="Sensitive Data Protection"
        color="coral" icon="lock"
        bullets={['Redact processor', 'NER via ELSER', 'Anonymization processor']}
        onClick={onNodeClick} componentId="sensitiveDataProtection"
      />

      {/* Elastic Stack — tier sub-col (centered in 600+580 = stack span) */}
      <TierFleetCard
        x={620} y={80} w={300} h={130}
        title="Hot Tier" subtitle="3 days SSD" color="orange"
        icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="hotTier"
      />
      <TierFleetCard
        x={620} y={230} w={300} h={130}
        title="Cold Tier" subtitle="7 days" color="blue"
        icon="logoElasticsearch"
        nodeCount={coldCount} nodePrefix="cold" instanceType={s.instanceTypes.cold}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="coldTier"
      />
      <TierFleetCard
        x={620} y={380} w={300} h={130}
        title="Frozen Tier" subtitle="→ 6 / 12 months" color="purple"
        icon="logoElasticsearch"
        nodeCount={frozenCount} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="frozenTier"
      />
      <TierFleetCard
        x={620} y={530} w={300} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM`} color="cyan"
        icon="machineLearningApp"
        nodeCount={mlCount} nodePrefix="ml" instanceType={s.instanceTypes.ml}
        onClick={onNodeClick} componentId="mlNodes"
      />

      {/* Elastic Stack — workload sub-col (AI/ML, IOC, Correlator) */}
      <Node x={980} y={80}  w={200} h={130} title="AI/ML Enrichment" subtitle="Anomaly · UEBA" color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L3']} />
      <Node x={980} y={230} w={200} h={130} title="IOC Matching" subtitle="STIX/TAXII · CISA KEV" color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" badges={['L3']} />
      <Node x={980} y={380} w={200} h={130} title="Alert Correlator" subtitle="Risk scoring → SIEM" color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" badges={['L3']} />

      {/* ILM bar spanning the Elastic Stack */}
      <Node
        x={620} y={680} w={560} h={70}
        title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots"
        color="green" icon="indexManagementApp"
        onClick={onNodeClick} componentId="ilm"
      />

      {/* Control plane lane */}
      <text x={620} y={774} fontSize="9.5" fontWeight="700" fill="#8B949E" style={{ letterSpacing: '0.16em' }}>
        CONTROL PLANE (FIXED ACROSS SIZES)
      </text>
      <ControlPlaneCard
        x={620} y={780} w={155} h={100}
        title="Master Nodes" ramLabel={`${s.masterNodeRamGB} GB`} instanceType={s.instanceTypes.master}
        nodeCount={masterCount} nodePrefix="master" color="gray" icon="logoElasticsearch"
        onClick={onNodeClick} componentId="masterNodes"
      />
      <ControlPlaneCard
        x={785} y={780} w={155} h={100}
        title="Kibana" ramLabel={`${s.kibanaRamGB} GB`} instanceType={s.instanceTypes.kibana}
        nodeCount={kibanaInfraCount} nodePrefix="kib" color="pink" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes"
      />

      {/* Long-term storage */}
      <Node x={1240} y={80}  w={240} title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="gray" dashed onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={1240} y={220} w={240} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      {/* SOC Access */}
      <Node x={1520} y={80}  w={220} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />
      <Node x={1520} y={220} w={220} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="exportAction" onClick={onNodeClick} componentId="cisaExport" />

      {/* === Arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Agent → SDP — enters right edge 8px above mid via lane x=575 */}
      <Arrow d="M 540 130 L 575 130 L 575 537 L 540 537" kind="data" />
      {/* Logstash → SDP — short vertical into top edge */}
      <Arrow d={arrowPath(430, 460, 430, 480)} kind="data" />
      {/* SDP → Hot — leaves right edge 8px below mid via lane x=595 */}
      <Arrow d="M 540 553 L 595 553 L 595 145 L 620 145" kind="data" />

      {/* Tier ILM chain */}
      <Arrow d={arrowPath(770, 210, 770, 230)} kind="data" />
      <Arrow d={arrowPath(770, 360, 770, 380)} kind="data" />
      <Arrow d={arrowPath(770, 510, 770, 530)} kind="data" />

      {/* Cold → AI/ML workload (lane x=950) */}
      <Arrow d={zpath(920, 295, 980, 145, 950)} kind="data" />

      {/* ML workload chain */}
      <Arrow d={arrowPath(1080, 210, 1080, 230)} kind="data" />
      <Arrow d={arrowPath(1080, 360, 1080, 380)} kind="data" />

      {/* Correlator → Kibana SIEM — duck-under via lane y=215, then approach Kibana
          horizontally via lane x=1505 so arrowhead points INTO Kibana (not up its edge) */}
      <Arrow d="M 1180 445 L 1210 445 L 1210 215 L 1505 215 L 1505 130 L 1520 130" kind="data" />

      {/* Frozen → Snap6 — UPPER route: above Correlator via lane y=370,
          then up the workload/snap gutter via lane x=1200 */}
      <Arrow d="M 920 435 L 950 435 L 950 370 L 1200 370 L 1200 130 L 1240 130" kind="data" />
      {/* Frozen → Snap12 — LOWER route: below Correlator via lane y=520,
          then up the workload/snap gutter via lane x=1230. Separated horizontals
          (y=370 vs y=520) and verticals (x=1200 vs x=1230) keep these visually distinct. */}
      <Arrow d="M 920 455 L 960 455 L 960 520 L 1230 520 L 1230 270 L 1240 270" kind="data" />

      {/* CISA exports */}
      {/* Snap6 → CISA — enters CISA left edge 10px ABOVE mid via lane x=1500 */}
      <Arrow d={zpath(1480, 130, 1520, 260, 1500)} kind="export" />
      {/* Snap12 → CISA — enters CISA left edge 10px BELOW mid via lane x=1510 (was direct line ending at convergence point) */}
      <Arrow d={zpath(1480, 270, 1520, 280, 1510)} kind="export" />
      <Arrow d={arrowPath(1630, 180, 1630, 220)} kind="export" />

      <Legend x={40} y={950} />
    </svg>
  )
}
