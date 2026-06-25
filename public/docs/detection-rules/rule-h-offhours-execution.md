# M-26-14 Appendix B Category (H): Off-Hours Bulk Process Execution — Insider Threat / Compromised Account

## Overview

This rule detects non-system user accounts that launch 50 or more processes on a single host during off-hours (22:00–05:00 UTC) within a one-hour rolling window. The combination of off-hours timing and high process volume is a reliable behavioral indicator of insider threat activity or a compromised account in an active-use phase — situations where an adversary (or malicious insider) leverages legitimate credentials to conduct reconnaissance, stage data, or exfiltrate information while evading daytime human review.

The rule is implemented as an ES|QL aggregation query because only ES|QL can filter on time-of-day derived fields (`DATE_EXTRACT`) and aggregate results in the same pipeline. Threshold rules cannot apply post-aggregation time-of-day filters, making ES|QL the only viable rule type for this detection pattern.

### Why This Matters for M-26-14 §5

OMB Memorandum M-26-14 §5 requires agencies to implement a Threat and Hunting-Informed Risk Framework (THIRF) and Continuous Endpoint Monitoring (CEM) capabilities. Appendix B Category (H) specifically calls for behavioral detection of anomalous off-hours activity, recognizing that:

- Federal systems process sensitive data and PII that is attractive to insiders and nation-state adversaries.
- Contractor and temporary staff access is a known risk vector — accounts frequently persist past project completion.
- Bulk process execution at unusual hours is a behavioral signature that bypasses signature-based detection.
- Detection latency must be minimized; a 1-hour detection window satisfies the near-real-time monitoring requirement.

---

## M-26-14 Reference

**Appendix B, §5(h) — Anomalous Off-Hours Activity (Insider Threat / Compromised Credentials)**

> Agencies SHALL implement behavioral detection controls capable of identifying non-interactive and interactive user sessions that generate process execution volumes significantly exceeding baseline during non-business hours (defined as 22:00–05:00 local or UTC at agency discretion). Detection controls MUST be capable of correlating account identity, endpoint, and temporal context, and MUST generate alerts within 60 minutes of threshold crossing. Agencies SHALL maintain exception lists for known scheduled maintenance accounts and SHALL review those exceptions no less than annually.

**Element:** 3 — Endpoint Telemetry and Behavioral Detection
**Minimum Level:** 2 — Near-real-time monitoring with automated alerting
**Objectives:** CEM (Continuous Endpoint Monitoring), THIRF (Threat and Hunting-Informed Risk Framework)

---

## Rule Details

| Field | Value |
|---|---|
| Rule ID | `m_26_14-appendixb-h-offhours-bulk-process-execution` |
| UUID | `a3f7c891-2d4e-4b8a-9f1c-6e5d3a2b0c8f` |
| Rule Type | ES|QL |
| Severity | High |
| Risk Score | 73 |
| Interval | 1 hour |
| Look-back Window | `now-61m` |
| Threshold | >= 50 processes per user/host pair |
| Off-Hours Definition | `HOUR_OF_DAY >= 22 OR HOUR_OF_DAY <= 5` (UTC) |
| Enabled by Default | false (tune before enabling) |
| Version | 1 |

### Indexes

| Index Pattern | Integration | Event Type |
|---|---|---|
| `logs-endpoint.events.process*` | Elastic Defend | Process start events |
| `logs-windows.sysmon_operational*` | Sysmon via Elastic Agent | Event ID 1 (Process Create) |

### MITRE ATT&CK Mapping

| Tactic | Technique | Sub-technique |
|---|---|---|
| TA0002 Execution | T1059 Command and Scripting Interpreter | T1059.001 PowerShell |
| TA0002 Execution | T1059 Command and Scripting Interpreter | T1059.003 Windows Command Shell |

---

## Related Existing Rules

The following Elastic prebuilt rules complement this custom rule. Do not duplicate these — reference them in SIEM dashboards and correlation workflows instead.

| Rule ID | Rule Name | Relationship |
|---|---|---|
| `745b0119-0560-43ba-860a-7235dd8cee8d` | Unusual Hour for a User to Logon (ML) | ML-based anomaly detection on logon timing. Fires on the authentication event; this rule fires on the sustained process execution behavior that follows. Together they provide a full kill-chain view: unusual logon → bulk execution. |
| *(Elastic prebuilt)* | Unusual Process For a Windows Host (ML) | Detects process anomalies per host baseline. Complements this rule by identifying individual unusual binaries within the bulk execution burst. |
| *(Elastic prebuilt)* | Potential Credential Dumping via Windows Registry | May co-fire if `reg.exe` SAM export is in the process burst. Elevates severity when both rules fire together. |
| *(Elastic prebuilt)* | Windows Event Log Cleared | Correlates with log-clearing behavior seen in the scenario below (wevtutil/Clear-EventLog). |

