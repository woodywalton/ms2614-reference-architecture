import React from 'react'
import { EuiIcon } from '@elastic/eui'
import {
  Node, TierFleetCard, ControlPlaneCard, Arrow, Defs, Legend, StageHeader, SwimLane, ACCENT, ARROW,
  arrowPath, zpath,
} from './primitives.jsx'
import { getSizing, getTierNodeCount } from '../../data/sizing.js'

const PIPELINE_STAGES = [
  { label: 'SOURCES',          x: 40,   width: 220 },
  { label: 'COLLECTION',       x: 320,  width: 460 },
  { label: 'ELASTIC STACK',    x: 840,  width: 580 },
  { label: 'LONG-TERM STORAGE',x: 1480, width: 240 },
  { label: 'SOC ACCESS',       x: 1760, width: 220 },
]

const SWIM_Y = 70
const PIPELINE_SWIM_H = 820

// Federation hub geometry
const SOC = { cx: 1010, cy: 1240 }
const SPOKE_R = 220
const SOC_R = 90

function radial(angleDeg, r = SPOKE_R) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: SOC.cx + r * Math.cos(rad), y: SOC.cy + r * Math.sin(rad) }
}

function spokeLine(targetX, targetY, halfW = 110, halfH = 40) {
  const dx = targetX - SOC.cx
  const dy = targetY - SOC.cy
  const len = Math.sqrt(dx * dx + dy * dy)
  const startInset = SOC_R + 4
  const endInset = Math.min(halfW, halfH) + 12
  return {
    x1: SOC.cx + dx * (startInset / len),
    y1: SOC.cy + dy * (startInset / len),
    x2: SOC.cx + dx * ((len - endInset) / len),
    y2: SOC.cy + dy * ((len - endInset) / len),
  }
}

