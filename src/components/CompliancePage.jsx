import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ASSET_FILES, ASSET_TYPE_META, ASSET_FILE_MAP } from '../data/assets.js'

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { label: 'Achieve Compliance in Days' },
  { label: 'Coverage Matrix' },
  { label: 'Deployment-Ready Assets' },
  { label: "What's Not Covered?" },
]

// EUI Borealis vis color pairs — [active, light] per tab
const TAB_COLORS = [
  { active: '#16C5C0', light: '#A6EDEA' },
  { active: '#61A2FF', light: '#BFDBFF' },
  { active: '#EE72A6', light: '#FFC7DB' },
  { active: '#F6726A', light: '#FFC9C2' },
]

// Level badge colors
const LEVEL_BADGE = {
  L1: 'bg-accent-teal/10 text-accent-teal border-accent-teal/40',
  L2: 'bg-accent-blue/10 text-accent-blue border-accent-blue/40',
  L3: 'bg-accent-purple/10 text-accent-purple border-accent-purple/40',
  L4: 'bg-accent-coral/10 text-accent-coral border-accent-coral/40',
}

// ─── Capability areas (Tab 0) ─────────────────────────────────────────────────

const CAPABILITIES = {
  'day1-deploy': {
    title: 'Deploy Elastic + Configure Storage',
    subtitle: 'Elasticsearch, Kibana, Fleet Server, and ILM retention — all up on Day 1',
    color: 'teal',
    what: [
      'Elasticsearch cluster — self-managed, ECE, ECK, or Elastic Cloud (Enterprise license for ML)',
      'Kibana with SIEM app, Fleet Server, and Osquery Manager; all compliance pack assets loaded at init',
      'Hot/warm/cold/frozen ILM policies active from the start — data tiers automatically as it ages',
      'Snapshot policies to S3/GCS/Azure Blob provide THIRF-compliant retrievable retention at every level',
      'BYOK integration with agency KMS configurable for L4 encryption-at-rest without cluster changes',
    ],
    covers: ['Platform foundation', 'L1 — 6-month retrievable (THIRF)', 'L2 — 12-month retrievable', 'L3 — 3-month searchable + PII protections', 'L4 — 6-month searchable + BYOK'],
  },
  'agent-fleet': {
    title: 'Elastic Agent + Fleet',
    subtitle: 'Universal log collection and asset inventory — Appendix B complete from day one',
    color: 'blue',
    what: [
      'Agent integrations cover all 11 Appendix B event categories — identity, network, endpoint, DNS, cloud — without custom parser work',
      'Fleet Server enrollment auto-builds the Agency Logging Plan asset inventory and keeps it current as systems change',
      'Logstash bridges legacy syslog, Windows Event Forwarding, and OT/ICS sources that can\'t run native agents',
      'Osquery pack captures hardware (HWAM), software (SWAM), network interface, and user account inventory on every endpoint',
    ],
    covers: ['L1 — Complete Appendix B log collection', 'L2 — Full agency asset inventory in Fleet'],
  },
  'kibana-siem': {
    title: 'Elastic Security (SIEM + Detection Rules)',
    subtitle: 'Active monitoring, evidence dashboards, and ATO attestation — deployed in days',
    color: 'blue',
    what: [
      '11 detection rule sets (A–K) map one-to-one to every required Appendix B event category — no category goes undetected',
      'Elasticsearch Transform aggregates alert coverage into per-category compliance metrics, refreshed every hour',
      'Compliance Attestation Dashboard answers the AO\'s question in real time: "Is your detection layer working, and can you prove it?"',
      'Asset Coverage, Alert Coverage, Appendix B Log Coverage, Retention Compliance, and Log Management dashboards form a complete ATO evidence package',
    ],
    covers: ['L3 — Automated threat detection across all Appendix B categories', 'L3 — Real-time compliance evidence for ATO submissions'],
  },
  'elastic-ml': {
    title: 'Elastic ML + Enrichment',
    subtitle: 'Behavioral detection and IoC matching — the L3 differentiators',
    color: 'pink',
    what: [
      'ML anomaly detection jobs run continuously against a 6-month baseline, surfacing behavioral outliers that rule-based detection misses',
      'IoC matching checks live event streams against STIX/TAXII threat feeds and the CISA Known Exploited Vulnerabilities catalog in real time',
      'Risk-score transforms aggregate ML signals and rule alerts into prioritized, correlated findings before SOC triage',
      'Datafeed jobs refresh model state continuously so the anomaly baseline adapts to seasonal and organizational changes automatically',
    ],
    covers: ['L3 — Automated anomaly and behavioral detection (CEM)', 'L3 — Real-time IoC matching (STIX/TAXII/CISA KEV)', 'L4 — Risk-scored correlated alert feed'],
  },
  'cross-cluster': {
    title: 'Cross-Cluster Search + Federated Architecture',
    subtitle: 'Enterprise-scale and multi-agency logging for Level 4',
    color: 'coral',
    what: [
      'Cross-Cluster Search lets a top-level SOC query all distributed agency log stores from a single Kibana — no data movement required',
      'USNO/NIST-traceable NTP timestamps enforced across all agents and nodes produce tamper-evident forensic timelines',
      'On-prem, cloud cold, and object storage tiers compose into hybrid L4 architectures without re-deploying existing clusters',
      'Documented log-sharing configuration satisfies the annual CISA/FBI drill requirement with a tested, reproducible runbook',
    ],
    covers: ['L4 — Federated distributed logging architecture', 'L4 — Tamper-evident log integrity (NTP-synchronized timestamps)', 'L4 — Documented CISA/FBI log sharing procedure'],
  },
}

const PHASES = [
  { label: 'Day 1',      capIds: ['day1-deploy'] },
  { label: 'Days 2–7',   capIds: ['agent-fleet', 'kibana-siem'] },
  { label: 'Days 7–30',  capIds: ['elastic-ml'] },
  { label: 'Ongoing',    capIds: ['cross-cluster'] },
]

