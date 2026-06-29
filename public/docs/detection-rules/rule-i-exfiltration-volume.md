# M-26-14 Appendix B Category (I): Anomalous Outbound Data Volume — Potential Exfiltration

## Overview

This rule detects hosts that transfer anomalously large volumes of data to non-RFC1918 (public internet) destinations within a one-hour rolling window. It aggregates egress bytes per `(source.ip, host.name, process.name)` tuple and fires when the sum exceeds **500 MB** in a single evaluation period.

Data exfiltration is one of the most consequential threat outcomes for federal agencies. Unlike authentication-based rules that catch early-stage intrusions, this rule targets the **impact phase**: data has already been accessed and is actively leaving the boundary. OMB M-26-14 requires agencies at Maturity Level 2 and above to maintain continuous monitoring capabilities that would surface exactly this behavior — a large, sustained outbound transfer using an unauthorized or unexpected process.

The rule uses **ES|QL aggregation** (not threshold), which allows it to `SUM(network.bytes)` across many small flows that individually would never trigger a per-event threshold. This is essential for detecting tools like `rclone`, `s3cmd`, or custom upload scripts that chunk transfers into many parallel, size-limited connections.

---

## M-26-14 Reference

**Appendix B, Category (I) — Anomalous Outbound Data Volume**

> Agencies must implement continuous monitoring controls that detect and alert on anomalous outbound data transfers from endpoint and network infrastructure. At Maturity Level 2 (Element 3), this includes automated detection rules capable of identifying sustained egress flows exceeding agency-defined volume thresholds to external, non-approved destinations. Alerts must be routed to Tier-1 SOC queues within 15 minutes of threshold breach. This control directly supports the Continuous Endpoint Monitoring (CEM) and Threat Hunting / Incident Response Functions (THIRF) objectives.

**FISMA Implication**: Regardless of data content, transfers to cloud storage endpoints lacking US data residency guarantees may independently violate FISMA data localization requirements for CUI, PII, and SBU data.

---

## Rule Details

| Field | Value |
|---|---|
| **Rule ID** | `m_26_14-appendixb-i-exfiltration-volume` |
| **Internal UUID** | `a7f3c2e1-84b5-4d9e-b6f2-3c1a5e8d7f04` |
| **Type** | ES\|QL |
| **Language** | esql |
| **Severity** | High |
| **Risk Score** | 73 |
| **Interval** | 1 hour |
| **Look-back** | 61 minutes (`from: now-61m`) |
| **Threshold** | 524,288,000 bytes (500 MB) |
| **Enabled Default** | false (must be enabled after tuning) |
| **Max Signals** | 100 |
| **Version** | 1 |

### Indexes Queried

| Index Pattern | Source Integration |
|---|---|
| `logs-network_traffic.*` | Elastic Packetbeat / Network Packet Capture |
| `logs-zeek.connection*` | Zeek integration |
| `logs-endpoint.events.network*` | Elastic Defend (network events) |

### MITRE ATT&CK Coverage

| Tactic | Technique | Sub-technique |
|---|---|---|
| TA0010 Exfiltration | T1048 Exfiltration Over Alternative Protocol | T1048.002 Exfiltration Over Asymmetric Encrypted Non-C2 Protocol |
| TA0010 Exfiltration | T1041 Exfiltration Over C2 Channel | — |

### Tags

`M-26-14`, `Appendix-B-I`, `Element-3`, `Level-2`, `CEM`, `THIRF`

---

## Related Existing Prebuilt Rules

The following Elastic prebuilt detection rules address overlapping scenarios. This M-26-14 rule is **additive** — it covers volume-based detection that these rules do not provide. Do not disable these prebuilt rules when enabling this one.

| Rule UUID | Name | Relationship |
|---|---|---|
| `cc653d77-ddd2-45b1-9197-c75ad19df66c` | ML: High Bytes to Unusual Destination IP | Requires Elastic DED (paid) ML job. Detects anomalous byte counts to unusual IPs using baseline deviation — complements this rule's static threshold. Enable both when DED license is available. |
| `ef8cc01c-fc49-4954-a175-98569c646740` | ML: High Bytes to Unusual Destination Port | Requires Elastic DED ML job. Port-oriented anomaly detection. Useful for detecting exfiltration over non-standard ports (e.g., DNS-over-443, custom protocols). |

**Coverage gap**: The two ML rules above require a paid DED subscription and a trained baseline (7–14 days of normal traffic). This M-26-14 rule provides immediate static-threshold coverage on day one without any ML dependency, satisfying the M-26-14 minimum requirement before ML baselines are established.