---

## Example Scenario

It is 2:38 AM UTC on a Wednesday. The Security Operations Center is staffed by a single overnight analyst monitoring a wall of dashboards.

On `workstation-03`, a privileged contractor account — `contractor_bob` — begins executing processes. The project this contractor supported officially ended two weeks earlier. No offboarding ticket was filed with IT; the account remains active.

Between 2:00 AM and 2:45 AM, the account executes 63 processes in a deliberate sequence. The first phase is reconnaissance: `whoami /all`, `net user`, `net group "Domain Admins" /domain`, `nltest.exe /dclist:`, `dsquery.exe user -limit 500`. The contractor is mapping the environment — enumerating domain users, groups, and trust relationships.

The second phase is data staging. `Get-ChildItem` scans recursively for `.docx`, `.pdf`, and `.xlsx` files across the entire `C:\` drive. `xcopy.exe` copies the `Projects` folder to `C:\Temp\export`. `robocopy.exe` mirrors the user's home directory to `C:\Temp\home_backup`. `Compress-Archive` packages everything into a `.zip`.

At 2:12 AM, `Invoke-WebRequest` attempts an HTTP POST to `203.0.113.45` — a non-agency IP not on any allowlist. `certutil.exe` Base64-encodes the archive as a preparation step.

The off-hours bulk process rule fires at process 50, approximately 2:38 AM. The alert surfaces in the SIEM with `process_count=50`, `distinct_processes=14`, and the generated `alert_reason` field: `contractor_bob launched 50 processes on workstation-03 during off-hours (22:00-05:00 UTC)`.

The overnight analyst opens the case. Cross-referencing HR records confirms the contractor's engagement ended 14 days prior. The endpoint is isolated via Fleet within four minutes of the alert. Forensic acquisition begins at 3:05 AM. The attempted upload to `203.0.113.45` failed (proxy blocked the destination), but the staged archive in `C:\Temp` contains 2.3 GB of sensitive project deliverables.

The final phase — log clearing with `wevtutil cl Security` and `Clear-EventLog` — was interrupted by the isolation action. Endpoint telemetry, captured in the Elasticsearch data tier before clearing was attempted, preserved the complete process chain.

---

## Investigation Guide

### Step 1 — Assess the Alert Fields

When the rule fires, examine the aggregated row returned:

- `user.name` — who triggered it
- `host.name` — which endpoint
- `process_count` — total processes; higher counts indicate more active operation
- `distinct_processes` — unique binary names; >10 distinct executables is high-confidence malicious
- `first_seen` / `last_seen` — duration of the activity window
- `alert_reason` — human-readable summary

### Step 2 — Pull the Raw Process Timeline

Run this ES|QL query in Discover, scoped to the alert window:

```esql
FROM logs-endpoint.events.process*, logs-windows.sysmon_operational*
| WHERE user.name == "<USER>" AND host.name == "<HOST>"
  AND @timestamp >= "<first_seen>" AND @timestamp <= "<last_seen>"
| KEEP @timestamp, process.name, process.executable, process.args, process.pid, process.parent.name
| SORT @timestamp ASC
```

Look for the attack lifecycle pattern: enumeration → staging → exfiltration attempt → cleanup.

### Step 3 — Flag High-Risk Binaries

Immediately escalate if the process burst includes any of the following:

| Binary | Concern |
|---|---|
| `certutil.exe` | Base64 encoding for exfiltration |
| `mshta.exe` | Script execution via HTA (often malware delivery) |
| `nltest.exe` | Domain trust/DC enumeration |
| `dsquery.exe` | AD user/group enumeration |
| `reg.exe export HKLM\SAM` | Credential dumping attempt |
| `wevtutil cl` or `Clear-EventLog` | Evidence tampering |
| `net user /add` | Persistence via new account creation |
| `Invoke-WebRequest` with external IP | Active exfiltration attempt |

### Step 4 — Verify Account Status

- Is the account a contractor, temp, or recently terminated employee? Check HR/ITSM system.
- Is the account expected to be active at this hour? Check approved maintenance windows.
- Query IdP (Okta/Azure AD) for authentication events in the same window:
  - Was MFA bypassed or downgraded?
  - Was the login from an unusual IP or geography?

### Step 5 — Correlate Network Activity

Query network events for the same host in the same window:

```esql
FROM logs-network_traffic.*, logs-palo_alto_networks.*
| WHERE host.name == "<HOST>" AND @timestamp >= "<first_seen>" AND @timestamp <= "<last_seen>"
  AND network.direction == "egress"
