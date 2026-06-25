# M-26-14 Appendix B Category (K): Coverage Gap — M-26-14 Detection Categories Silence Monitor

## Overview

Category K is a **meta-detection category** — it detects gaps in your detection coverage rather than external threats. The two rules in this category continuously monitor whether the other nine M-26-14 Appendix B detection categories (A through J) are producing alerts, and fire when a category goes silent.

**Why this matters for M-26-14 §5:** The M-26-14 maturity model requires agencies to demonstrate *continuous* monitoring, not just point-in-time compliance. An agency can have all ten category rules correctly imported and enabled on Day 1 of an audit cycle, but if a Fleet integration silently disappears on Day 15 — eliminating the underlying telemetry — the rules will stop firing without any visible error. The AO report submitted at Day 90 will reflect a false-green status for that category. Category K closes this blind spot by treating "no alerts from a known category" as itself an alertable condition.

**Two complementary signals:**

| Rule | Signal Type | Fires When |
|------|-------------|------------|
| `m_26_14-appendixb-k-alert-presence` | Health confirmation | A category IS active — at least one alert fired in the last 24 hours |
| `m_26_14-appendixb-k-silent-category` | Coverage gap warning | Companion Watcher detects a category with ZERO alerts in the past 30 days |

Together, these rules provide a daily attestation of detection coverage that can be directly cited in M-26-14 AO reports and POA&M entries.

---

## M-26-14 Reference

**OMB Memorandum M-26-14, §5 — Appendix B: Event Categories for Detection**

> Agencies must demonstrate that detection capabilities are continuously operational across all required event categories. Where detection gaps exist, agencies must document the gap, its root cause, and a remediation timeline in their Plan of Action and Milestones (POA&M).

Category K addresses the requirement for agencies to maintain evidence that each detection category is producing telemetry-backed alerts on an ongoing basis, not merely that rules have been configured. This supports:

- **Element 3 (Detection):** Continuous monitoring of detection coverage health.
- **Level 2 (CEM — Comprehensive Event Management):** Verified alert pipeline integrity across all required event categories.
- **THIRF (Threat-Hunting and Incident Response Foundation):** Ensuring the data needed for threat hunting and incident response is flowing and triggering detections.

---

## Rule Details

### Rule 1 — Alert Presence Monitor

| Field | Value |
|-------|-------|
| Rule ID | `m_26_14-appendixb-k-alert-presence` |
| Type | ES\|QL |
| Severity | Medium |
| Risk Score | 47 |
| Interval | 24h |
| From | `now-25h` |
| Index | `.alerts-security.*` |
| MITRE ATT&CK | None (coverage health rule) |
| Tags | `M-26-14`, `Appendix-B-K`, `Element-3`, `Level-2`, `CEM`, `THIRF`, `Coverage-Health` |

**Logic:** Groups all M-26-14-tagged alerts from the last 25 hours by Appendix B category letter (A–J). Each result row is one active category. A result row is a positive health signal. A missing category is the gap condition, detected by the companion rule.

### Rule 2 — Silent Category Detector

| Field | Value |
|-------|-------|
| Rule ID | `m_26_14-appendixb-k-silent-category` |
| Type | ES\|QL |
| Severity | Medium |
| Risk Score | 47 |
| Interval | 24h |
| From | `now-25h` |
| Index | `.alerts-security.*` |
| MITRE ATT&CK | None (coverage health rule) |
| Tags | `M-26-14`, `Appendix-B-K`, `Element-3`, `Level-2`, `CEM`, `Coverage-Gap` |

**Logic:** Counts M-26-14 alerts by Appendix-B category tag over the past 30 days. Result rows represent active categories. Categories absent from results have zero alerts over 30 days — the gap condition. A companion Elasticsearch Watcher (`m_26_14-watcher-registry-zero-count`) performs the authoritative zero-count check against the `m_26_14-rule-registry` reference index and fires notifications for missing categories.

> **ES|QL Limitation Note:** ES|QL `LOOKUP JOIN` against custom user indices requires the target to be configured as an Enrich Policy or a system alias. Direct joins against `m_26_14-rule-registry` using `LOOKUP JOIN` are not available in Elastic 9.4.2 for arbitrary custom indices. The companion Watcher provides this functionality. See the Setup section for Watcher configuration details.

