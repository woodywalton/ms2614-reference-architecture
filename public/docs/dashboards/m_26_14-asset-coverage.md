# M-26-14 Asset Coverage Dashboard — User Guide

## 1. Overview

The **M-26-14 Asset Coverage Drill-Down** dashboard (`m_26_14-asset-coverage`) is the evidence surface for **Element 1 (Hardware Asset Management — HWAM)** and **Element 2 (Software Asset Management — SWAM)** of OMB Memorandum M-26-14. It answers the two questions that anchor the lower maturity levels (L1–L2) of every agency self-assessment:

1. **Do we know what is on the network?** (Element 1 — complete hardware inventory across IT, OT, and IoT asset classes)
2. **Are we collecting logs from it?** (Element 2 — Elastic Agent enrollment and active log collection coverage)

The dashboard reads from the discovered-asset inventory (`m_26_14-demo-hwam_assets`) and the hourly coverage metrics store (`m_26_14-metrics-asset-coverage`), so it reflects what asset discovery actually found — not what a spreadsheet says should exist. The gap between "discovered" and "enrolled," and any non-zero unauthorized-asset count, is exactly the evidence an Authorizing Official needs to see quantified.

### Who Uses This Dashboard

| Role | Primary Use |
|------|-------------|
| **ISSO** | Weekly inventory reconciliation; documents enrollment gaps and unauthorized assets as POA&M entries; assembles Element 1/2 evidence for AO packages |
| **CISO** | Tracks the enrollment-coverage trend against agency maturity targets; prioritizes agent rollout funding for OT/IoT segments |
| **Authorizing Official (AO)** | Reviews asset coverage posture during ATO milestones; the Daily Collection Coverage Trend is the primary Element 2 attestation artifact |
| **SOC Lead** | Investigates Unauthorized Assets (potential rogue devices); identifies unmanaged hosts that represent telemetry blind spots |

### Relationship to the Maturity Overview Hub

This dashboard is a **drill-down target** from the hub dashboard **M-26-14 Maturity Overview** (`m_26_14-maturity-overview`), which rolls all five M-26-14 elements into a single maturity scorecard. A **"← Back: M-26-14 Maturity Overview"** links panel sits at the top of this dashboard for round-trip navigation; it preserves your current time range and filters when you return to the hub.

---

## 2. Dashboard Layout

The dashboard contains one navigation panel and eleven Lens visualizations, all driven by ES|QL queries. The metric rows summarize current inventory state; the charts break down composition; the bottom panel shows coverage over time.

![M-26-14 Asset Coverage dashboard — asset count metrics across the top, enrollment and authorization metrics in the second row, composition charts in the third row, and the daily collection coverage trend across the bottom](../screenshots/02-asset-coverage.png)

### Navigation (top)

| Panel | Type | Behavior |
|-------|------|----------|
| **← Back: M-26-14 Maturity Overview** | Links | Returns to the hub dashboard in the same tab, carrying the current time range and filters |

### Row 1 — Asset Inventory Metrics (Element 1)

All four panels count documents in `m_26_14-demo-hwam_assets`, segmented by `m_26_14.asset_type`.

| Panel | ES|QL Logic | What It Shows |
|-------|------------|---------------|
| **Total Assets (HWAM/SWAM)** | `STATS count = COUNT(*)` | Every discovered asset, regardless of class. Subtitle: "All discovered assets." This is the denominator for all coverage math. |
| **IT Assets** | `WHERE m_26_14.asset_type == "IT"` | Traditional servers, workstations, and network devices |
| **OT Assets** | `WHERE m_26_14.asset_type == "OT"` | Operational technology — ICS/SCADA, building systems (shown in red to flag the typically hardest-to-instrument class) |
| **IoT Assets** | `WHERE m_26_14.asset_type == "IoT"` | Cameras, sensors, embedded devices |

### Row 2 — Collection Coverage Metrics (Element 2)

| Panel | ES|QL Logic | What It Shows |
|-------|------------|---------------|
| **Elastic Agent Enrolled** | `WHERE m_26_14.managed == true` | Assets with an enrolled Elastic Agent actively shipping logs (teal; subtitle "Active log collection") |
| **Not Enrolled** | `WHERE m_26_14.managed == false` | Discovered assets with **no** active log collection (yellow; subtitle "No active log collection"). Each one is a telemetry blind spot. |
| **Unauthorized Assets** | `WHERE m_26_14.authorized == false` | Assets seen on the network but not present in the authorized inventory (red; subtitle "Unrecognized on network"). Target: 0. |

