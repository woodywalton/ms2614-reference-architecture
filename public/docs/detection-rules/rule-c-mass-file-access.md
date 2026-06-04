# M-26-14 Appendix B Category (C): Mass File Access — Ransomware Staging or Data Collection

## Overview

This rule detects when a single user-and-process pair accesses 500 or more files within a 5-minute detection window. That access pattern is a reliable discriminator for two high-severity threat scenarios that federal agencies must detect under M-26-14:

1. **Ransomware pre-encryption staging** — ransomware agents enumerate and read target files before encrypting them. The read burst typically precedes the encryption burst by 30–120 seconds, giving defenders a brief but actionable window to contain before data is locked.
2. **Insider-threat bulk data collection** — a disgruntled or compromised user runs a script that copies or reads large volumes of sensitive files (HR records, financial data, source code) to a staging location prior to exfiltration.

The ES|QL query aggregates file access events per `(user.name, host.name, process.name)` tuple, computes a `file_access_count`, a `distinct_paths` count, and a per-minute `access_rate`, then surfaces rows exceeding the threshold. Each triggered alert contains an `alert_reason` string that lets an analyst immediately understand the scope without opening a separate investigation.

Why this matters for M-26-14: §5 requires agencies at Level 2 and above to collect and monitor object and resource access events (Appendix B category (c)) as part of the Continuous Event Monitoring (CEM) and Threat Hunting and Incident Response Forensics (THIRF) objectives under Element 3. A 500-file access burst within 5 minutes is anomalous in virtually all legitimate use cases and constitutes a detectable behavioral indicator that the standard requires agencies to act on.

---

## M-26-14 Reference

**Appendix B §5(c) — Object and Resource Access Events**

> Agencies shall log events related to access to objects and resources including files, directories, and data stores. Logs shall capture sufficient metadata to identify the subject (user or process), the object accessed, the type of access, and the outcome. Logs shall be sufficient to support detection of unauthorized access, bulk data access indicative of staging or exfiltration, and anomalous access patterns inconsistent with the subject's role or baseline behavior.

**Applicability:** Element 3 — Continuous Event Monitoring. Required at Level 2 and above.

**M-26-14 Objectives Satisfied:** CEM (Continuous Event Monitoring), THIRF (Threat Hunting and Incident Response Forensics).

---

## Rule Details

| Field | Value |
|---|---|
| **Rule ID** | `m2614-appendixb-c-mass-file-access` |
| **Type** | ES\|QL (aggregating) |
| **Severity** | High |
| **Risk Score** | 73 |
| **Interval** | 5 minutes |
| **Look-back** | `now-6m` (1 minute overlap for late-arriving events) |
| **Threshold** | ≥ 500 file access events per (user, host, process) tuple |
| **Primary Index** | `logs-endpoint.events.file*` |
| **Secondary Index** | `logs-auditd.*` (Linux) |
| **ECS Fields** | `event.category`, `event.type`, `user.name`, `process.name`, `file.path`, `host.name`, `@timestamp` |
| **MITRE Tactic** | TA0009 — Collection |
| **MITRE Technique** | T1005 — Data from Local System |
| **M-26-14 Category** | (c) Object and Resource Access |
| **M-26-14 Element** | 3 |
| **Minimum Level** | 2 |
| **Objectives** | CEM, THIRF |
| **Enabled by Default** | No (requires tuning before activation) |

### ES|QL Query

```esql
FROM logs-endpoint.events.file*,logs-auditd.*
| WHERE event.category == "file"
  AND event.type IN ("access","open","read")
  AND user.name IS NOT NULL
  AND NOT user.name IN ("SYSTEM","root","NT AUTHORITY\\SYSTEM","LOCAL SERVICE","NETWORK SERVICE")
  AND NOT process.name IN ("MsMpEng.exe","svchost.exe","SearchIndexer.exe","antivirus.exe","backup_agent.exe","vss.exe","vshadow.exe")
| STATS
    file_access_count = COUNT(*),
    distinct_paths    = COUNT_DISTINCT(file.path),
    first_seen        = MIN(@timestamp),
    last_seen         = MAX(@timestamp)
  BY user.name, host.name, process.name
| WHERE file_access_count >= 500
| EVAL
    window_seconds = DATE_DIFF("seconds", first_seen, last_seen),
    access_rate    = ROUND(file_access_count / GREATEST(window_seconds, 1) * 60, 1),
    alert_reason   = CONCAT(user.name, " accessed ", TO_STRING(file_access_count),
                            " files in ", TO_STRING(window_seconds), "s via ", process.name)
```

---

## Related Existing Prebuilt Rules

