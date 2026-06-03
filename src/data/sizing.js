// Authoritative sizing table from Elastic's official deployment guidance.
// Do not interpolate or invent values — these are the canonical reference
// numbers each size tier maps to.

export const sizingTable = {
  small: {
    label: 'Small',
    ingestRange: '0–2 TB/day',
    representativeIngest: 2,           // TB/day, upper bound
    entryIngest: 0.5,                  // TB/day, lower bound for "starting at"
    s3StoredTB: 403,
    hotNodes: 6,
    coldNodes: 3,
    frozenNodes: 6,
    mlNodeRamGB: 15,
    masterNodeRamGB: 45,
    kibanaRamGB: 30,
    availabilityZones: 3,
    instanceTypes: {
      hot: 'c7gd',
      cold: 'i3en',
      frozen: 'i3en',
      ml: 'm5dn',
      master: 'c7gd',
      kibana: 'c7gd',
    },
  },
  medium: {
    label: 'Medium',
    ingestRange: '2–10 TB/day',
    representativeIngest: 10,
    entryIngest: 2,
    s3StoredTB: 2014.8,
    hotNodes: 27,
    coldNodes: 12,
    frozenNodes: 21,
    mlNodeRamGB: 30,
    masterNodeRamGB: 45,
    kibanaRamGB: 30,
    availabilityZones: 3,
    instanceTypes: {
      hot: 'c7gd',
      cold: 'i3en',
      frozen: 'i3en',
      ml: 'm5dn',
      master: 'c7gd',
      kibana: 'c7gd',
    },
  },
  large: {
    label: 'Large',
    ingestRange: '10–25 TB/day',
    representativeIngest: 25,
    entryIngest: 10,
    s3StoredTB: 5037,
    hotNodes: 66,
    coldNodes: 30,
    frozenNodes: 54,
    mlNodeRamGB: 60,
    masterNodeRamGB: 45,
    kibanaRamGB: 30,
    availabilityZones: 3,
    instanceTypes: {
      hot: 'c7gd',
      cold: 'i3en',
      frozen: 'i3en',
      ml: 'm5dn',
      master: 'c7gd',
      kibana: 'c7gd',
    },
  },
}

// Sizes presented in fixed order for tabs and overview comparisons.
export const SIZE_ORDER = ['small', 'medium', 'large']

// Cold tier only exists at L3 / L4 per M-26-14 (no searchable requirement
// at L1 / L2, so the cost-optimized topology skips cold).
export const LEVELS_WITH_COLD = new Set([3, 4])

// Control plane and ML node fleets are intentionally fixed at 3 across all
// size tiers — one per AZ for quorum / HA. The user-visible "fixed across
// sizes" caveat applies to master + Kibana RAM (which the table confirms).
export const CONTROL_PLANE_DEFAULTS = {
  mlNodes: 3,
  masterNodes: 3,
  kibanaNodes: 3,
}

/**
 * Lookup helper. Returns the sizing entry for a size string, defaulting to
 * 'small' if the input is missing or invalid.
 */
export function getSizing(size) {
  return sizingTable[size] || sizingTable.small
}

/**
 * Returns the node count for a given tier key at a given size.
 * tierKey: 'hot' | 'cold' | 'frozen' | 'ml' | 'master' | 'kibana'
 */
export function getTierNodeCount(tierKey, size) {
  const s = getSizing(size)
  switch (tierKey) {
    case 'hot':    return s.hotNodes
    case 'cold':   return s.coldNodes
    case 'frozen': return s.frozenNodes
    case 'ml':     return CONTROL_PLANE_DEFAULTS.mlNodes
    case 'master': return CONTROL_PLANE_DEFAULTS.masterNodes
    case 'kibana': return CONTROL_PLANE_DEFAULTS.kibanaNodes
    default:       return 0
  }
}