### Row 3 — Inventory Composition

| Panel | Type | What It Shows |
|-------|------|---------------|
| **Asset Type Distribution** | Pie (percent labels) | Proportional split of IT / OT / IoT across the discovered inventory |
| **Assets by OS Family** | Horizontal bar | Top 10 `host.os.family` values — drives SWAM baseline and patch-scope planning |
| **Assets by Criticality** | Bar | Distribution across `m_26_14.criticality` tiers — use to prioritize enrollment of high-criticality unmanaged assets first |

### Row 4 — Coverage Over Time

| Panel | Type | ES|QL Source |
|-------|------|--------------|
| **Daily Collection Coverage Trend** | Area chart (full width) | `FROM m_26_14-metrics-asset-coverage \| WHERE m_26_14.element == "element_2_collection" \| EVAL day = DATE_TRUNC(1 day, @timestamp) \| STATS value = MAX(m_26_14.value) BY day \| SORT day ASC` |

This panel reads the pre-computed coverage metric (best value per day), so it renders quickly and is unaffected by raw inventory volume. It is the single most useful artifact for demonstrating Element 2 progress between assessment cycles.

---

## 3. How to Read It

### Coverage Interpretation

The core ratio is **Elastic Agent Enrolled ÷ Total Assets**. Read it alongside the trend panel:

| Observation | Interpretation |
|-------------|----------------|
| Enrolled ≈ Total, trend flat at a high value | Mature Element 2 posture — collection coverage is established and stable |
| Enrolled < Total, trend rising | Active rollout in progress — document the rollout plan and projected completion date in the evidence package |
| Trend declining | Agents are unenrolling faster than new ones are added — investigate Fleet health (Section 6) before this becomes an audit finding |
| Total Assets rising while Enrolled is flat | Asset discovery is finding devices faster than enrollment is keeping up — the gap is growing even though the enrolled count looks stable |

### Identifying Gaps

1. **Unmanaged assets (Not Enrolled > 0).** These hosts generate no logs in Appendix B categories. Cross-reference with the **Assets by Criticality** chart: an unmanaged *high-criticality* asset is a priority POA&M item; an unmanaged low-criticality IoT sensor may be an accepted, documented limitation.
2. **Unauthorized assets (Unauthorized Assets > 0).** These are devices observed on the network but absent from the authorized baseline — either an inventory record gap or a genuine rogue device. Every non-zero count requires triage: open Discover against `m_26_14-demo-hwam_assets` filtered on `m_26_14.authorized: false`, identify the hosts, and either authorize-and-enroll them or escalate to the SOC.
3. **Class-level blind spots.** If the OT or IoT metric is large but the pie chart shows enrollment concentrated in IT, your coverage percentage is propped up by the easiest asset class. M-26-14 maturity assessments look at coverage across *all* asset types.

### Time Range Behavior

The metric and composition panels reflect the current inventory snapshot within the selected time range; the trend panel is the historical view. For point-in-time attestation, use a recent narrow window (e.g., Last 24 hours). For progress narratives, widen to 90 days so the trend shows the full rollout arc.

---

## 4. How to Use for AO Reporting

Use this procedure to produce the Element 1/2 portion of an M-26-14 evidence package (10–15 minutes once familiar):

1. **Set the time range** — Last 90 days for trend context; note the exact range in the evidence package.
2. **Capture the dashboard** — Use Kibana's **Share → Export → PDF** (or a full-page screenshot). The capture must include the Total Assets, Enrolled/Not Enrolled, and trend panels in one image.
3. **Record the coverage ratio** — State it explicitly: "As of [date], 412 of 450 discovered assets (91.6%) have active Elastic Agent log collection."
4. **Explain every gap** — For each Not Enrolled cohort, document the reason (rollout in progress, OT constraint, decommission pending) and a target date. Unexplained gaps read as findings; explained gaps read as managed risk.
5. **Attest to unauthorized assets** — If the count is 0, say so. If non-zero, attach the triage disposition for each asset and the corresponding POA&M entry.
6. **Attach the trend** — The Daily Collection Coverage Trend demonstrates *continuous* monitoring rather than a point-in-time check, which directly supports higher maturity-level claims for Element 2.
7. **Link, don't just print** — Include the live dashboard URL so the AO (or assessor) can verify current posture directly.