These Elastic-provided prebuilt rules address overlapping scenarios. Do **not** duplicate their logic — configure them alongside this rule for layered coverage.

| Rule ID | Rule Name | Relationship |
|---|---|---|
| `0c74cd7e-ea35-11ee-a417-f661ea17fbce` | Ransomware Detected - Elastic Defend (Behavioral) | Fires on Elastic Defend behavioral ransomware classification. Complements this rule by catching the encryption phase; this rule catches the earlier read/staging phase. |
| `1397e1b9-0c90-4d24-8d7b-80598eb9bc9a` | High Frequency File Renames by Kernel | Detects kernel-level file rename bursts (classic ransomware extension rotation). That rule fires at the encryption step; this rule fires during pre-encryption collection. Together they form a two-stage ransomware detection chain. |

**Recommended Alerting Chain:**

```
[This rule fires: mass file reads]  →  [Prebuilt: High Freq Renames]  →  [Prebuilt: Ransomware Detected]
          ~T+0                                   ~T+30–120s                        ~T+60–180s
```

If only the behavioral ransomware rule fires without this rule having fired first, investigators should check whether file access logging was enabled for the affected host.

---

## Example Scenario

At 10:43 PM on a Friday, an Elastic Defend alert fires on `workstation-07`. The on-call analyst sees the following in the M-26-14 Appendix B (C) alert:

- **user.name:** `jdoe`
- **process.name:** `cmd.exe`
- **file_access_count:** 847
- **distinct_paths:** 312
- **window_seconds:** 183
- **access_rate:** 277.4 files/min
- **alert_reason:** `jdoe accessed 847 files in 183s via cmd.exe`