| STATS bytes_out=SUM(network.bytes) BY destination.ip, destination.port
| SORT bytes_out DESC
```

High outbound byte counts to external IPs confirm exfiltration intent.

### Step 6 — Containment Decision

**If unauthorized access is confirmed:**

1. Isolate the endpoint: Fleet > Hosts > Select host > Isolate.
2. Disable the account: AD `Disable-ADAccount` or IdP admin panel.
3. Revoke all active sessions (Okta session revoke, Azure AD sign-out all sessions).
4. Do not reimage the endpoint before forensic acquisition — preserve `C:\Temp` contents and memory.
5. Open a P1 incident ticket and notify the ISSO within 1 hour per M-26-14 §4 reporting requirements.

### Step 7 — Forensic Preservation

- Export the raw process events from Elasticsearch to a WORM-compliant data store before any retention policy purges them.
- Capture a memory image if malware is suspected (WMIC process delete in the burst suggests attempted process termination).
- Note: Elastic Defend captures process telemetry before log-clearing commands can execute — Elasticsearch is the forensic source of truth.

---

## Tuning Guidance

### Before Enabling

1. **Run in shadow mode for 2 weeks.** Keep `enabled: false`, but query the rule's ES|QL manually every morning to see what would have fired. Log these to an exceptions candidate list.

2. **Identify overnight batch accounts.** Any service account that runs scheduled jobs during off-hours should be added to an exception list by `user.name`. Common candidates: `backup_svc`, `patch_deploy_svc`, `av_update_svc`, `monitoring_agent`.

3. **Identify batch build hosts.** CI/CD build agents and overnight patch servers generate high process counts. Add these by `host.name` pattern (e.g., `build-agent-*`, `patch-server-*`).

### Exception List Entries

Add entries to the rule's exception list in Kibana (Rule > Edit > Exceptions):

| Field | Operator | Value | Rationale |
|---|---|---|---|
| `user.name` | is one of | `backup_svc`, `patch_mgr`, `av_update` | Known overnight batch accounts |
| `host.name` | matches | `build-agent-*` | CI/CD build farm |
| `host.name` | matches | `patch-server-*` | WSUS/SCCM distribution points |

### Threshold Adjustment

| Environment Noise Level | Recommended Threshold | Rationale |
|---|---|---|
| Low (most federal endpoints) | 50 (default) | Conservative; minimize missed detections |
| Medium (dev/test environments) | 75 | Reduces noise from development workflows |
| High (build/CI environments) | Add host exception instead | Threshold alone is insufficient |

### Off-Hours Window Adjustment

The default window is 22:00–05:00 UTC. Agencies with distributed time zones or 24-hour operations should adjust the `HOUR_OF_DAY` filter to match their defined "off-hours" policy. This requires editing the rule query.

### Review Cadence

- **Week 1–2:** Daily review of shadow-mode results, build exception list.
- **Week 3:** Enable with a high threshold (75) and monitor false positive rate.
- **Week 4+:** Lower to 50 if false positive rate is below 5 alerts/week.
- **Quarterly:** Review and re-certify the exception list (required by M-26-14 §5(h)).

---

## Prerequisites

### Required Integrations

| Integration | Minimum Version | Purpose |
|---|---|---|
| Elastic Defend | 8.10.0 | Process event telemetry (`logs-endpoint.events.process*`) |
| Elastic Agent | 8.10.0 | Transport and management |
| Fleet Server | 8.10.0 | Agent enrollment and policy distribution |

### Optional (Additive) Integrations

| Integration | Purpose |
|---|---|
| Sysmon via Elastic Agent | Adds `logs-windows.sysmon_operational*` as a secondary process event source |
| Okta Integration | Correlates authentication context with process execution bursts |
| Active Directory Integration | Enriches `user.name` with department, manager, and account status |

### Required Data Streams

Verify these are flowing before enabling:

```esql
FROM logs-endpoint.events.process*
| STATS doc_count=COUNT(*), last_event=MAX(@timestamp) BY host.name
| SORT last_event DESC
| LIMIT 20
```

All monitored endpoints should appear with a `last_event` within the last 10 minutes during business hours.

### Required ECS Fields

The following fields must be populated for the rule to function correctly:

| Field | Required | Notes |
|---|---|---|
| `@timestamp` | Yes | Used for time-of-day extraction |
| `event.category` | Yes | Must include `"process"` |
| `event.type` | Yes | Must include `"start"` |
| `user.name` | Yes | Null records are excluded by rule |
| `process.name` | Yes | Used for distinct count and exclusion list |
| `host.name` | Yes | Used for per-host aggregation |

### Kibana Minimum Version

Elastic Security 9.4.2 or later. ES|QL rule type with `DATE_EXTRACT` and `COUNT_DISTINCT` requires Elasticsearch 8.12+ under the hood — confirmed available in the 9.4.x stack.