---

## Example Scenario

**The rclone Exfiltration Incident**

On the evening of May 30, 2026, workstation `workstation-22` (user `jsmith`, IT department) began generating sustained HTTPS egress traffic to `203.0.113.50` — a US-East endpoint operated by an S3-compatible cloud storage provider with no FedRAMP authorization and no US data residency contractual guarantees.

The tool responsible was `rclone.exe`, a legitimate open-source cloud sync utility. `rclone` is not prohibited per se, but it is absent from the agency's WS3 authorized software inventory (`m_26_14-osquery-software-*`). The user had downloaded it earlier in the day from the official rclone.org website — the download itself was not blocked by the proxy, because `rclone.org` is not on any deny-list.

Between 8:15 PM and 9:02 PM local time, `rclone.exe` made 14 sequential HTTPS upload connections, each transferring approximately 60 MB. The rule's one-hour evaluation window captured all connections, summing to **780 MB** of egress — 56% above the 500 MB threshold.

The rule fired at the 9:05 PM evaluation cycle. The generated alert included:

- `alert_reason`: `"744.1MB egress from workstation-22 via rclone.exe to 1 destinations"`
- `total_mb`: `744.1`
- `connection_count`: `13`
- `distinct_dest`: `1`

An analyst triaging the alert cross-queried the WS3 software inventory and confirmed `rclone.exe` was not authorized. The host was isolated via Elastic Defend response action at 9:12 PM. Forensic review found that the user had exfiltrated a compressed archive of the agency's contract database — unencrypted, to a storage bucket with no access controls.

The combination of:
1. Unauthorized process (`rclone.exe` not in WS3 inventory)
2. Large outbound volume (780 MB in 47 minutes)
3. Off-hours timing (8:15 PM — outside core hours)
4. Non-FedRAMP destination (no US data residency)

...placed this alert at the top of the analyst queue. Total time from transfer completion to host isolation: **7 minutes**. The M-26-14 requirement for 15-minute alert routing was met.

---

## Investigation Guide

When this rule fires, follow this playbook in sequence.

### Step 1 — Triage the Alert

- Review `alert_reason` for a human-readable summary.
- Note `total_mb`, `connection_count`, and `distinct_dest`.
- High `distinct_dest` (>10) may indicate scanning or spray-and-pray exfiltration. Low `distinct_dest` (1-2) with high volume suggests a targeted, intentional transfer.

### Step 2 — Identify and Classify the Process

```esql
FROM logs-endpoint.events.process*
| WHERE host.name == "<HOST_NAME>"
  AND process.name == "<PROCESS_NAME>"
  AND @timestamp > now()-2h
| KEEP @timestamp, process.name, process.executable, process.args, process.parent.name, user.name
| SORT @timestamp ASC
```

Cross-reference `process.name` against the WS3 authorized software inventory:

```esql
FROM m_26_14-osquery-software-*
| WHERE host.name == "<HOST_NAME>"
  AND software.name LIKE "*<PROCESS_BASE_NAME>*"
| KEEP host.name, software.name, software.authorized, software.version
```

If `software.authorized == false` or the process is absent: **escalate immediately**.

### Step 3 — Examine Destination IPs