export default function Level4Diagram({ size = 'small', onNodeClick }) {
  const s = getSizing(size)
  const hotCount = getTierNodeCount('hot', size)
  const coldCount = getTierNodeCount('cold', size)
  const frozenCount = getTierNodeCount('frozen', size)
  const mlCount = getTierNodeCount('ml', size)
  const masterCount = getTierNodeCount('master', size)
  const kibanaInfraCount = getTierNodeCount('kibana', size)

  // Federation spokes (same as before, with renamed cloudCold)
  const W = 220, H = 80
  const spokes = [
    { id: 'primaryCluster', angle: 0,   label: 'Primary Cluster',          sub: 'Hot · Cold · Frozen',     color: 'blue',   componentId: 'hotTier' },
    { id: 'onPremStore',    angle: 60,  label: 'On-Prem Cold / Frozen',     sub: 'Sensitive workloads',     color: 'green',  componentId: 'onPremStore' },
    { id: 'cloudCold',      angle: 120, label: 'Cloud Cold (FedRAMP High)', sub: 'Elastic Cloud GovCloud',  color: 'green',  componentId: 'cloudCold' },
    { id: 'cloudObjectStore', angle: 180, label: 'Cloud Object Store',      sub: 'S3 / Azure Blob / GCS',   color: 'purple', componentId: 'cloudObjectStore' },
    { id: 'iotEdge',        angle: 240, label: 'IoT / OT Edge Cluster',     sub: 'Edge-buffered',           color: 'gray',   componentId: 'iotEdge' },
    { id: 'cisaExport',     angle: 300, label: 'CISA / FBI Export',         sub: 'Federated, pre-defined',  color: 'coral',  componentId: 'cisaExport', dashed: true },
  ]
  const placed = spokes.map((sp) => {
    const c = radial(sp.angle)
    return { ...sp, cx: c.x, cy: c.y, x: c.x - W / 2, y: c.y - H / 2 }
  })

  return (
    <svg
      viewBox="0 0 2020 1640"
      className="w-full h-auto"
      role="img"
      aria-label={`Level 4 architecture diagram — ${s.label} size`}
    >
      <Defs />

      {/* ===== PIPELINE SECTION ===== */}
      {PIPELINE_STAGES.map((stg) => (
        <SwimLane key={stg.label} x={stg.x} y={SWIM_Y} width={stg.width} height={PIPELINE_SWIM_H} />
      ))}

      <StageHeader stages={PIPELINE_STAGES} />

      {/* Sources */}
      <Node x={40}  y={80}  title="Log Sources" subtitle="Full Appendix B coverage" color="gray" onClick={onNodeClick} componentId="sources" />
      <Node x={40}  y={220} title="Legacy / OT" subtitle="Syslog · SNMP · ICS" color="gray" onClick={onNodeClick} componentId="legacySources" />

      {/* Collection sub-col 2a */}
      <Node x={320} y={80}  title="Elastic Agent" subtitle="ECS-normalized at edge" color="teal" icon="logoBeats" onClick={onNodeClick} componentId="elasticAgent" />
      <Node x={320} y={220} title="Fleet Server" subtitle="Agent policy plane" color="teal" icon="gear" onClick={onNodeClick} componentId="fleetServer" />
      <Node x={320} y={360} title="Logstash" subtitle="Legacy / OT pipeline" color="teal" icon="logoLogstash" onClick={onNodeClick} componentId="logstash" />

      {/* Collection sub-col 2b (Ingest Pipelines + Sensitive Data Protection) */}
      <Node x={560} y={80}  title="Ingest Pipelines" subtitle="40–60% volume reduction" color="teal" icon="pipelineApp" onClick={onNodeClick} componentId="ingestPipelines" badges={['L4']} />
      <Node
        x={560} y={220} w={220} h={130}
        title="Sensitive Data Protection"
        color="coral" icon="lock"
        bullets={['Redact processor', 'NER via ELSER', 'Anonymization processor']}
        onClick={onNodeClick} componentId="sensitiveDataProtection"
      />

      {/* Elastic Stack — tier sub-col */}
      <TierFleetCard
        x={860} y={80} w={300} h={130}
        title="Hot Tier" subtitle="3 days SSD" color="orange"
        icon="logoElasticsearch"
        nodeCount={hotCount} nodePrefix="hot" instanceType={s.instanceTypes.hot}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="hotTier"
      />
      <TierFleetCard
        x={860} y={230} w={300} h={130}
        title="Cold Tier" subtitle="7 days" color="blue"
        icon="logoElasticsearch"
        nodeCount={coldCount} nodePrefix="cold" instanceType={s.instanceTypes.cold}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="coldTier"
      />
      <TierFleetCard
        x={860} y={380} w={300} h={130}
        title="Frozen Tier" subtitle="→ 12 months" color="purple"
        icon="logoElasticsearch"
        nodeCount={frozenCount} nodePrefix="frozen" instanceType={s.instanceTypes.frozen}
        badges={['SEARCHABLE']}
        onClick={onNodeClick} componentId="frozenTier"
      />
      <TierFleetCard
        x={860} y={530} w={300} h={130}
        title="ML Nodes" subtitle={`${s.mlNodeRamGB} GB RAM`} color="cyan"
        icon="machineLearningApp"
        nodeCount={mlCount} nodePrefix="ml" instanceType={s.instanceTypes.ml}
        onClick={onNodeClick} componentId="mlNodes"
      />

      {/* Workload sub-col */}
      <Node x={1220} y={80}  w={200} h={130} title="AI/ML Enrichment" subtitle="Anomaly · UEBA · lateral mvmt" color="cyan" icon="machineLearningApp" onClick={onNodeClick} componentId="ml" badges={['L4']} />
      <Node x={1220} y={230} w={200} h={130} title="IOC Matching" subtitle="STIX/TAXII · CISA KEV" color="purple" icon="securitySignal" onClick={onNodeClick} componentId="iocMatching" />
      <Node x={1220} y={380} w={200} h={130} title="Alert Correlator" subtitle="Risk scoring → SIEM" color="coral" icon="bell" onClick={onNodeClick} componentId="alertCorrelator" />

      {/* ILM bar */}
      <Node
        x={860} y={680} w={560} h={70}
        title="ILM + SLM Policy" subtitle="Hot → Cold → Frozen → Delete · SLM snapshots"
        color="green" icon="indexManagementApp"
        onClick={onNodeClick} componentId="ilm"
      />

      {/* Control plane lane */}
      <text x={860} y={774} fontSize="9.5" fontWeight="700" fill="#8B949E" style={{ letterSpacing: '0.16em' }}>
        CONTROL PLANE (FIXED ACROSS SIZES)
      </text>
      <ControlPlaneCard
        x={980} y={780} w={155} h={100}
        title="Master Nodes" ramLabel={`${s.masterNodeRamGB} GB`} instanceType={s.instanceTypes.master}
        nodeCount={masterCount} nodePrefix="master" color="gray" icon="logoElasticsearch"
        onClick={onNodeClick} componentId="masterNodes"
      />
      <ControlPlaneCard
        x={1150} y={780} w={155} h={100}
        title="Kibana" ramLabel={`${s.kibanaRamGB} GB`} instanceType={s.instanceTypes.kibana}
        nodeCount={kibanaInfraCount} nodePrefix="kib" color="pink" icon="logoKibana"
        onClick={onNodeClick} componentId="kibanaNodes"
      />

      {/* Long-term storage (only 12-mo at L4) */}
      <Node x={1480} y={80}  w={240} title="Snapshot Repo 12-mo" subtitle="S3 / Blob — unmounted" color="gray" dashed onClick={onNodeClick} componentId="snapshot12mo" badges={['UNMOUNTED']} />

      {/* SOC Access (pipeline-side; SOC hub is below) */}
      <Node x={1760} y={80}  w={220} title="Kibana / SIEM" subtitle="Elastic Security" color="coral" icon="logoSecurity" onClick={onNodeClick} componentId="kibana" />

      {/* === Pipeline arrows === */}
      {/* Sources → Collection */}
      <Arrow d={arrowPath(260, 130, 320, 130)} kind="data" />
      <Arrow d={zpath(260, 270, 320, 410, 290)} kind="data" />

      <Arrow d={arrowPath(430, 220, 430, 180)} kind="policy" />

      {/* Agent → Ingest Pipelines — enters left edge 8px ABOVE mid (small elbow via lane x=550) */}
      <Arrow d="M 540 130 L 550 130 L 550 122 L 560 122" kind="data" />
      {/* Logstash → Ingest Pipelines — enters left edge 8px BELOW mid via lane x=545 */}
      <Arrow d="M 540 410 L 545 410 L 545 138 L 560 138" kind="data" />

      {/* Ingest Pipelines → Sensitive Data Protection */}
      <Arrow d={arrowPath(670, 180, 670, 220)} kind="data" />

      {/* Sensitive Data Protection → Hot (up via lane x=820) */}
      <Arrow d={zpath(780, 285, 860, 145, 820)} kind="data" />

      {/* Tier ILM chain */}
      <Arrow d={arrowPath(1010, 210, 1010, 230)} kind="data" />
      <Arrow d={arrowPath(1010, 360, 1010, 380)} kind="data" />
      <Arrow d={arrowPath(1010, 510, 1010, 530)} kind="data" />

      {/* Cold → AI/ML workload (lane x=1190) */}
      <Arrow d={zpath(1160, 295, 1220, 145, 1190)} kind="data" />

      {/* ML chain */}
      <Arrow d={arrowPath(1320, 210, 1320, 230)} kind="data" />
      <Arrow d={arrowPath(1320, 360, 1320, 380)} kind="data" />

      {/* Correlator → Kibana SIEM — duck-under via lane y=215, then approach Kibana
          horizontally via lane x=1745 so arrowhead points INTO Kibana (not up its edge) */}
      <Arrow d="M 1420 445 L 1450 445 L 1450 215 L 1745 215 L 1745 130 L 1760 130" kind="data" />

      {/* Frozen → Snap12 — uses lane x=1460 (not 1450) to avoid sharing the vertical
          with the Correlator → Kibana arrow above */}
      <Arrow d="M 1160 445 L 1190 445 L 1190 520 L 1460 520 L 1460 130 L 1480 130" kind="data" />

      {/* ===== DIVIDER + FEDERATION HEADER ===== */}
      <line x1={40} y1={910} x2={1980} y2={910} stroke="#2A3344" strokeWidth={1} />
      <text x={40} y={940} fontSize="13" fontWeight="700" fill="#E6EDF3" style={{ letterSpacing: '0.18em' }}>
        FEDERATED SOC TOPOLOGY
      </text>
      <text x={40} y={960} fontSize="11" fill="#8B949E">
        Agency SOC at the center; spokes reach every distributed log store via Cross-Cluster Search. Storage may be decentralized but logs must remain readily available to the top-level agency SOC.
      </text>

      {/* ===== FEDERATION HUB ===== */}
      <circle cx={SOC.cx} cy={SOC.cy} r={SPOKE_R + 56} fill="#0F1620" stroke="#1F2A3A" strokeDasharray="2 4" />

      {placed.map((sp) => {
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
              <text
                x={labelX} y={labelY}
                fontSize="10" fill="#6FDCD3" fontWeight="700"
                textAnchor="middle" style={{ letterSpacing: '0.12em' }}
              >
                CCS
              </text>
            )}
          </g>
        )
      })}

      {/* Agency SOC */}
      <g
        className="diagram-node"
        onClick={() => onNodeClick && onNodeClick('soc')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick && onNodeClick('soc') } }}
        tabIndex={0} role="button" aria-label="Agency SOC"
      >
        <circle cx={SOC.cx} cy={SOC.cy} r={SOC_R} fill="#161B22" stroke={ACCENT.coral} strokeWidth={2.5} />
        <foreignObject x={SOC.cx - 18} y={SOC.cy - 38} width={36} height={36}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EuiIcon type="logoSecurity" size="xl" />
          </div>
        </foreignObject>
        <text x={SOC.cx} y={SOC.cy + 10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#E6EDF3">Agency SOC</text>
        <text x={SOC.cx} y={SOC.cy + 28} textAnchor="middle" fontSize="11" fill="#8B949E">Federated hub</text>
        <g transform={`translate(${SOC.cx - 22}, ${SOC.cy + 38})`}>
          <rect width={44} height={16} rx={8} fill="#1A2A2E" stroke={ACCENT.teal} />
          <text x={22} y={11} textAnchor="middle" fontSize="9" fontWeight="700" fill="#6FDCD3" style={{ letterSpacing: '0.05em' }}>L4</text>
        </g>
      </g>

      {placed.map((sp) => (
        <Node
          key={sp.id}
          x={sp.x} y={sp.y} w={W} h={H}
          title={sp.label} subtitle={sp.sub} color={sp.color} dashed={sp.dashed}
          onClick={onNodeClick} componentId={sp.componentId}
          badges={sp.dashed ? [] : ['L4']}
        />
      ))}

      {/* Right-side support / control plane column */}
      <text x={1760} y={940} fontSize="11" fontWeight="700" fill="#E6EDF3" style={{ letterSpacing: '0.18em' }}>
        SUPPORT INFRASTRUCTURE
      </text>
      <line x1={1760} y1={952} x2={1980} y2={952} stroke="#2A3344" strokeWidth={1} />
      <Node x={1760} y={970} w={220} title="BYOK Encryption" subtitle="AWS KMS · Azure KV · GCP KMS" color="yellow" dashed icon="lock" onClick={onNodeClick} componentId="byok" badges={['L4']} />
      <Node x={1760} y={1090} w={220} title="NTP Time Sync" subtitle="USNO / NIST traceable" color="yellow" dashed icon="clock" onClick={onNodeClick} componentId="ntp" badges={['L4']} />
      <Node x={1760} y={1210} w={220} title="Cross-Cluster Search" subtitle="Federation mechanism" color="teal" icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccs" badges={['L4']} />
      <Node x={1760} y={1330} w={220} title="Cross-Cluster Replication" subtitle="Optional resilience" color="teal" dashed icon="crossClusterReplicationApp" onClick={onNodeClick} componentId="ccr" badges={['OPTIONAL']} />

      <Legend x={40} y={1540} />
    </svg>
  )
}
