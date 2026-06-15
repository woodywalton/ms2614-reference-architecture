// Live demo cluster deep links — maps each compliance pack asset to its
// representation in the live Elastic cluster (dashboards open directly;
// Stack Management objects open their detail/list page).
//
// Naming convention: the deployed object name/id equals the asset file
// basename (verified against the live cluster). Assets whose deployed ids
// are generated at import time (detection rules, workflows, agents) link
// to the relevant listing page instead.

export const LIVE_KIBANA_BASE = 'https://m-26-14-7ae75d.kb.us-east-1.aws.found.io'

// strip path + extension: '/assets/elasticsearch/transform/m2614-foo.json' -> 'm2614-foo'
function basename(file) {
  return file.split('/').pop().replace(/\.(json|ndjson|yaml|yml)$/, '')
}

// Per-type URL builders. `name` is the deployed object name (file basename
// unless the asset declares `liveId`).
const TYPE_LINKS = {
  'kibana-dashboard': name =>
    `/app/dashboards#/view/${name}?_g=(time:(from:now-30d,to:now))`,
  'index-template': name =>
    `/app/management/data/index_management/templates/${encodeURIComponent(name)}`,
  'ilm-policy': name =>
    `/app/management/data/index_lifecycle_management/policies/edit/${encodeURIComponent(name)}`,
  'ingest-pipeline': name =>
    `/app/management/ingest/ingest_pipelines?pipeline=${encodeURIComponent(name)}`,
  'transform': name =>
    `/app/management/data/transform?_a=(transform:(queryText:'${name}'))`,
  'es-watcher': name =>
    `/app/management/insightsAndAlerting/watcher/watches/watch/${encodeURIComponent(name)}/status`,
  'slm-policy': name =>
    `/app/management/data/snapshot_restore/policies/${encodeURIComponent(name)}`,
  'ml-job': name =>
    `/app/ml/jobs?mlManagement=(jobId:${name})`,
  // Deployed ids generated at import — link to the listing page.
  'kibana-rule': () =>
    `/app/security/rules/management`,
  'kibana-workflow': () =>
    `/app/workflows`,
  'kibana-agent': () =>
    `/app/agent_builder/agents`,
  'kibana-agent-tool': () =>
    `/app/agent_builder/tools`,
  'fleet-pack': () =>
    `/app/osquery/packs`,
}

// Returns the absolute live-cluster URL for an asset, or null if the type
// has no live representation.
export function liveClusterUrl(asset) {
  if (!asset) return null
  const build = TYPE_LINKS[asset.type]
  if (!build) return null
  const name = asset.liveId ?? basename(asset.file)
  return `${LIVE_KIBANA_BASE}${build(name)}`
}

// True when the link points at a listing page rather than the exact object.
export function liveLinkIsListing(asset) {
  return ['kibana-rule', 'kibana-workflow', 'kibana-agent', 'kibana-agent-tool', 'fleet-pack'].includes(asset?.type)
}
