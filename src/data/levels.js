// Per-level metadata: deadlines, retention requirements, narrative.

export const LEVELS = [
  {
    id: 1,
    name: 'Level 1 — Basic',
    deadline: '120 days from LRA publication',
    searchable: null,
    retrievable: '≥ 6 months',
    summary:
      'Minimal hot footprint (~1 day) plus frozen tier (~1 day local cache) backed by an unmounted 6-month snapshot repo. No searchable-data requirement at this level — every byte costs as little as the architecture allows. Kibana provides SOC access; CISA/FBI export is on-request.',
    keyPoints: [
      'Hot tier kept intentionally small — searchable is not yet required.',
      'Frozen tier caches the snapshot repo for quick mount/thaw.',
      'Unmounted snapshot repo carries the 6-month retrievable obligation.',
      'CISA/FBI export procedure must be pre-documented in the Agency Logging Plan.',
    ],
  },
  {
    id: 2,
    name: 'Level 2 — Intermediate',
    deadline: '180 days from LRA publication',
    searchable: null,
    retrievable: '≥ 6 months',
    summary:
      'Same architecture shape as Level 1, but with substantially expanded log-source coverage and a more complete Fleet system inventory. Both the 6-month and 12-month snapshot repos are shown as standard so THIRF retention can extend without a re-architecture.',
    keyPoints: [
      'Expanded integration coverage — fill out the M-26-14 Appendix B event categories.',
      'Fleet inventory should now reflect every system in the Agency Logging Plan.',
      'Both 6-month and 12-month snapshot repos in place — no cold tier yet.',
      'Still no searchable requirement; the cost profile remains close to Level 1.',
    ],
  },
  {
    id: 3,
    name: 'Level 3 — Advanced',
    deadline: '320 days from LRA publication',
    searchable: '≥ 6 months (CEM)',
    retrievable: '≥ 12 months (THIRF)',
    summary:
      'Three-tier searchable architecture: hot (3 days, SSD ingest) → cold (7 days, read-only SSD) → frozen (6 / 12 months, mounted searchable snapshots on object storage). Adds an AI/ML enrichment pipeline (anomaly detection, UEBA, IOC matching via STIX/TAXII including CISA KEV) and risk-scored alert correlation feeding Elastic Security. Sensitive-data controls (PII masking, field redaction) run BEFORE storage.',
    keyPoints: [
      'Hot 3 days · Cold 7 days · Frozen 6 / 12 months — all queryable in Kibana.',
      'Frozen tier uses mounted searchable snapshots so the 6-month CEM window is satisfied without keeping it on SSD.',
      'Full ILM: Hot → Cold → Frozen → Delete; SLM manages snapshot lifecycle.',
      'AI/ML jobs score events ahead of the SIEM; PII masking happens pre-storage.',
    ],
  },
  {
    id: 4,
    name: 'Level 4 — Optimized',
    deadline: 'Ongoing',
    searchable: '≥ 6 months (CEM)',
    retrievable: '≥ 12 months (THIRF)',
    summary:
      'Same hot 3d / cold 7d / frozen 12mo retention as Level 3, now distributed across a federated topology with the agency SOC at the hub. Cross-Cluster Search reaches on-prem, cloud, and edge clusters in place. Pre-storage enrichment via Elasticsearch ingest pipelines and Logstash filters cuts volume 40–60%. BYOK encryption (AWS KMS, Azure Key Vault, GCP Cloud KMS) and USNO/NIST-traceable NTP enforced everywhere. CISA/FBI export path runs through the federated SOC.',
    keyPoints: [
      'Hot 3d · Cold 7d · Frozen 12mo, replicated/federated across distributed stores.',
      'Cross-Cluster Search federates on-prem, cloud, and edge clusters.',
      'Ingest pipelines (Elasticsearch + Logstash) trim 40–60% of volume before storage.',
      'BYOK across every cloud-resident tier; NTP traceable to USNO/NIST.',
    ],
  },
]