The analyst pivots to the Timeline and finds that `cmd.exe` was spawned by `collect_data.bat` — a script with no prior execution history on this machine. The script iterated over `C:\Users\jdoe\Documents\HR\` and `C:\Users\jdoe\Documents\Finance\`, reading every `.docx`, `.xlsx`, and `.pdf` it found.

Four minutes after the rule fired at file number 500, a USB mass storage device event appears in `logs-endpoint.events.device*`. Post-incident forensics confirm that `jdoe` — who received a termination notice the previous morning — staged 2.3 GB of employee records, salary data, and performance reviews to an encrypted USB drive before badge access was revoked at midnight.

The WS3 peripheral inventory rule (m2614-appendixb-e series) would also have caught the USB enumeration event. The mass-file-access rule provided the four-minute warning that — had 24/7 SOC coverage been in place — could have enabled containment before data left the building.

The incident satisfies the M-26-14 §7 reporting threshold (PII of more than 100 individuals accessed by an unauthorized subject) and triggers a mandatory 72-hour notification to the agency CISO and CISA.

---

## Investigation Guide

When this rule fires, follow these steps in order. The goal is a containment decision within 30 minutes of alert creation.

### Immediate (0–5 minutes)

1. Read the `alert_reason` field first — it gives you user, count, duration, and process in one string.
2. Assess `access_rate`. Values above 100 files/min are almost always automated. Values below 20 files/min may indicate manual browsing (still abnormal if file count is high, but different urgency).
3. Check `distinct_paths`. If `distinct_paths` is close to `file_access_count`, each file was accessed once — consistent with a sweep script. If `distinct_paths` is low relative to count, the same files are being read repeatedly — consistent with encryption loops or incremental hash verification.
4. Check `process.name`. Legitimate high-volume processes (backup agents, AV scanners, search indexers) should already be excluded by the rule's filter. If a legitimate process appears, add it to the exception list and close the alert. If a shell interpreter or unknown executable appears, escalate.

### Short Investigation (5–30 minutes)

5. Open **Kibana Security → Timeline**. Filter on `user.name: <value>` and `host.name: <value>`. Set window to `first_seen - 30m` through `last_seen + 30m`.
6. Review **process lineage** — look at `process.parent.name` and `process.args`. Scripts invoked from an interactive shell are more suspicious than scheduled task launches.
7. Check for **USB/removable media** on the same host: filter `logs-endpoint.events.device*` for `event.action: "mount"` or `"connect"` within the same window.
8. Check **outbound network** from the host: look for large bytes-out events in `logs-endpoint.events.network*` or `logs-network_traffic.*`, especially to external IPs or cloud storage endpoints (TCP 443 to known cloud IPs, FTP, SCP).
9. Review **file.path values** in the raw events. HR directories, financial records, credential stores, source code repos, and classified-adjacent directories warrant immediate escalation to P1.
10. Query `logs-endpoint.alerts*` for the same host to check if the prebuilt ransomware behavioral rule also fired within the same window (the two-stage chain described above).

### Containment Decision (30–60 minutes)

11. **If ransomware is suspected:** isolate the host immediately via Elastic Defend response action (Security → Endpoints → select host → Isolate). Do not wait for confirmation.
12. **If insider threat is suspected:** revoke Active Directory credentials and Kerberos tickets. Engage the user's manager and HR. Preserve USB chain of custody if device is still on premises.
13. **If uncertain:** escalate to Tier 2/3. Do not dismiss.
14. Document the decision and evidence in your ticketing system. Link the Kibana alert URL for audit trail.

### Post-Incident

15. Compare `last_seen` with USB mount time or network egress events to determine whether exfil completed.
16. Identify all `file.path` values accessed and notify the data owner to begin breach scope assessment.
17. If PII of 100+ individuals was accessed, file a CISA Logging Incident Report per M-26-14 §7 within 72 hours.
18. Review whether the alert fired fast enough (within 1 interval of threshold crossing). If not, consider shortening the interval to `2m` with `from: now-3m` for higher-risk environments.

---

## Tuning Guidance

### Recommended Exception List Entries

Add these exceptions under **Security → Rules → [this rule] → Exception Lists** before enabling. Use the `process.name` field for process-based exceptions and `user.name` for service account exceptions.

| Exception Type | Field | Value | Justification |
|---|---|---|---|
| Process | `process.name` | `MsMpEng.exe` | Windows Defender real-time scanning |
| Process | `process.name` | `svchost.exe` | Windows service host (indexing, thumbnail generation) |
| Process | `process.name` | `SearchIndexer.exe` | Windows Search Indexer |
| Process | `process.name` | `BackupExec.exe` | Veritas Backup Exec agent |
| Process | `process.name` | `veeam*` | Veeam backup agent (wildcard) |
| Process | `process.name` | `rsync` | Linux rsync backup operations |
| Process | `process.name` | `Code.exe` | VS Code file watcher |
| Process | `process.name` | `idea64.exe` | JetBrains IDE file indexing |
| User | `user.name` | `svc_backup` | Scheduled backup service account |
| User | `user.name` | `svc_antivirus` | AV scan service account |

### Threshold Adjustments

| Environment | Recommended Threshold | Rationale |
|---|---|---|
| Standard workstation fleet | 500 (default) | Suitable for most endpoint types |
| Developer workstations | 1000–2000 | IDEs generate high file access counts during project builds |
| File servers | Do not enable directly on file servers | File servers aggregate access from all users — use a per-user threshold rule variant instead |
| Linux servers (auditd) | 500 | Same default; verify auditd syscall rules include `open`, `openat`, `read` |

### Timeline for Enablement

1. **Day 0:** Import rule. Leave disabled. Confirm `logs-endpoint.events.file*` data is flowing.
2. **Days 1–7:** Run rule in **Preview** mode. Review which processes and users would have triggered it.
3. **Week 2:** Add identified legitimate high-volume processes to the exception list.
4. **Week 3:** Enable the rule. Monitor alerts for 5 business days. Tune further if false-positive volume exceeds 5 alerts/day.
5. **Month 2:** Review threshold against baseline access rates for your specific environment. Adjust if needed.

---

## Prerequisites

### Required Integrations

| Integration | Purpose | Minimum Config |
|---|---|---|
| **Elastic Defend** (Endpoint Security) | Generates `logs-endpoint.events.file*` events | File Access monitoring: **Enabled** in Endpoint policy |
| **Auditd** (Linux only) | Generates `logs-auditd.*` file syscall events | Syscall rules must include: `-a always,exit -F arch=b64 -S open,openat,read -k m2614_file_access` |

### Data Streams That Must Be Flowing

Before enabling the rule, verify these data streams exist and contain recent events:

```bash
# Verify Elastic Defend file events (run in Kibana Dev Tools)
GET logs-endpoint.events.file-*/_count
{
  "query": {
    "range": { "@timestamp": { "gte": "now-1h" } }
  }
}

# Expected: count > 0 for each monitored host
```

If the count is 0, the most common causes are:
- Elastic Defend policy does not have File Access events enabled (check Fleet → Agent Policy → Elastic Defend → Event Collection → File)
- Elastic Agent is enrolled but not actively sending (check Fleet → Agents for "Healthy" status)
- Data stream routing is misconfigured (check Fleet → Agent Policy → Elastic Defend → Advanced → output settings)

### Licensing

- **Elastic Defend** requires at minimum an Elastic **Complete** (formerly Platinum) subscription for endpoint file events.
- ES|QL detection rules require **Kibana 8.12+** or **9.x** (included in this pack's target of 9.4.2).
- The rule itself does not require ML or SIEM-specific add-ons beyond the standard Security solution.
