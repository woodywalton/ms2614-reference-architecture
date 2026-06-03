import React from 'react'
import {
  Node, Arrow, Defs, Legend, StageHeader, SwimLane,
  arrowPath, zpath,
} from './primitives.jsx'

// ELASTIC STACK is a wider stage at L3 — it spans the tier sub-column AND
// the ML/enrichment sub-column.
const STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 220 },
  { label: 'ELASTIC STACK',    x: 600,  width: 500 },
  { label: 'LONG-TERM STORAGE',x: 1160, width: 220 },
  { label: 'SOC ACCESS',       x: 1440, width: 220 },
]

const SWIM_Y = 70
const SWIM_H = 550

export default function Level3Diagram({ onNodeClick }) {
  return (
    <svg
      viewBox="0 0 1700 740"
      className="w-full h-auto"
      role="img"
      aria-label="Level 3 architecture diagram"
    >
      <Defs />

      {STAGES.map((s) => (
        <SwimLane key={s.label} x={s.x} y={SWIM_Y} width={s.width} height={SWIM_H} />
      ))}

      <StageHeader stages={STAGES} />

      {/* Sources */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Full Appendix B coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      {/* Collection */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="Complete Fleet inventory" color="teal" icon="/brand/icon-logging.svg" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="/brand/icon-infra.svg" onClick={onNodeClick} componentId="logstash" />
      <Node x={320} y={500} title="PII Masking" subtitle="Pre-storage redaction" color="coral" icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="piiMasking" badges={['L3']} />

      {/* Elastic Stack — tiers sub-column */}
      <Node x={600} y={80}  title="Hot Tier" subtitle="3 days SSD" color="blue" onClick={onNodeClick} componentId="hotTier" badges={['SEARCHABLE']} />
      <Node x={600} y={220} title="Cold Tier" subtitle="7 days" color="green" onClick={onNodeClick} componentId="coldTier" badges={['SEARCHABLE']} />
      <Node x={600} y={360} title="Frozen Tier" subtitle="→ 6 / 12 months" color="gray" onClick={onNodeClick} componentId="frozenTier" badges={['SEARCHABLE']} />

      {/* Elastic Stack — ML sub-column */}
      <Node x={880} y={80}  title="AI/ML Enrichment" subtitle="Anomaly · UEBA" color="purple" icon="/brand/icon-ai.svg" onClick={onNodeClick} componentId="ml" badges={['L3']} />
      <Node x={880} y={220} title="IOC Matching" subtitle="STIX/TAXII · CISA KEV" color="purple" icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="iocMatching" badges={['L3']} />
      <Node x={880} y={360} title="Alert Correlator" subtitle="Risk scoring → SIEM" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="alertCorrelator" badges={['L3']} />

      {/* ILM bar spanning the Elastic Stack stage */}
      <Node x={600} y={500} w={500} title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots" color="green" icon="/brand/icon-monitor-graph-cog.svg" onClick={onNodeClick} componentId="ilm" />

      {/* Long-term storage */}
      <Node x={1160} y={80}  title="Snapshot Repo 6-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot6mo" badges={['UNMOUNTED']} />
      <Node x={1160} y={220} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="purple" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      {/* SOC Access */}
      <Node x={1440} y={80}  title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="/brand/icon-siem.svg" onClick={onNodeClick} componentId="kibana" />
      <Node x={1440} y={220} title="CISA / FBI Export" subtitle="On-request" color="coral" dashed icon="/brand/icon-threat-detection.svg" onClick={onNodeClick} componentId="cisaExport" />

      {/* === Arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      {/* Fleet policy */}
      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Agent → PII (down via right-of-collection lane x=555) */}
      <Arrow d="M 540 130 L 555 130 L 555 550 L 540 550" kind="data" />
      {/* Logstash → PII (short vertical inside col) */}
      <Arrow d={arrowPath(430, 460, 430, 500)} kind="data" />
      {/* PII → Hot (up via lane x=585) */}
      <Arrow d="M 540 550 L 585 550 L 585 130 L 600 130" kind="data" />

      {/* Tier ILM chain */}
      <Arrow d={arrowPath(710, 180, 710, 220)} kind="data" />
      <Arrow d={arrowPath(710, 320, 710, 360)} kind="data" />

      {/* Cold → AI/ML (lane x=850) */}
      <Arrow d={zpath(820, 270, 880, 130, 850)} kind="data" />

      {/* ML chain */}
      <Arrow d={arrowPath(990, 180, 990, 220)} kind="data" />
      <Arrow d={arrowPath(990, 320, 990, 360)} kind="data" />

      {/* Correlator → Kibana: routed up via lane x=1130, across at y=200 */}
      <Arrow d="M 1100 410 L 1130 410 L 1130 200 L 1440 200 L 1440 130" kind="data" />

      {/* Frozen → snapshot repos (SLM): via row-3-bottom lane y=480 then up at x=1140 */}
      <Arrow d="M 820 410 L 860 410 L 860 480 L 1140 480 L 1140 130 L 1160 130" kind="data" />
      <Arrow d="M 820 410 L 860 410 L 860 480 L 1140 480 L 1140 270 L 1160 270" kind="data" />

      {/* CISA export */}
      <Arrow d={zpath(1380, 130, 1440, 270, 1410)} kind="export" />
      <Arrow d={arrowPath(1380, 270, 1440, 270)} kind="export" />
      <Arrow d={arrowPath(1550, 180, 1550, 220)} kind="export" />

      <Legend x={40} y={650} />
    </svg>
  )
}