---

## Related Existing Prebuilt Rules

The following Elastic prebuilt rules are conceptually related to Category K. They should be referenced but not duplicated.

| Rule UUID | Rule Name | Relationship to Category K |
|-----------|-----------|---------------------------|
| `1a3d5b36-b995-4ace-9b85-8a0af429ccf6` | Newly Observed High Severity Detection Alert | **Inverse concept:** fires when a *new* high-severity alert type appears (novelty signal). Category K fires when an *expected* alert type goes *absent* (silence signal). Together they bracket the detection health envelope — novelty on one end, silence on the other. |

---

## Example Scenario: The 35-Day Zeek Gap

The agency's M-26-14 compliance report to the AO is due in 48 hours. The ISSO opens the compliance dashboard and sees Category I (Exfiltration Volume) has been silent for 33 days. The coverage gap rule fired yesterday as a medium-severity alert.

Investigation reveals the Zeek integration was accidentally removed during a Fleet policy update 35 days ago, eliminating all network flow telemetry. No one noticed because the Category I rule had no errors — it simply had no data to evaluate.

The ISSO re-deploys the Zeek integration via Fleet. Within four hours, the Zeek `logs-zeek.connection-*` data stream resumes indexing. The exfiltration volume rule (Category I) begins firing on normal backup traffic within the first run cycle. The ISSO adds a tuning exception for the backup server's IP range.

The AO report accurately reflects a **35-day gap** in Category I coverage, with documented root cause (Fleet policy update removing Zeek), remediation date (today), and a POA&M entry to add a Fleet policy change-control review step.

**Without Category K,** this gap would have been discovered during the audit — not before. The agency would have faced a compliance finding rather than a documented self-identified and remediated gap, which is a substantially better audit outcome.

---

## Investigation Guide

When a Category K alert fires (or when a category is absent from the presence monitor results), follow this playbook:

### Step 1 — Identify the Silent Category

1. Open the alert in Kibana Security → Alerts.
2. Note the `category` field in the alert details (letter A–J).
3. If using the presence monitor: cross-reference the result rows against the full list [A, B, C, D, E, F, G, H, I, J]. Any letter absent from the past 24h results is the gap.

### Step 2 — Check Rule Status

1. Navigate to **Kibana Security → Rules**.
2. Filter by tag: `Appendix-B-<LETTER>` (e.g., `Appendix-B-I`).
3. Confirm the rule is **Enabled**.
4. Check **Last run** timestamp. If it shows an error or has not run recently, note the error message.
5. Check **Execution logs** for the rule to see if it ran but produced no matches, or if it failed to execute.

### Step 3 — Check Integration Health

1. Navigate to **Fleet → Agents**.
2. Filter for agents in the relevant host group.
3. Confirm integration policy includes the data source for the silent category.
   - Category A/B: `logs-system.auth`, `logs-windows.security`
   - Category C: `logs-windows.security`, `logs-system.auth` (lateral movement)
   - Category D: `logs-endpoint.events.process`, `logs-endpoint.alerts`
   - Category E: `logs-endpoint.events.process`, `logs-windows.sysmon_operational`
   - Category F: `logs-endpoint.events.process`, `logs-windows.security`
   - Category G: `logs-network_traffic.*`, `logs-zeek.connection*`
   - Category H: `logs-azure.signinlogs*`, `logs-okta.*`
   - Category I: `logs-zeek.connection*`, `logs-palo_alto_networks.*`, `logs-network_traffic.*`
   - Category J: `logs-system.auth`, `logs-windows.security`, `logs-endpoint.events.*`
4. If an integration is missing from the policy, it has been removed. Note the timestamp of the last policy update.

### Step 4 — Verify Data Stream Existence

Run the following from **Dev Tools → Console**:

```
GET /logs-zeek.connection-default/_stats/docs
```

Replace `logs-zeek.connection-default` with the relevant data stream. If the index is missing or `doc.count` is zero after the expected gap start date, the data source is confirmed offline.

### Step 5 — Establish Gap Timeline

```
GET .alerts-security.*/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "kibana.alert.rule.tags": "Appendix-B-I" } },
        { "range": { "@timestamp": { "gte": "now-90d" } } }
      ]
    }
  },
  "aggs": {
    "daily_alerts": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1d"
      }
    }
  },
  "size": 0
}
```