---

## 5. Data Sources

The dashboard sits at the end of an automated discovery-to-metrics pipeline:

| Stage | Component | Function |
|-------|-----------|----------|
| 1. Discovery | osquery pack `m_26_14_asset_inventory` (via Fleet/Osquery Manager) | Scheduled queries enumerate hardware and installed software on managed endpoints |
| 2. Normalization | Ingest pipeline `m_26_14-osquery-normalize` | Maps raw osquery rows to ECS plus `m_26_14.*` fields (`asset_type`, `managed`, `authorized`, `criticality`) |
| 3. Storage | `logs-m_26_14_osquery.*` data streams | Normalized inventory/discovery events |
| 4. Metrics refresh | `tools/coverage_refresh.py` (runs **hourly**) | Computes per-element coverage values and writes them to `m_26_14-metrics-asset-coverage` |
| 5. Visualization | This dashboard | Metric/composition panels read `m_26_14-demo-hwam_assets`; the trend panel reads `m_26_14-metrics-asset-coverage` |

**Refresh cadence:** inventory panels update as osquery results are ingested (per the pack's query schedule); the coverage trend updates hourly when `coverage_refresh.py` runs. A trend that is more than ~2 hours stale indicates the refresh job has stopped (see Section 6).

**Key fields:**

| Field | Meaning |
|-------|---------|
| `m_26_14.asset_type` | `IT`, `OT`, or `IoT` |
| `m_26_14.managed` | `true` if an Elastic Agent is enrolled and collecting |
| `m_26_14.authorized` | `false` if the asset is not in the authorized baseline |
| `m_26_14.criticality` | Asset criticality tier |
| `m_26_14.element` / `m_26_14.value` | Metric series key (`element_2_collection`) and coverage value in the metrics index |

---

## 6. Troubleshooting

### All panels show "No results found"

Check that the source indices exist and contain documents (Dev Tools):

```
GET m_26_14-demo-hwam_assets/_count
GET m_26_14-metrics-asset-coverage/_count
```

If counts are zero, the demo/seed data has not been loaded or the osquery pipeline has never delivered results. Also widen the dashboard time range — the metric panels are time-filtered on `@timestamp`.

### Inventory panels populate but the trend panel is empty

The trend reads a different index and filters on `m_26_14.element == "element_2_collection"`. Verify the metric series exists:

```
GET m_26_14-metrics-asset-coverage/_search
{
  "size": 1,
  "query": { "term": { "m_26_14.element": "element_2_collection" } },
  "sort": [ { "@timestamp": "desc" } ]
}
```

If the latest document is more than a couple of hours old, the hourly `tools/coverage_refresh.py` job is not running — check its scheduler (cron/launchd) and credentials.

### Asset counts look stale or incomplete

1. **Confirm osquery results are arriving:**

   ```
   GET logs-m_26_14_osquery.*/_search
   {
     "size": 1,
     "sort": [ { "@timestamp": "desc" } ]
   }
   ```

2. **Check Fleet agent health** — In Kibana go to **Fleet → Agents** and confirm agents are `Healthy` and the Osquery Manager integration is assigned to their policy. Offline agents stop contributing inventory rows.
3. **Verify the osquery pack** — In **Osquery → Packs**, confirm `m_26_14_asset_inventory` is enabled and its queries last ran on schedule.
4. **Verify the ingest pipeline is attached:**

   ```
   GET _ingest/pipeline/m_26_14-osquery-normalize
   ```

   If osquery documents arrive without `m_26_14.*` fields, the normalize pipeline is missing from the data stream's default pipeline chain.

### Enrolled + Not Enrolled does not equal Total Assets

A small discrepancy usually means some asset documents lack the `m_26_14.managed` field (they match neither `== true` nor `== false`). Find them:

```
GET m_26_14-demo-hwam_assets/_search
{
  "size": 10,
  "query": { "bool": { "must_not": { "exists": { "field": "m_26_14.managed" } } } }
}
```

Fix the normalization pipeline or re-run discovery for the affected hosts.

### Back-link does not navigate

The links panel targets the dashboard saved object `m_26_14-maturity-overview`. If that dashboard was deleted or imported with a new ID, re-import the compliance pack's dashboard bundle so the saved-object reference resolves.