const COLOR = {
  teal:   { text: 'text-accent-teal',   border: 'border-accent-teal/40',   badge: 'bg-accent-teal/15 text-accent-teal border-accent-teal/40',     dot: 'bg-accent-teal',   bar: 'bg-accent-teal'   },
  blue:   { text: 'text-accent-blue',   border: 'border-accent-blue/40',   badge: 'bg-accent-blue/15 text-accent-blue border-accent-blue/40',     dot: 'bg-accent-blue',   bar: 'bg-accent-blue'   },
  yellow: { text: 'text-accent-yellow', border: 'border-accent-yellow/40', badge: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/40', dot: 'bg-accent-yellow', bar: 'bg-accent-yellow' },
  purple: { text: 'text-accent-purple', border: 'border-accent-purple/40', badge: 'bg-accent-purple/15 text-accent-purple border-accent-purple/40', dot: 'bg-accent-purple', bar: 'bg-accent-purple' },
  coral:  { text: 'text-accent-coral',  border: 'border-accent-coral/40',  badge: 'bg-accent-coral/15 text-accent-coral border-accent-coral/40',   dot: 'bg-accent-coral',  bar: 'bg-accent-coral'  },
  gray:   { text: 'text-text-muted',    border: 'border-line',             badge: 'bg-ink-700 text-text-muted border-line',                        dot: 'bg-text-muted',    bar: 'bg-line'          },
  green:  { text: 'text-accent-green',  border: 'border-accent-green/40',  badge: 'bg-accent-green/15 text-accent-green border-accent-green/40',   dot: 'bg-accent-green',  bar: 'bg-accent-green'  },
  pink:   { text: 'text-accent-purple',     border: 'border-accent-purple/40',     badge: 'bg-accent-purple/15 text-accent-purple border-accent-purple/40',            dot: 'bg-accent-purple',     bar: 'bg-accent-purple'     },
}

// ─── Coverage matrix data (Tab 1) ─────────────────────────────────────────────

const MATRIX_ROWS = [
  {
    req: 'Appendix B — complete event collection',
    reqDesc: 'All 11 required event categories must be actively collected from every applicable system in scope, with no coverage gaps.',
    cap: 'Elastic Agent integrations',
    capDesc: '20+ pre-built integrations cover all required source types. Fleet auto-enrols new systems as they appear.',
    l: [1,1,1,1],
    subs: [
      { id: 'A', name: 'Category A — Identity Events', desc: 'Auth successes/failures, MFA, SSO federation, account lifecycle (create/disable/delete)' },
      { id: 'B', name: 'Category B — Network Sessions', desc: 'IP flow records, VPN session logs, proxy logs, DNS query/response' },
      { id: 'C', name: 'Category C — Object/Resource Access', desc: 'File access, cloud storage objects, database queries, API calls to sensitive resources' },
      { id: 'D', name: 'Category D — Privilege Changes', desc: 'sudo/su, role assignment changes, group membership changes, permission escalation' },
      { id: 'E', name: 'Category E — Infrastructure Changes', desc: 'Cloud config changes, firewall rule edits, routing changes, new device enrollment' },
      { id: 'F', name: 'Category F — Security Tool Alerts', desc: 'EDR/EPP detections, IDS/IPS alerts, DLP violations, vulnerability scanner findings' },
      { id: 'G', name: 'Category G — IoC Events', desc: 'Matches against known-bad IPs, domains, file hashes, and URLs from threat intelligence feeds' },
      { id: 'H', name: 'Category H — Automated Alerts', desc: 'SIEM rule-based detections, behavioral anomaly alerts, compliance degradation alerts' },
      { id: 'I', name: 'Category I — Anomalous Activity', desc: 'ML-detected behavioral outliers, deviations from user/host baselines' },
      { id: 'J', name: 'Category J — Error/Crash Events', desc: 'Application error logs, service crash reports, process termination events' },
      { id: 'K', name: 'Category K — DNS Activity', desc: 'Full DNS query/response logs, DNS-over-HTTPS, DNS tunneling indicators' },
    ],
  },
  {
    req: 'Asset inventory in Agency Logging Plan',
    reqDesc: 'A complete, documented inventory of all log-producing systems must be maintained and reflected in the Agency Logging Plan.',
    cap: 'Fleet Server + osquery pack',
    capDesc: 'Fleet enrollment auto-builds and maintains an up-to-date asset inventory. Osquery captures hardware, software, and network state per endpoint.',
    l: [0,1,1,1],
  },
  {
    req: '6-month retrievable log retention (THIRF)',
    reqDesc: 'All collected logs must be retrievable — not necessarily immediately searchable — for a minimum of 6 months from collection.',
    cap: 'ILM policies + S3 snapshots',
    capDesc: 'Pre-configured ILM policies roll data from hot to frozen, then snapshot to S3-compatible object storage with a configurable retention floor.',
    l: [1,1,1,1],
  },
  {
    req: '12-month retrievable log retention (THIRF)',
    reqDesc: 'The retrievable window expands to 12 months at L2, supporting longer-horizon incident investigations and forensic reviews.',
    cap: 'ILM policies + S3 snapshots (L2+ variant)',
    capDesc: 'L2/L3/L4 ILM variants extend the frozen/snapshot tier to 12 months before deletion. No-delete variants available for NARA-scoped agencies.',
    l: [0,1,1,1],
  },
  {
    req: '3-month searchable retention (CEM)',
    reqDesc: 'L3 introduces the first CEM requirement: 3 months of immediately searchable log data, queryable without retrieval delays, across all Appendix B categories.',
    cap: 'Hot/frozen ILM policy — L3 variant',
    capDesc: 'The L3 ILM policy keeps data on hot/warm nodes for 90+ days before tiering, maintaining a 3-month search-available window.',
    l: [0,0,1,1],
  },
  {
    req: '6-month searchable retention (CEM)',
    reqDesc: 'L4 doubles the searchable window to 6 months, enabling cross-event correlation and threat hunting across longer timeframes.',
    cap: 'Hot/frozen ILM policy — L4 variant',
    capDesc: 'The L4 ILM policy extends the hot/warm retention to 180+ days. Extended frozen-tier window satisfies the full L4 THIRF requirement simultaneously.',
    l: [0,0,0,1],
  },
  {
    req: 'Sensitive data protections (PII masking)',
    reqDesc: 'Agencies must apply masking, redaction, or encryption to sensitive fields (PII, PHI, credentials) before logs reach searchable storage.',
    cap: 'Ingest pipeline processors',
    capDesc: 'The alert category enrichment pipeline includes configurable redact/hash processors. Agencies configure which fields are sensitive per their data classification policy.',
    l: [0,0,1,1],
  },
  {
    req: 'Automated threat detection — all Appendix B categories',
    reqDesc: 'Agencies must deploy and operate automated detection rules covering every required Appendix B event category — not just ingest, but active monitoring for adversarial behavior.',
    cap: 'Detection Rules A–K',
    capDesc: '11 Appendix B detection rule sets (A–K) containing 20+ individual rules, each mapped to a specific category and MITRE ATT&CK technique.',
    l: [0,0,1,1],
    subs: [
      { id: 'A', name: 'AppB-A — Identity Events (4 rules)', desc: 'Credential stuffing (Windows/Okta), Azure auth failure chain, Linux SSH brute force' },
      { id: 'B', name: 'AppB-B — C2 Beaconing (1 rule)', desc: 'Periodic outbound connection pattern consistent with command-and-control beaconing' },
      { id: 'C', name: 'AppB-C — Mass File Access (1 rule)', desc: 'High-volume file access events consistent with ransomware staging or bulk exfiltration' },
      { id: 'D', name: 'AppB-D — Privilege Escalation (1 rule)', desc: 'Token manipulation and local privilege escalation sequences' },
      { id: 'E', name: 'AppB-E — Infrastructure Changes (3 rules)', desc: 'Rogue device detection + unexpected OT/ICS engineering workstation activity' },
      { id: 'F', name: 'AppB-F — EDR Tamper (1 rule)', desc: 'Elastic Agent process termination or service disable — indicates defense evasion' },
      { id: 'G', name: 'AppB-G — IoC Monitoring (4 rules)', desc: 'STIX/TAXII and CISA KEV indicator matches against network, file, URL, and process events' },
      { id: 'H', name: 'AppB-H — Off-Hours Execution (1 rule)', desc: 'Privileged process execution during non-business hours on sensitive hosts' },
      { id: 'I', name: 'AppB-I — Exfiltration Volume (1 rule)', desc: 'Anomalous outbound data volume spike above rolling 30-day baseline' },
      { id: 'J', name: 'AppB-J — APT Kill Chain (2 rules)', desc: 'Multi-stage attack correlating recon, initial access, and lateral movement events' },
      { id: 'K', name: 'AppB-K — Coverage Gap Meta (2 rules)', desc: 'Fires when any Appendix B log category stops receiving events — compliance degradation early warning' },
    ],
  },
  {
    req: 'Anomaly and behavioral detection (ML)',
    reqDesc: 'L3 requires ML-driven behavioral analysis running against historical baselines — not just signature-based rules, but detection of novel patterns.',
    cap: 'Elastic ML anomaly jobs + datafeeds',
    capDesc: '6 ML anomaly detection jobs with corresponding datafeeds: DNS entropy, auth anomalies, rare processes, rare network destinations, and compliance metric drift.',
    l: [0,0,1,1],
  },
  {
    req: 'IoC matching (STIX/TAXII/CISA KEV)',
    reqDesc: 'Live event streams must be continuously matched against known indicators of compromise from authoritative threat intelligence sources including CISA KEV.',
    cap: 'Threat Intel rules (AppB-G, 4 rules)',
    capDesc: 'Four IoC matching rules covering STIX/TAXII indicator feeds and the CISA Known Exploited Vulnerabilities catalog across network, file, URL, and process events.',
    l: [0,0,1,1],
  },
  {
    req: 'Alert correlation and risk scoring',
    reqDesc: 'Individual rule alerts must be aggregated into higher-confidence, risk-scored findings to reduce SOC false-positive burden before triage.',
    cap: 'Risk-score transforms (2)',
    capDesc: 'Two Elasticsearch Transforms — daily rollup and latest-value — compute per-category coverage scores and compliance posture metrics in real time.',
    l: [0,0,1,1],
  },
  {
    req: 'CEM compliance attestation dashboard',
    reqDesc: 'Agencies need real-time, exportable evidence that detection rules are active and generating alerts across all 11 Appendix B categories — the core AO attestation artifact.',
    cap: 'Kibana dashboards + transforms',
    capDesc: '5 pre-built dashboards: Maturity Overview, Asset Coverage, Alert Coverage (Appendix B), Appendix B Log Coverage, and Compliance Attestation.',
    l: [0,0,1,1],
  },
  {
    req: 'Federated cross-agency log query',
    reqDesc: 'L4 requires a top-level SOC to query all distributed agency log stores from a single interface without replicating data to a central repository.',
    cap: 'Cross-Cluster Search (CCS)',
    capDesc: 'Elasticsearch CCS enables a central Kibana to query remote clusters across any network topology — no data movement, full Kibana query support.',
    l: [0,0,0,1],
  },
  {
    req: 'Encryption at rest (BYOK / agency KMS)',
    reqDesc: 'L4 requires cryptographic protection of stored log data using agency-controlled key material — not platform-managed encryption alone.',
    cap: 'Elastic BYOK / KMS integration',
    capDesc: 'Elastic supports BYOK via AWS KMS, Azure Key Vault, and GCP KMS integration, giving agencies full key custody over indexed log data.',
    l: [0,0,0,1],
  },
  {
    req: 'Tamper-evident NTP-synchronized timestamps',
    reqDesc: 'All log events must carry timestamps traceable to USNO or NIST time sources, producing a legally admissible forensic timeline resistant to backdating.',
    cap: 'Log integrity pipeline + NTP agent config',
    capDesc: 'Log integrity hash pipeline computes SHA-256 event fingerprints at ingest time. NTP configuration is applied via Fleet agent policy to all enrolled hosts.',
    l: [0,0,0,1],
  },
]

// ─── Architecture layers for Assets tab (Tab 2) ───────────────────────────────

const ARCH_LAYERS = [
  {
    id: 'sources',
    label: 'Sources',
    color: 'gray',
    desc: 'Log-producing systems — endpoints, servers, network devices, cloud workloads, SaaS. Enrolled via Fleet; legacy and OT sources bridged via Logstash.',
    assetIds: [],
  },
  {
    id: 'collection',
    label: 'Collection',
    color: 'teal',
    desc: 'Fleet-managed Elastic Agent with osquery pack for endpoint inventory. Collects hardware, software, network, and user account state across all enrolled endpoints.',
    assetIds: ['fleet-osquery-pack'],
  },
  {
    id: 'ingest',
    label: 'Ingest',
    color: 'blue',
    desc: 'Elasticsearch ingest pipelines that enrich, normalize, and hash log data before indexing — Appendix B category tagging, ECS normalization, SHA-256 integrity fingerprints.',
    assetIds: ['pipeline-alert-category', 'pipeline-osquery-normalize', 'pipeline-log-integrity-hash'],
  },
  {
    id: 'retention',
    label: 'Retention',
    color: 'green',
    desc: 'ILM policies, index templates, and transforms governing hot/frozen tiering, snapshot schedules, and data stream layout — the foundation of THIRF compliance.',
    assetIds: [
      'ilm-asset-inventory', 'ilm-logs-l3-hot-frozen', 'ilm-logs-l3-no-delete', 'ilm-logs-l4-hot-frozen', 'ilm-logs-l4-no-delete',
      'template-alert-coverage', 'template-osquery-hardware', 'template-osquery-network', 'template-osquery-software', 'template-log-integrity', 'template-logs-data-streams',
      'transform-alert-coverage-daily', 'transform-alert-coverage-latest',
      'dash-log-management',
    ],
  },
  {
    id: 'cem',
    label: 'CEM',
    color: 'purple',
    desc: 'Continuous Event Monitoring — compliance dashboards, Appendix B detection rules, ML anomaly detection jobs, and datafeeds providing real-time threat visibility.',
    assetIds: [
      'dash-maturity-overview', 'dash-asset-coverage', 'dash-alert-coverage', 'dash-appendix-b-coverage', 'dash-compliance-attestation',
      'rule-appendixb-a', 'rule-appendixb-b', 'rule-appendixb-c', 'rule-appendixb-d',
      'rule-appendixb-e-ot', 'rule-appendixb-e-rogue', 'rule-appendixb-f', 'rule-appendixb-g',
      'rule-appendixb-h', 'rule-appendixb-i', 'rule-appendixb-j', 'rule-appendixb-k',
      'rule-ml-cata-auth', 'rule-ml-cata-rare-ip', 'rule-ml-cata-ueba', 'rule-ml-catb-dns',
      'rule-ml-catb-country', 'rule-ml-cath-linux', 'rule-ml-cath-windows', 'rule-ml-compliance',
      'rule-ml-e1', 'rule-ml-e2', 'rule-ml-e3', 'rule-ml-e4', 'rule-ml-e5',
      'ml-job-catb-dns', 'ml-job-element1', 'ml-job-element2', 'ml-job-element3', 'ml-job-element4', 'ml-job-element5',
      'datafeed-catb-dns', 'datafeed-element1', 'datafeed-element2', 'datafeed-element3', 'datafeed-element4', 'datafeed-element5',
      'datafeed-auth-high-fails', 'datafeed-suspicious-login', 'datafeed-auth-rare-ip', 'datafeed-rare-country',
      'datafeed-rare-process-linux', 'datafeed-rare-process-windows', 'datafeed-rare-process-v3',
    ],
  },
  {
    id: 'thirf',
    label: 'THIRF',
    color: 'coral',
    desc: 'Threat Hunting, Investigation, Response & Forensics — retention evidence dashboards showing searchable/retrievable coverage windows for ATO submissions.',
    assetIds: ['dash-retention-compliance'],
  },
]

// ─── Source integration references (Sources layer) ────────────────────────────

const SOURCE_REFS = [
  {
    group: 'Elastic Agent Integrations',
    groupHref: 'https://www.elastic.co/integrations',
    items: [
      { name: 'Elastic Defend',                   cats: 'A–K',     desc: 'Native EDR — endpoint process, file, network, and registry telemetry covering all Appendix B categories', href: 'https://docs.elastic.co/integrations/endpoint' },
      { name: 'Okta',                              cats: 'A',       desc: 'Identity events, SSO federation, MFA events, account lifecycle', href: 'https://docs.elastic.co/integrations/okta' },
      { name: 'Microsoft Entra ID (Azure AD)',      cats: 'A',       desc: 'Azure AD auth events, conditional access logs, identity lifecycle', href: 'https://docs.elastic.co/integrations/azure' },
      { name: 'Windows Event Log',                 cats: 'A, D',    desc: 'Auth success/failure, privilege escalation, process creation (Event ID 4688)', href: 'https://docs.elastic.co/integrations/windows' },
      { name: 'Linux auditd',                      cats: 'C, D',    desc: 'System call auditing, file access events, privilege changes', href: 'https://docs.elastic.co/integrations/auditd' },
      { name: 'Osquery Manager',                   cats: 'E, Plan', desc: 'HWAM/SWAM asset inventory, network interface state, local user accounts — populates Agency Logging Plan', href: 'https://docs.elastic.co/integrations/osquery_manager' },
      { name: 'Zeek',                              cats: 'B, K',    desc: 'Full network session metadata, DNS query/response logs, protocol analysis', href: 'https://docs.elastic.co/integrations/zeek' },
      { name: 'Suricata',                          cats: 'F, G',    desc: 'IDS/IPS alerts, network-based IoC detection, protocol anomalies', href: 'https://docs.elastic.co/integrations/suricata' },
      { name: 'AWS (CloudTrail, VPC Flow, S3)',     cats: 'C, E',    desc: 'Cloud resource access, infrastructure change events, VPC network flow logs', href: 'https://docs.elastic.co/integrations/aws' },
      { name: 'Microsoft Azure (Activity, Monitor)', cats: 'C, E',  desc: 'Azure management plane events, resource changes, activity audit trail', href: 'https://docs.elastic.co/integrations/azure' },
      { name: 'Google Cloud (Audit, VPC)',          cats: 'C, E',    desc: 'GCP audit logs, VPC flow logs, cloud infrastructure access events', href: 'https://docs.elastic.co/integrations/gcp' },
      { name: 'CrowdStrike Falcon',                cats: 'F',       desc: 'EDR process behavioral detections, threat intelligence, device events', href: 'https://docs.elastic.co/integrations/crowdstrike' },
      { name: 'SentinelOne',                       cats: 'F',       desc: 'Endpoint protection alerts, behavioral detections, response actions', href: 'https://docs.elastic.co/integrations/sentinel_one' },
      { name: 'Microsoft Defender',                cats: 'F',       desc: 'M365 Defender endpoint and identity protection alerts', href: 'https://docs.elastic.co/integrations/microsoft_defender_endpoint' },
      { name: 'Threat Intel (MISP / STIX / TAXII)', cats: 'G',      desc: 'IoC indicator feeds — IP, domain, hash, URL for real-time matching against event streams', href: 'https://docs.elastic.co/integrations/ti_misp' },
    ],
  },
  {
    group: 'Beats Modules',
    groupHref: 'https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-modules.html',
    items: [
      { name: 'Filebeat — System',           cats: 'A, J',    desc: 'Linux syslog, auth.log, application error and crash events', href: 'https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-module-system.html' },
      { name: 'Filebeat — Cisco ASA / FTD',  cats: 'B',       desc: 'Firewall session logs, VPN events from Cisco ASA and Firepower appliances', href: 'https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-module-cisco.html' },
      { name: 'Filebeat — Palo Alto Networks', cats: 'B, F',  desc: 'NGFW traffic, threat, and URL filtering event logs', href: 'https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-module-panw.html' },
      { name: 'Winlogbeat',                  cats: 'A, D, H', desc: 'Windows Security, System, and Application event channels; supports WEF-forwarded events', href: 'https://www.elastic.co/guide/en/beats/winlogbeat/current/index.html' },
      { name: 'Packetbeat',                  cats: 'B, K',    desc: 'Wire-level DNS, HTTP, TLS, and database protocol analysis', href: 'https://www.elastic.co/guide/en/beats/packetbeat/current/index.html' },
      { name: 'Auditbeat',                   cats: 'C, D',    desc: 'Linux auditd kernel events, file integrity monitoring, process and user tracking', href: 'https://www.elastic.co/guide/en/beats/auditbeat/current/index.html' },
    ],
  },
  {
    group: 'Logstash Input Plugins',
    groupHref: 'https://www.elastic.co/guide/en/logstash/current/input-plugins.html',
    items: [
      { name: 'logstash-input-syslog', cats: 'A–K', desc: 'RFC 5424/3164 receiver — bridges legacy network devices, OT/ICS sources, and mainframes that cannot run native agents', href: 'https://www.elastic.co/guide/en/logstash/current/plugins-inputs-syslog.html' },
      { name: 'logstash-input-beats',  cats: 'A–K', desc: 'Receives events from any Beats shipper; enables WEF-forwarded Winlogbeat and legacy pipeline migration', href: 'https://www.elastic.co/guide/en/logstash/current/plugins-inputs-beats.html' },
      { name: 'logstash-input-kafka',  cats: 'A–K', desc: 'High-throughput ingest from existing Kafka-based log pipelines (SIEM migrations, multi-tenant environments)', href: 'https://www.elastic.co/guide/en/logstash/current/plugins-inputs-kafka.html' },
      { name: 'logstash-input-jdbc',   cats: 'C',   desc: 'Polls SQL databases for object/resource access audit events (Category C)', href: 'https://www.elastic.co/guide/en/logstash/current/plugins-inputs-jdbc.html' },
      { name: 'logstash-input-s3',     cats: 'C, E', desc: 'Pulls CloudTrail, VPC flow, and S3 access logs from S3-compatible object storage', href: 'https://www.elastic.co/guide/en/logstash/current/plugins-inputs-s3.html' },
    ],
  },
]

// ─── Agency obligations (Tab 3) ───────────────────────────────────────────────

const OBLIGATIONS = [
  {
    title: 'Agency Logging Plan',
    when: 'Within 90 days of LRA',
    desc: 'A documented plan identifying every log source in scope, current coverage gaps, and your inventory methodology. Writing and submitting the plan is your agency\'s obligation — no platform can do it for you.',
    assist: 'Fleet enrollment auto-builds and continuously maintains the asset inventory that populates your Logging Plan. The Asset Coverage dashboard exports a ready-to-attach evidence report with per-source coverage status, enrollment gaps, and Appendix B category mapping.',
  },
  {
    title: 'Data Classification Policy',
    when: 'Before L3 deployment',
    desc: 'You must define which fields are sensitive under your agency\'s data classification schema, which redaction rules apply to each data type, and how PII is handled before it reaches searchable storage.',
    assist: 'Elastic\'s ingest pipelines include configurable redact, hash, and drop processors ready to apply your policy the moment it\'s defined. Field-level security in Elasticsearch restricts access to sensitive fields per role, and the Sensitive Data Protection dashboard tracks masking coverage across all log sources.',
  },
  {
    title: 'Log Source Gap Remediation',
    when: 'Ongoing',
    desc: 'Elastic Agent covers every major Appendix B category, but you must ensure every applicable system in your environment is enrolled. Edge-case sources — legacy mainframes, custom OT systems, air-gapped enclaves — require agency-specific integration work.',
    assist: 'The Log Coverage Gap dashboard surfaces every Appendix B category that has stopped receiving events, the Asset Coverage report shows un-enrolled hosts, and the compliance pack includes Logstash pipeline templates for syslog, WEF, and OT/ICS bridging to minimize custom integration work.',
  },
  {
    title: 'CISA / FBI Log Sharing Procedure',
    when: 'Before L4 attestation',
    desc: 'Level 4 requires a documented, annually-tested procedure for producing logs on request to CISA and the FBI. This is a governance runbook — your ISSO, General Counsel, and mission owner own it, not your logging platform.',
    assist: 'The Cross-Cluster Search configuration and CISA/FBI Export dashboard provide the technical mechanism for on-demand log export. The compliance pack includes a runbook template with the required data elements, test-drill checklist, and evidence capture steps — ready to be adapted to your agency\'s governance process.',
  },
  {
    title: 'Authority to Operate (ATO)',
    when: 'Per FISMA cycle',
    desc: 'The ATO is your agency\'s formal authorization to operate the logging system under FISMA. Elastic provides the technical evidence — but the risk acceptance decision, system security plan, and authorization package belong to your Authorizing Official.',
    assist: 'The Compliance Attestation Dashboard, Alert Coverage report, Retention Compliance view, and Appendix B Log Coverage dashboard together form a pre-structured ATO evidence package. All are exportable as PDF-ready Kibana reports and map directly to the control families auditors check.',
  },
  {
    title: 'Incident Response Procedures',
    when: 'Ongoing',
    desc: 'Elastic detects and triages threats — but declaring an incident, activating your IR team, notifying stakeholders, and coordinating with CISA under CIRCIA requires organizational procedures and trained personnel that no logging platform can substitute for.',
    assist: 'Elastic Security\'s case management, alert escalation workflows, and timeline investigation view accelerate response once an incident is declared. Detection rules can be mapped to your IR playbooks so analysts have the relevant runbook steps surfaced alongside each alert.',
  },
  {
    title: 'Privacy Impact Assessment (PIA)',
    when: 'Before L3 deployment',
    desc: 'Systems that collect or process PII require a PIA under the Privacy Act and OMB A-130. Your agency\'s privacy officer must assess the logging system before L3 deployment — Elastic can\'t complete this assessment on your behalf.',
    assist: 'Elastic\'s data inventory and field-level security features provide the artifact inputs a PIA requires: a documented list of PII fields collected, the masking and access controls applied, and which roles can query sensitive data. The ingest pipeline configuration serves as the technical evidence annex.',
  },
]

// ─── Shared level colors ───────────────────────────────────────────────────────

const LEVEL_HEAD_COLORS = ['text-accent-teal', 'text-accent-blue', 'text-accent-purple', 'text-accent-coral']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [hoveredTab, setHoveredTab] = useState(-1)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeTab])

  return (
    <main className="mx-auto max-w-[1800px] px-8 py-10 flex flex-col gap-10">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent-teal px-3 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/30 mb-5"
          style={{ borderStyle: 'solid' }}>
          M-26-14 Compliance Accelerator
        </span>
        <div className="flex items-start justify-between gap-8 flex-wrap">
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-text-primary leading-tight">
              Deploy Elastic,&nbsp;<span className="text-accent-teal">Leapfrog to Level 3.</span>
            </h1>
            <p className="text-lg text-text-muted leading-relaxed">
              Most agencies treat M-26-14 compliance as a multi-year integration project. It doesn't have to be.
              Elastic's core platform — log collection, tiered storage, SIEM detection, and ML anomaly detection — maps
              directly to every technical requirement across Levels 1 through 3.{' '}
              <span className="text-text-primary font-semibold">Deploy once, activate the compliance pack,
              and your technical posture is compliance-ready from day one.</span>
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2 items-end">
            <Link
              to="/maturity/small/1"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-accent-teal/50 bg-accent-teal/10 text-accent-teal font-semibold hover:bg-accent-teal/20 transition-colors text-sm whitespace-nowrap"
              style={{ borderStyle: 'solid' }}
            >
              View reference architecture diagrams →
            </Link>
            <Link
              to="/asset-inventory"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-accent-blue/50 bg-accent-blue/10 text-accent-blue font-semibold hover:bg-accent-blue/20 transition-colors text-sm whitespace-nowrap"
              style={{ borderStyle: 'solid' }}
            >
              Browse deployment-ready assets →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {TABS.map((tab, i) => {
          const isActive = activeTab === i
          const isHovered = hoveredTab === i
          const bgColor = isActive
            ? (isHovered ? 'rgb(var(--accent-blue) / 0.82)' : 'rgb(var(--accent-blue) / 1)')
            : (isHovered ? 'rgb(var(--accent-blue) / 0.10)' : 'transparent')
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              onMouseEnter={() => setHoveredTab(i)}
              onMouseLeave={() => setHoveredTab(-1)}
              className="rounded-lg px-4 py-3 text-center font-medium text-lg transition-all text-text-primary"
              style={{ backgroundColor: bgColor, border: 'none', ...(isActive && { color: '#FFFFFF' }) }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content (shared scroll container) ────────────────────────── */}
      <div
        ref={scrollRef}
        className="overflow-y-auto rounded-lg"
        style={{ height: 'calc(100vh - 380px)', minHeight: 460 }}
      >
        {/* Tab 0 — Compliance in Days */}
        <div className={activeTab === 0 ? 'p-1 pb-10' : 'hidden'}>
          <ComplianceInDaysTab />
        </div>

        {/* Tab 1 — Coverage Matrix */}
        <div className={activeTab === 1 ? 'h-full' : 'hidden'}>
          <CoverageMatrixTab />
        </div>

        {/* Tab 2 — Deployment-Ready Assets */}
        <div className={activeTab === 2 ? '' : 'hidden'}>
          <AssetsTab scrollRef={scrollRef} active={activeTab === 2} />
        </div>

        {/* Tab 3 — Obligations */}
        <div className={activeTab === 3 ? 'p-1 pb-10' : 'hidden'}>
          <ObligationsTab />
        </div>
      </div>

    </main>
  )
}

// ─── Tab 0: Compliance in Days ─────────────────────────────────────────────────

function ComplianceInDaysTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ minHeight: 'calc(100vh - 420px)' }}>
      {PHASES.map((phase, pi) => {
        const tc = TAB_COLORS[pi]
        const caps = phase.capIds.map(id => CAPABILITIES[id]).filter(Boolean)
        return (
          <div key={phase.label} className="flex flex-col gap-3 h-full">
            {/* Phase header */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-2"
                style={{ borderColor: tc.active, color: tc.active, borderStyle: 'solid' }}>
                {phase.label}
              </span>
              <div className="flex-1 h-px opacity-30" style={{ backgroundColor: tc.active }} />
            </div>

            {/* Cards fill column height equally */}
            <div className="flex flex-col gap-3 flex-1">
              {caps.length === 1 ? (
                (() => {
                  const cap = caps[0]
                  const c = COLOR[cap.color]
                  return (
                    <div className={`rounded-lg bg-ink-800 border ${c.border} flex flex-col overflow-hidden flex-1`}
                      style={{ borderStyle: 'solid' }}>
                      <div className={`h-1 w-full ${c.bar}`} />
                      <div className="p-5 flex flex-col gap-4 flex-1">
                        <div>
                          <p className={`text-base font-bold ${c.text}`}>{cap.title}</p>
                          <p className="text-sm text-text-muted mt-1 leading-snug">{cap.subtitle}</p>
                        </div>
                        <ul className="space-y-2 flex-1">
                          {cap.what.map((w, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-text-primary leading-relaxed">
                              <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                              {w}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-1.5 flex-wrap pt-1">
                          {cap.covers.map((cv, i) => {
                            const lvl = cv.substring(0, 2)
                            const lc = LEVEL_BADGE[lvl] ?? 'bg-ink-700 text-text-muted border-line'
                            return (
                              <span key={i}
                                className={`text-xs px-2 py-0.5 rounded border font-medium ${lc}`}
                                style={{ borderStyle: 'solid' }}>
                                ✓ {cv}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                (() => {
                  const c = COLOR[caps[0].color]
                  return (
                    <div className={`rounded-lg bg-ink-800 border ${c.border} flex flex-col overflow-hidden flex-1`}
                      style={{ borderStyle: 'solid' }}>
                      <div className={`h-1 w-full ${c.bar}`} />
                      {caps.map((cap, ci) => (
                        <React.Fragment key={cap.title}>
                          {ci > 0 && <div className="border-t border-line/40 mx-5" />}
                          <div className="p-5 flex flex-col gap-4 flex-1">
                            <div>
                              <p className={`text-base font-bold ${c.text}`}>{cap.title}</p>
                              <p className="text-sm text-text-muted mt-1 leading-snug">{cap.subtitle}</p>
                            </div>
                            <ul className="space-y-2 flex-1">
                              {cap.what.map((w, i) => (
                                <li key={i} className="flex gap-2.5 text-sm text-text-primary leading-relaxed">
                                  <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                  {w}
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                              {cap.covers.map((cv, i) => {
                                const lvl = cv.substring(0, 2)
                                const lc = LEVEL_BADGE[lvl] ?? 'bg-ink-700 text-text-muted border-line'
                                return (
                                  <span key={i}
                                    className={`text-xs px-2 py-0.5 rounded border font-medium ${lc}`}
                                    style={{ borderStyle: 'solid' }}>
                                    ✓ {cv}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab 1: Coverage Matrix ────────────────────────────────────────────────────

const Chevron = ({ open }) => (
  <svg className={`w-4 h-4 text-accent-blue transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

function CoverageMatrixTab() {
  const [expanded, setExpanded] = useState(new Set())
  const toggle = (i) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  return (
    <div className="rounded-lg border border-line bg-ink-800 overflow-hidden flex flex-col"
         style={{ height: 'calc(100vh - 380px)', minHeight: 440, borderStyle: 'solid' }}>
      {/* Panel header */}
      <div className="px-5 py-5 border-b border-line shrink-0">
        <h2 className="text-xl font-semibold text-text-primary">Compliance Coverage Matrix</h2>
        <p className="text-base text-text-muted mt-1.5 leading-relaxed">
          Each row is an M-26-14 technical requirement. ✓ = Elastic capability satisfies it when the asset is deployed.
          Rows with a <span className="inline-flex items-center align-middle mx-0.5"><Chevron open={false} /></span> expand to show sub-items.
        </p>
      </div>

      {/* Scrollable table area */}
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="text-sm text-text-muted bg-ink-700 border-b border-line">
              <th className="py-3 pl-5 pr-4 text-left font-semibold w-10" />
              <th className="py-3 pr-4 text-left font-semibold">Requirement</th>
              <th className="py-3 pr-4 text-left font-semibold">Elastic Capability</th>
              {['L1','L2','L3','L4'].map((l, i) => (
                <th key={l} className={`py-3 px-4 text-center font-bold text-base ${LEVEL_HEAD_COLORS[i]}`}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row, i) => {
              const isOpen = expanded.has(i)
              const hasExpand = row.subs?.length > 0
              const stripe = i % 2 !== 0
              return (
                <React.Fragment key={i}>
                  <tr
                    className={`border-b border-line/40 transition-colors ${stripe ? 'bg-ink-900/50' : ''} ${
                      hasExpand
                        ? 'cursor-pointer hover:bg-accent-blue/[0.10]'
                        : 'hover:bg-accent-blue/[0.07]'
                    }`}
                    onClick={hasExpand ? () => toggle(i) : undefined}
                  >
                    {/* Chevron */}
                    <td className="py-4 pl-5 pr-2 w-10 align-top pt-5">
                      {hasExpand && <Chevron open={isOpen} />}
                    </td>
                    {/* Requirement */}
                    <td className="py-4 pr-4 align-top">
                      <p className="text-base font-semibold text-text-primary leading-snug">{row.req}</p>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{row.reqDesc}</p>
                    </td>
                    {/* Capability */}
                    <td className="py-4 pr-4 align-top">
                      <p className="text-base font-mono font-semibold text-text-primary leading-snug">{row.cap}</p>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{row.capDesc}</p>
                    </td>
                    {/* Level checkmarks */}
                    {row.l.map((covered, li) => (
                      <td key={li} className="py-4 px-4 text-center align-middle">
                        {covered
                          ? <span className="text-accent-green font-bold text-lg">✓</span>
                          : <span className="text-text-muted/20 text-lg">—</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Sub-rows */}
                  {isOpen && row.subs?.map((sub) => (
                    <tr key={sub.id} className="border-b border-line/20 bg-accent-blue/5">
                      <td className="py-2.5 pl-5 pr-2" />
                      <td colSpan={2} className="py-2.5 pr-4 pl-4">
                        <div className="flex gap-2.5 items-start">
                          <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/30 px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                            style={{ borderStyle: 'solid' }}>
                            {sub.id}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-text-primary leading-snug">{sub.name.replace(/^[A-K]\s—\s/, '')}</p>
                            <p className="text-sm text-text-muted leading-relaxed">{sub.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td colSpan={4} />
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-line/50 shrink-0">
        <p className="text-xs text-text-muted italic">
          ✓ = Requirement satisfied when the corresponding Elastic asset is deployed and configured. Requirements at higher levels also apply to all preceding levels.
        </p>
      </div>
    </div>
  )
}

// ─── Tab 2: Deployment-Ready Assets ───────────────────────────────────────────

function AssetsTab({ scrollRef, active }) {
  const [activeLayer, setActiveLayer] = useState('collection')
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(ARCH_LAYERS.map(l => [l.id, true]))
  )
  const sectionRefs = useRef({})

  const toggleSection = useCallback((id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  useEffect(() => {
    if (!active || !scrollRef.current) return
    const root = scrollRef.current
    const observers = []
    ARCH_LAYERS.forEach(layer => {
      const el = sectionRefs.current[layer.id]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveLayer(layer.id) },
        { root, rootMargin: '-15% 0px -70% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(obs => obs.disconnect())
  }, [active, scrollRef])

  const scrollToLayer = useCallback((layer) => {
    const el = sectionRefs.current[layer.id]
    if (el && scrollRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top
      const elTop = el.getBoundingClientRect().top
      scrollRef.current.scrollBy({ top: elTop - containerTop - 120, behavior: 'smooth' })
    }
  }, [scrollRef])

  return (
    <div>
      {/* Sticky arch layer nav */}
      <div className="sticky top-0 z-10 bg-ink-900 pt-1 pb-3 px-6 border-b border-line">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {ARCH_LAYERS.map(layer => {
            const c = COLOR[layer.color]
            const isActive = activeLayer === layer.id
            const itemCount = layer.id === 'sources'
              ? SOURCE_REFS.reduce((n, g) => n + g.items.length, 0)
              : layer.assetIds.length
            return (
              <button
                key={layer.id}
                onClick={() => scrollToLayer(layer)}
                className={`rounded-lg border px-4 py-4 text-left transition-all ${
                  isActive
                    ? `${c.border} ${c.badge} shadow-sm`
                    : 'border-line bg-ink-800 text-text-muted hover:border-line hover:bg-ink-700'
                }`}
                style={{ borderStyle: 'solid' }}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-sm font-bold ${isActive ? c.text : 'text-text-primary'}`}>{layer.label}</span>
                  {itemCount > 0 && (
                    <span className={`text-xs font-mono ${isActive ? c.text : 'text-text-muted'}`}>{itemCount}</span>
                  )}
                </div>
                <p className="text-xs text-text-muted leading-snug line-clamp-2">{layer.desc.split(' — ')[0]}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Accordion sections */}
      <div className="px-6 pt-4 pb-12 space-y-1">
        {ARCH_LAYERS.map(layer => {
          const assets = layer.id === 'sources' ? [] : layer.assetIds.map(id => ASSET_FILE_MAP[id]).filter(Boolean)
          const itemCount = layer.id === 'sources'
            ? SOURCE_REFS.reduce((n, g) => n + g.items.length, 0)
            : assets.length
          const isOpen = openSections[layer.id]

          return (
            <section key={layer.id} ref={el => sectionRefs.current[layer.id] = el}>
              {/* Accordion header */}
              <button
                onClick={() => toggleSection(layer.id)}
                className="w-full flex items-center gap-2 py-3 text-left"
              >
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <h3 className="text-base font-semibold text-text-primary">{layer.label}</h3>
                <div className="flex-1 h-px bg-line/50 mx-1" />
                <span className="text-xs text-text-muted">
                  {layer.id === 'sources' ? `${itemCount} integrations` : `${itemCount || 'no'} assets`}
                </span>
              </button>

              {isOpen && (
                <div className="pb-4">
                  <p className="text-sm text-text-muted leading-relaxed mb-4 ml-6">{layer.desc}</p>

                  {layer.id === 'sources' ? (
                    <SourcesSection />
                  ) : assets.length === 0 ? (
                    <div className="ml-6 rounded-lg border border-dashed border-line px-4 py-3">
                      <p className="text-xs text-text-muted italic">No assets in this layer.</p>
                    </div>
                  ) : (
                    <AssetTypeGroups assets={assets} />
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

const ASSET_LEVEL_COLORS = {
  1: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
  2: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  3: 'bg-accent-purple/10 text-accent-purple border-accent-purple/30',
  4: 'bg-accent-coral/10 text-accent-coral border-accent-coral/30',
}

function SourcesSection() {
  const [openGroups, setOpenGroups] = useState({})
  const toggleGroup = useCallback((group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }, [])

  return (
    <div className="ml-6 space-y-2">
      {SOURCE_REFS.map(group => {
        const isOpen = !!openGroups[group.group]
        return (
          <div key={group.group} className="rounded-lg border border-line/40 overflow-hidden" style={{ borderStyle: 'solid' }}>
            <button
              onClick={() => toggleGroup(group.group)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left bg-ink-800 hover:bg-ink-700 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-semibold text-text-primary flex-1">{group.group}</span>
              <a href={group.groupHref} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-accent-blue hover:underline mr-2">
                docs ↗
              </a>
              <span className="text-xs text-text-muted">{group.items.length}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-3 pt-1 border-t border-line/30">
                {group.items.map((item, ii) => (
                  <div key={item.name}
                    className={`flex items-start justify-between gap-6 py-2.5 ${ii < group.items.length - 1 ? 'border-b border-line/30' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-text-primary hover:text-accent-blue transition-colors">
                        {item.name}
                      </a>
                      <p className="text-sm text-text-muted leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted bg-ink-700 border border-line/50 px-2 py-0.5 rounded shrink-0 whitespace-nowrap self-start mt-0.5"
                      style={{ borderStyle: 'solid' }}>
                      Appendix B: {item.cats}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AssetTypeGroups({ assets }) {
  const order = []
  const map = {}
  assets.forEach(a => {
    if (!map[a.type]) { map[a.type] = []; order.push(a.type) }
    map[a.type].push(a)
  })

  return (
    <div className="ml-6 space-y-5">
      {order.map(type => {
        const typeMeta = ASSET_TYPE_META[type] ?? { label: type, color: 'text-text-muted', bg: 'bg-ink-700 border-line' }
        const typeAssets = map[type]
        return (
          <div key={type}>
            <div className="mb-2 ml-4">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${typeMeta.bg} ${typeMeta.color}`}
                style={{ borderStyle: 'solid' }}>
                {typeMeta.label}
              </span>
            </div>
            <div className="ml-10">
              {typeAssets.map((asset, ai) => (
                <div key={asset.id}
                  className={`py-2.5 ${ai < typeAssets.length - 1 ? 'border-b border-line/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold text-text-primary leading-snug flex-1">{asset.label}</p>
                    <div className="flex gap-1.5 shrink-0">
                      {asset.levels.map(l => (
                        <span key={l}
                          className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${ASSET_LEVEL_COLORS[l] ?? 'bg-ink-700 text-text-muted border-line'}`}
                          style={{ borderStyle: 'solid' }}>
                          L{l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mt-0.5">{asset.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab 3: Obligations ────────────────────────────────────────────────────────

function ObligationsTab() {
  return (
    <div className="space-y-5">
      <div className="px-1 pb-2">
        <h2 className="text-2xl font-bold text-text-primary mb-2">What Can't Elastic Do?</h2>
        <p className="text-base text-text-muted leading-relaxed">
          Elastic satisfies the technical requirements. M-26-14 also imposes operational and documentation
          obligations that stay with your agency regardless of platform choice. Below is what your agency
          owns — and where Elastic can help reduce the burden.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OBLIGATIONS.map((o) => (
          <div key={o.title} className="rounded-lg bg-ink-800 border border-line p-5 flex flex-col gap-3" style={{ borderStyle: 'solid' }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-semibold text-text-primary leading-snug">{o.title}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-700 text-text-muted border border-line shrink-0 whitespace-nowrap"
                style={{ borderStyle: 'solid' }}>
                {o.when}
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">{o.desc}</p>
            <div className="border-t border-line/40 pt-3">
              <p className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-1.5">How Elastic helps</p>
              <p className="text-sm text-text-primary leading-relaxed">{o.assist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