This histogram shows exactly when alerts stopped. The last non-zero bucket is the gap start date.

### Step 6 — Remediate and Document

1. Re-deploy the missing integration via Fleet.
2. Monitor the relevant data stream for new documents (check within 15–30 minutes of agent check-in).
3. Verify the category rule fires again within the next run cycle.
4. Create a POA&M entry documenting: gap start date, root cause, discovery date, remediation date, and preventive control added.
5. Update the `m_26_14-rule-registry` index: set `m_26_14.monitoring.last_fired` to the current timestamp.

---

## Tuning Guidance

### Threshold Adjustments

**Alert Volume Monitor (Rule 1):** No threshold to tune — this is an aggregation rule. Each result row is one alert. The expected steady-state is 10 rows per day (one per active category).

**Silent Category Detector (Rule 2):** The 30-day window is intentionally wide to catch slow drift. For agencies with stricter SLAs, reduce to `> NOW() - 7 days` after the initial 90-day baseline period. Document the change in the compliance pack changelog.

### Exception List Entries

Add the following exceptions to suppress known-good silence periods:

| Exception Type | Field | Value | Reason |
|---------------|-------|-------|--------|
| Time-based | `kibana.alert.rule.tags` | `Appendix-B-<LETTER>` | Planned maintenance window |
| Category suppression | `category` | `OTHER` | Non-A-through-J tags in result set |

To add a maintenance-window exception:
1. Open the rule in Kibana Security → Rules.
2. Select **Edit rule settings** → **Exceptions**.
3. Add exception: `@timestamp` is between `<maintenance_start>` and `<maintenance_end>`.

### Timeline for Enablement

| Day | Action |
|-----|--------|
| 0 | Import compliance pack. Do NOT enable Category K rules yet. |
| 1–7 | Enable and tune Category A–J rules. Establish baseline alert volumes. |
| 8 | Enable Rule 1 (Alert Presence Monitor). Verify 10 result rows appear within 24h. |
| 9 | Enable Rule 2 (Silent Category Detector). Verify no false-positive gaps. |
| 10 | Deploy companion Watcher. Validate end-to-end by temporarily disabling one category rule and confirming the gap alert fires. Re-enable the rule. |
| 30 | Revisit alert volumes. Tune thresholds if any category is persistently noisy. |

---

## Prerequisites

### Required Elastic License
- **Platinum or higher** (for Elastic Security detection engine and ES|QL rule type).

### Required Integrations and Data Streams

| Integration | Data Stream | Purpose |
|-------------|-------------|---------|
| Elastic Security detection engine | `.alerts-security.*` | Alert store — queried directly by both rules |
| All M-26-14 Appendix B integrations (A–J) | See category-specific rule docs | Must be flowing for coverage to be meaningful |

### Required Custom Index

| Index | Purpose | Fixture File |
|-------|---------|--------------|
| `m_26_14-rule-registry` | Registry of all expected M-26-14 rules with monitoring metadata | `tests/ws5_detection/fixtures/fixture_k_registry.ndjson` |

Create this index and load the fixture:

```bash
# Create the index (mapping defined in companion Watcher setup or manually via Dev Tools)
# Then bulk-load the registry:
curl -X POST "http://localhost:9200/_bulk" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @tests/ws5_detection/fixtures/fixture_k_registry.ndjson
```

### Required Kibana Settings
- Detection engine must be initialized (navigate to Security → Overview at least once to initialize the `.alerts-security.*` index template).
- The Kibana service account must have `read` access to `.alerts-security.*`.

### Companion Watcher

Deploy `m_26_14-watcher-registry-zero-count` to handle the authoritative zero-count gap detection. This Watcher:
- Runs daily at 06:00 UTC.
- Queries `.alerts-security.*` for M-26-14-tagged alerts grouped by Appendix-B category over the past 30 days.
- Compares result against the expected category set [A, B, C, D, E, F, G, H, I, J].
- Creates a Kibana alert (via webhook) for each missing category, with the category letter and estimated gap start date.
- Sends email notification to the ISSO.

Watcher configuration template is available at `packages/m2614_compliance/elasticsearch/watcher/m_26_14-watcher-registry-zero-count.json` (to be created in a future pack release).
