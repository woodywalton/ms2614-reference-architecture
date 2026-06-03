import React from 'react'
import {
  Node, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath, underPath,
} from './primitives.jsx'

const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 220 },
  { label: 'LONG-TERM STORAGE',x: 880,  width: 260 },
  { label: 'SOC ACCESS',       x: 1200, width: 240 },
]

const SWIM_Y = 70
const SWIM_H = 410

export default function Level2Diagram({ onNodeClick }) {
  return (
    <svg
      viewBox="0 0 1480 600"
      className="w-full h-auto"
      role="img"
      aria-label="Level 2 architecture diagram"
    >
      <Defs />

      {STAGES.map((s) => (
        <SwimLane key={s.label} x={s.x} y={SWIM_Y} width={s.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* L2 = L1 with expanded source coverage and both snapshot repos standard */}
      <Node x={40}  y={80}  title="Log Sources (expanded)" subtitle="Full Appendix B event coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      <Node x={320} y={80}  title="Elastic Agent" subtitle="Complete Fleet inventory" color="teal" icon="/brand/icon-logging.svg" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="/brand/icon-infra.svg" onClick={onNodeClick} componentId="logstash" />

      <Node x={600} y={80}  title="Hot Tier" subtitle="~1 day SSD · ILM ingest" color="blue" onClick={onNodeClick} componentId="hotTier" />
      <Node x={600} y={220} title="Frozen Tier" subtitle="~1 day local cache" color="gray" onClick={onNodeClick} componentId="frozenTier" badges={['RETRIEVABLE']} />
      <Node x={600} y={360} title="ILM + SLM" subtitle="Hot → Frozen → Snapshot" color="green" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ilm" />

      <Node x={880} y={80}  w={260} title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="purple" onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={880} y={220} w={260} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="purple" onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      <Node x={1200} y={80}  w={240} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="kibana" />
      <Node x={1200} y={220} w={240} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="cisaExport" />

      {/* Arrows */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      <Arrow d={arrowPath(540, 130, 600, 130)} kind="data" />
      <Arrow d={zpath(540, 410, 600, 130, 570)} kind="data" />

      <Arrow d={arrowPath(710, 180, 710, 220)} kind="data" />

      <Arrow d={zpath(820, 270, 880, 130, 850)} kind="data" />
      <Arrow d={arrowPath(820, 270, 880, 270)} kind="data" />

      <Arrow d={underPath(820, 130, 1200, 130, 200)} kind="data" />

      <Arrow d={zpath(1140, 130, 1200, 270, 1170)} kind="export" />
      <Arrow d={arrowPath(1140, 270, 1200, 270)} kind="export" />
      <Arrow d={arrowPath(1320, 180, 1320, 220)} kind="export" />

      <Legend x={40} y={510} />
    </svg>
  )
}