- Perform a TI lookup on all destination IPs in the alert window.
- Check `destination.geo.country_iso_code` — any non-US destination for a federal system warrants ISSO notification.
- Resolve destination IPs to hostnames/domains. Cloud storage providers (`s3.amazonaws.com`, `blob.core.windows.net`, `storage.googleapis.com`, Backblaze, Wasabi, etc.) are common exfiltration endpoints.
- Check if the destination service has a FedRAMP authorization: [https://marketplace.fedramp.gov](https://marketplace.fedramp.gov)

### Step 4 — Reconstruct the Transfer Timeline

```esql
FROM logs-network_traffic.*,logs-zeek.connection*
| WHERE source.ip == "<SOURCE_IP>"
  AND NOT CIDR_MATCH(destination.ip,"10.0.0.0/8","172.16.0.0/12","192.168.0.0/16")
  AND @timestamp > now()-2h
| STATS bytes_per_min=SUM(network.bytes), conns=COUNT(*) BY DATE_TRUNC(1 minute, @timestamp), destination.ip
| SORT @timestamp ASC
```

Determine: when did transfers start? Did they span shift boundaries? Was there a prior recon phase (many small requests before bulk upload)?

### Step 5 — Contain if Warranted

If unauthorized process or sensitive data access is confirmed:

1. Isolate the host via Elastic Defend: Security > Endpoints > [host] > Isolate
2. Preserve memory if process is still running (living-off-the-land or injected process possibility)
3. Block destination IPs at the perimeter firewall
4. Revoke active user sessions (AD/Okta) if account compromise is suspected

### Step 6 — Notify and Document

- Notify ISSO within 1 hour of confirmation per agency IR policy.
- If data category is CUI, PII, or SBU: file FISMA incident report within 1 hour of confirmation.
- If destination lacks US data residency: notify Privacy Officer regardless of data category.
- Document: rule alert ID, raw flow evidence, process evidence, TI results, containment actions, timeline.

### False-Positive Indicators

| Scenario | Indicator | Disposition |
|---|---|---|
| Authorized backup job | `host.name` is a known backup server, `process.name` is backup agent | Add exception by `host.name` |
| Authorized cloud sync (e.g., OneDrive, SharePoint) | `process.name` is a known authorized agent, destination is a FedRAMP-authorized service | Add exception by `process.name` + destination CIDR |
| Large patch distribution | Transfer direction is actually ingress (check `network.direction`) | Verify field mapping; exclude if ingress |
| CDN/video conference upload | Bursty, short-duration, known conferencing destination | Add exception by destination CIDR block |

---

## Tuning Guidance

### Before Enabling

1. **Baseline your environment** — run the ES|QL query manually against 5 business days of data with the threshold set to 100 MB. Identify all hosts/processes that appear.
2. **Build your exception list** — for each identified authorized transfer, add an exception rule entry:
   - By `host.name` for backup servers
   - By `process.name` for authorized cloud agents (OneDrive, Box, Dropbox for Business if FedRAMP-authorized)
   - By destination IP CIDR for authorized cloud services
3. **Calibrate the threshold** — 500 MB is a conservative starting point. Environments with no authorized large egress workloads may lower this to 100 MB. Environments with authorized video uploads or large data sync may raise it temporarily while exceptions are built.

### Threshold Adjustment

Edit the rule query's `WHERE total_bytes >` clause:

| Environment | Suggested Threshold |
|---|---|
| Classified / air-gapped with strict DLP | 10 MB (52,428,800 bytes) |
| Standard federal office with no authorized cloud sync | 100 MB (104,857,600 bytes) |
| Default (this rule) | 500 MB (524,288,000 bytes) |
| Environments with authorized video uploads | 2 GB (2,147,483,648 bytes) |

### Timeline for Enablement

| Day | Action |
|---|---|
| Day 1–5 | Enable in observe mode (rule enabled=true, but no automated response actions). Review all generated alerts manually. |
| Day 6–10 | Build exception list entries for all confirmed false positives. |
| Day 11 | Enable with Tier-1 SOC queue routing. Start measuring alert-to-triage SLA against M-26-14's 15-minute requirement. |
| Day 30 | Review threshold — adjust down if no false positives remain. |

---

## Prerequisites

### Required Integrations

At least one of the following network data sources must be actively ingesting data:

| Integration | Data Stream | Key Fields |
|---|---|---|
| Elastic Network Packet Capture (Packetbeat) | `logs-network_traffic.*` | `network.bytes`, `network.direction`, `source.ip`, `destination.ip`, `process.name` |
| Zeek | `logs-zeek.connection*` | `network.bytes` (mapped from `zeek.connection.orig_bytes`), `source.ip`, `destination.ip` |
| Elastic Defend (network events) | `logs-endpoint.events.network*` | `network.bytes`, `network.direction`, `process.name`, `process.pid` |

### Field Mapping Verification

Before enabling, verify that `network.direction` is being populated with `egress` or `outbound` (not `outgoing` or blank):

```esql
FROM logs-network_traffic.*,logs-zeek.connection*,logs-endpoint.events.network*
| WHERE event.category == "network"
| STATS count=COUNT(*) BY network.direction
```

If `network.direction` is blank for your source, you must either fix the ingest pipeline to populate it or modify the rule query to remove the `network.direction` filter and rely solely on CIDR exclusion of destination IPs.

### Recommended Enrichments (not required)

- **GeoIP processor** on the `logs-network_traffic.*` pipeline: populates `destination.geo.*` for jurisdiction-based escalation.
- **WS3 Software Inventory** (`m_26_14-osquery-software-*`): enables co-querying process names against the authorized software list at investigation time.
- **Threat Intelligence integration**: maps destination IPs to known malicious infrastructure, enhancing triage confidence.
