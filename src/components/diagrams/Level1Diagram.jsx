import React from 'react'
import {
  Node, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, underPath,
} from './primitives.jsx'

// Stage definitions — the five M-26-14 phases the data passes through.
// Each becomes a numbered header above the swim lane.
const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 220 },
  { label: 'LONG-TERM STORAGE',x: 880,  width: 260 },
  { label: 'SOC ACCESS',       x: 1200, width: 240 },
]

const SWIM_Y = 70
const SWIM_H = 410

export default function Level1Diagram({ onNodeClick }) {
  return (
    <svg
      viewBox="0 0 1480 600"
      className="w-full h-auto"
      role="img"
      aria-label="Level 1 architecture diagram"
    >
      <Defs />

      {/* Swim lanes (rendered first, behind everything else) */}
      {STAGES.map((s) => (
        <SwimLane key={s.label} x={s.x} y={SWIM_Y} width={s.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* Nodes */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Endpoints · Cloud · Network · IAM" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" dashed onClick={onNodeClick} componentId="legacySources" badges={['OPTIONAL']} />

      <Node x={320} y={80}  title="Elastic Agent" subtitle="300+ integrations · ECS" color="teal" icon="/brand/icon-logging.svg" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" dashed icon="/brand/icon-infra.svg" onClick={onNodeClick} componentId="logstash" badges={['OPTIONAL']} />

      <Node x={600} y={80}  title="Hot Tier" subtitle="~1 day SSD · ILM ingest" color="blue" onClick={onNodeClick} componentId="hotTier" />
      <Node x={600} y={220} title="Frozen Tier" subtitle="~1 day local cache" color="gray" onClick={onNodeClick} componentId="frozenTier" badges={['RETRIEVABLE']} />
      <Node x={600} y={360} title="ILM + SLM" subtitle="Hot → Frozen → Snapshot" color="green" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ilm" />

      <Node x={880} y={80}  w={260} title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={880} y={220} w={260} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['OPTIONAL']} />

      <Node x={1200} y={80}  w={240} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="kibana" />
      <Node x={1200} y={220} w={240} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="cisaExport" />

      {/* === Arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" variant="dashed" />

      {/* Fleet policy (yellow, dashed) */}
      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Collection → Hot */}
      <Arrow d={arrowPath(540, 130, 600, 130)} kind="data" />
      <Arrow d={zpath(540, 410, 600, 130, 570)} kind="data" variant="dashed" />

      {/* Tier transitions */}
      <Arrow d={arrowPath(710, 180, 710, 220)} kind="data" />

      {/* SLM: Frozen → snapshot repos */}
      <Arrow d={zpath(820, 270, 880, 130, 850)} kind="data" />
      <Arrow d={arrowPath(820, 270, 880, 270)} kind="data" variant="dashed" />

      {/* SOC access: Hot → Kibana (ducks under the snapshot row) */}
      <Arrow d={underPath(820, 130, 1200, 130, 200)} kind="data" />

      {/* CISA/FBI exports (coral, dashed) */}
      <Arrow d={zpath(1140, 130, 1200, 270, 1170)} kind="export" />
      <Arrow d={arrowPath(1140, 270, 1200, 270)} kind="export" />
      <Arrow d={arrowPath(1320, 180, 1320, 220)} kind="export" />

      <Legend x={40} y={510} />
    </svg>
  )
}
