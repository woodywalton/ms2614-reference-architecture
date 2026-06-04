# M-26-14 Appendix B Category (J): APT Attack Chain — Initial Access, Persistence, Lateral Movement

## Overview

This detection rule category implements correlated EQL sequence detection for multi-stage APT attack chains targeting federal agency systems. The rules identify a three-step intrusion pattern on a single host within a bounded time window:

1. **Initial Access** — inbound network connection from an external (non-RFC-1918) IP address
2. **Execution** — launch of a scripting engine or Living-off-the-Land Binary (LOLBin): `cmd.exe`, `powershell.exe`, `wscript.exe`, `cscript.exe`, `mshta.exe`, `regsvr32.exe`, `rundll32.exe`, or `certutil.exe`
3. **Lateral Movement** — outbound network connection to a lateral-movement port (SMB 445, RPC 135/139, RDP 3389, SSH 22, WinRM 5985/5986)

All three events must occur on the same `host.id` within the configured time window. The sequence ordering is enforced by EQL — the rule will not fire if events occur out of order.

Two time-window variants are provided:

| Rule | Window | Purpose |
|------|--------|---------|
| `m2614-appendixb-j-apt-chain-2h` | 2 hours | Fast-moving attacks, commodity malware, automated exploitation |
| `m2614-appendixb-j-apt-chain-4h` | 4 hours | Slow-paced APT actors (APT29, APT41) that deliberately pace lateral movement to evade short-window rules |

### Why This Matters for M-26-14 §5(j)

M-26-14 Appendix B §5(j) requires federal agencies to deploy threat detection capabilities that identify adversary techniques consistent with APT behavior — specifically, the chained use of initial access, execution, and lateral movement within a single intrusion. These rules operationalize that requirement by:

- Correlating cross-data-source events (network + process) on the same endpoint
- Enforcing a time-bounded sequence that mirrors real APT dwell-and-pivot behavior
- Generating critical-severity alerts that feed directly into the agency's THIRF (Threat Hunting and Incident Response Framework) workflow
- Providing investigation guides aligned with M-26-14 §5(j) escalation timelines

---

## M-26-14 Reference

**Appendix B, §5(j) — Detection of Advanced Persistent Threat Indicators**

> Agencies must implement automated detection mechanisms capable of identifying multi-stage intrusion activity consistent with advanced persistent threat (APT) tradecraft, including but not limited to: exploitation of internet-facing systems, execution of native operating system interpreters or scripting engines by unexpected parent processes, and subsequent lateral movement to internal systems via standard administrative protocols (SMB, RDP, SSH, WinRM). Detection must be correlated across endpoint telemetry, network flow data, and authentication logs. Agencies must escalate confirmed or suspected APT activity to the agency CISO and ISSO within one hour of detection and open a Threat Hunting and Incident Response Framework (THIRF) ticket within 72 hours.

**Related M-26-14 Requirements:**
- §5(e) — Continuous monitoring of endpoint events (satisfied by Elastic Defend data streams)
- §5(g) — Network traffic visibility (satisfied by endpoint network events)
- §5(j) — APT detection and response (directly addressed by these rules)
- §5(k) — Incident escalation timelines (referenced in the investigation guide)

---

## Rule Details

### Rule 1 — 2-Hour Window

| Field | Value |
|-------|-------|
| Rule ID | `m2614-appendixb-j-apt-chain-2h` |
| Type | EQL Sequence |
| Severity | Critical |
| Risk Score | 91 |
| Interval | 5 minutes |
| From | `now-6m` |
| Max Signals | 100 |
| Enabled by Default | No (enable after tuning) |
| Indexes | `logs-endpoint.events.network*`, `logs-endpoint.events.process*`, `logs-windows.sysmon_operational*` |
| EQL Max Span | 2 hours |
| Tags | M-26-14, Appendix-B-J, Element-3, Level-2, CEM, THIRF |

**MITRE ATT&CK Coverage:**

| Tactic | Technique | Sub-Technique |
|--------|-----------|---------------|
| TA0001 Initial Access | T1190 Exploit Public-Facing Application | — |
| TA0002 Execution | T1059 Command and Scripting Interpreter | T1059.001 PowerShell, T1059.003 Windows Command Shell |
| TA0008 Lateral Movement | T1021 Remote Services | T1021.001 RDP, T1021.002 SMB/Windows Admin Shares |

### Rule 2 — 4-Hour Window

| Field | Value |
|-------|-------|
| Rule ID | `m2614-appendixb-j-apt-chain-4h` |
| Type | EQL Sequence |
| Severity | Critical |
| Risk Score | 91 |
| Interval | 5 minutes |
| From | `now-6m` |
| Max Signals | 100 |
| Enabled by Default | No (enable after tuning) |
| Indexes | `logs-endpoint.events.network*`, `logs-endpoint.events.process*`, `logs-windows.sysmon_operational*` |
| EQL Max Span | 4 hours |
| Tags | M-26-14, Appendix-B-J, Element-3, Level-2, CEM, THIRF |

MITRE ATT&CK coverage is identical to the 2-hour variant.

---

## Related Existing Prebuilt Rules

These Elastic Security prebuilt rules address overlapping or complementary detection scenarios. Agencies should enable these rules alongside the M-26-14 custom rules — do not duplicate their logic in custom rules.

| Rule UUID | Rule Name | Relationship to M-26-14 AppB-J |
|-----------|-----------|-------------------------------|
| `b946c2f7-df06-4c00-a5aa-1f6fbc7bb72c` | Multiple Alerts in Different ATT&CK Tactics | Detects when a single host generates alerts across multiple MITRE tactics within a window — a higher-level signal that reinforces the APT chain alert. Enable alongside the M-26-14 rules to catch chains that span more than three tactics. |
| `ab75c24b-2502-43a0-bf7c-e60e662c811e` | Remote Execution via File Shares | Detects execution of binaries placed via SMB shares — the downstream consequence of the lateral movement step (step 3) in the M-26-14 AppB-J chain. This rule fires on the *destination* host after the M-26-14 rule fires on the *source* host. Enable both for full chain coverage. |

**Recommended pairing:** Create a Kibana correlation rule or SOAR playbook that links alerts from these prebuilt rules to M-26-14 AppB-J alerts by `host.id` and `@timestamp` proximity.

---

## Example Scenario

### Zero-Day Exploitation Leading to SMB Lateral Movement (2026-05-30)

At **14:23 UTC**, a threat actor exploiting a zero-day vulnerability in the agency's public web portal (tracked as CVE-2026-XXXX) sends a crafted HTTP POST request to the portal running on `webserver-01.agency.gov` (`host.id=host-webserver-01`, IP `10.0.0.5`). The attacker's source IP, `198.51.100.75`, is a leased VPS node in Eastern Europe with no prior relationship to agency infrastructure. Elastic Defend records an inbound network event — this satisfies step 1 of the EQL sequence.

At **14:38 UTC** — 15 minutes later — the IIS worker process `w3wp.exe` (PID 1244) spawns `cmd.exe` (PID 4812) with a base64-encoded PowerShell download cradle in the command arguments. The `user.name` is `www-data`. No legitimate administrative activity would produce this parent-child relationship. Elastic Defend records a process start event — this satisfies step 2 of the EQL sequence.

At **15:11 UTC** — 48 minutes after the shell spawned, and 48 minutes within the 2-hour window — `webserver-01.agency.gov` initiates an outbound TCP connection to `10.0.0.100:445` (the internal file server). This is consistent with the attacker using the compromised web server as a pivot point to reach internal systems via SMB. Elastic Defend records an egress network event — this satisfies step 3 of the EQL sequence.

At **15:11 UTC**, the M-26-14 AppB-J 2-hour rule fires with a critical alert. The `maxspan=2h` window elapsed in 48 minutes; all three events share `host.id=host-webserver-01`. The alert is routed to the SIEM queue and triggers a PagerDuty page to the on-call SOC analyst.

The SOC analyst reviews the alert timeline in Elastic Security, confirms the `w3wp.exe → cmd.exe` spawn and the encoded PowerShell argument, and executes an Endpoint response action (Isolate Host) from the Fleet UI at **15:19 UTC** — **8 minutes** after the alert fired and well within the 1-hour M-26-14 §5(j) escalation requirement. The ISSO is notified at 15:22 UTC. A THIRF ticket is opened at 15:30 UTC with the full three-event timeline attached.

Post-incident analysis confirms the attacker did not successfully execute on the internal file server — the lateral movement connection was initiated but the host isolation dropped the TCP session before any files were accessed.

---

## Investigation Guide

When this rule fires, follow this playbook in order.

### 1. Confirm the Event Sequence

- Open the alert in Elastic Security and navigate to the **Timeline** tab.
- Verify that all three events in the sequence share the same `host.id`.
- Confirm the temporal order: inbound network → process start → egress network.
- Note the total elapsed time between event 1 and event 3. Sub-5-minute chains are more likely scanner noise; chains spanning 30+ minutes suggest deliberate human-paced activity.

### 2. Investigate the Inbound Connection (Step 1)

- Record `source.ip`, `destination.port`, and `network.bytes`.
- Threat-intel lookup: query `source.ip` against the agency's threat intel feed and VirusTotal/Shodan.
- Check WAF/proxy logs for the same source IP in the 24 hours prior — look for scanning or enumeration activity.
- Identify the service exposed on `destination.port`: is it expected to be internet-facing?

### 3. Investigate the Process (Step 2)

- Record `process.name`, `process.parent.name`, `process.parent.executable`, and `process.args`.
- **Red flags:** parent is a web server process (`w3wp.exe`, `httpd`, `nginx`, `tomcat`), `java.exe`, or a document reader (`winword.exe`, `excel.exe`).
- **Decode arguments:** if `process.args` contains `-enc` or `-EncodedCommand`, base64-decode the payload.
- Check `logs-endpoint.alerts*` for any ML anomaly or behavioral protection alerts on the same host in the same window.
- Review `process.working_directory` — execution from `%TEMP%`, `%APPDATA%`, or web root directories is a strong indicator.

### 4. Investigate the Lateral Movement Target (Step 3)

- Record `destination.ip` and `destination.port`.
- Map `destination.ip` to an asset in the M-26-14 asset inventory index (`m2614-osquery-hardware-inventory`).
- **SMB (445):** Check the destination host for file creation events (`logs-endpoint.events.file*`) or new process starts in the 30 minutes following the connection.
- **RDP (3389):** Check for authentication events (`logs-windows.security*` or `logs-system.auth*`) on the destination host.
- **WinRM (5985/5986):** Check for PowerShell remoting sessions and any subsequent commands executed.
- **SSH (22):** Check for successful authentication and interactive session activity on the destination host.

### 5. Collect Forensic Artifacts

Before making containment decisions that could destroy evidence:

1. Trigger an Elastic Endpoint **memory acquisition** from Fleet if memory forensics is needed.
2. Export the full process tree for the flagged process via Elastic Endpoint's process tree view.
3. Preserve the raw events by adding them to a Case in Elastic Security.

### 6. Containment

If the chain is confirmed malicious:

1. **Isolate the source host** via Elastic Endpoint response action (Fleet → Hosts → Isolate). This blocks all network traffic while preserving the endpoint for investigation.
2. **Block the external source IP** at the agency perimeter firewall/WAF. Create a block rule for `source.ip` on all perimeter devices.
3. **Assess the lateral movement target** — if the SMB/RDP connection succeeded (check `network.bytes` > 0 on the egress event and authentication logs on the destination), assess the destination host for compromise and consider isolating it as well.

### 7. Escalation (M-26-14 §5(j) Requirements)

- **Within 1 hour of alert:** Notify agency CISO and ISSO. Include: affected host, attack timeline, current containment status.
- **Within 72 hours:** Open a THIRF ticket with complete incident timeline, affected assets, IOCs (source IP, file hashes if available), and initial impact assessment.
- **FISMA High systems:** If the affected host processes FISMA High data, follow the agency's FISMA High incident notification procedures in addition to THIRF requirements.

---

## Tuning Guidance

### Exception List Entries (add before enabling)

| Field | Operator | Value | Reason |
|-------|----------|-------|--------|
| `source.ip` | is one of | `<Nessus/Qualys scanner IPs>` | Vulnerability scanners generate inbound connections that trigger step 1 |
| `host.id` | is one of | `<SCCM server host IDs>` | SCCM legitimately runs cmd.exe/PowerShell and connects via SMB |
| `process.parent.name` | is one of | `msiexec.exe`, `services.exe` | Legitimate software installations and service starts |
| `destination.ip` | is one of | `<known backup server IPs>` | Backup agents use SMB on port 445 |
| `user.name` | is one of | `<service accounts for monitoring tools>` | Monitoring agents may use LOLBins |

### Threshold Adjustments

- **network.bytes filter on step 1:** Add `network.bytes > 500` to the inbound network event filter to suppress short TCP probes and SYN scans that don't carry payload. Adjust the threshold based on your environment's observed scan traffic.
- **process.args length:** Add `length(process.args) > 100` to the process event filter to focus on processes launched with substantive arguments (reduces false positives from simple interactive cmd.exe usage).

### Enablement Timeline

| Day | Action |
|-----|--------|
| Day 1-5 | Enable both rules in **alert-only mode** (no SOAR actions). Review all alerts daily and document false positives. |
| Day 6-10 | Add exception list entries for confirmed false positive patterns. Continue monitoring alert volume. |
| Day 11 | If false positive rate < 5 alerts/day, enable SOAR automation (PagerDuty/Slack notification). |
| Day 30 | Review exception list for stale entries. Adjust `network.bytes` and `process.args` thresholds if needed. |
| Day 90 | Quarterly tuning review — assess whether new LOLBins should be added to the `process.name` list. |

### Dual-Rule Deduplication

Both the 2h and 4h rules will fire for the same chain if the chain completes within 2 hours. In your SOAR platform, deduplicate using `host.id` + the `@timestamp` of the inbound network event (step 1) as a correlation key. Suppress the 4h alert if a 2h alert for the same chain is already open.

---

## Prerequisites

### Required Integrations

| Integration | Version | Required Data Streams | Purpose |
|-------------|---------|----------------------|---------|
| Elastic Defend | >= 8.4.0 | `logs-endpoint.events.network*`, `logs-endpoint.events.process*` | Primary event source for steps 1, 2, and 3 |
| Sysmon (Windows) | >= 14.0 | `logs-windows.sysmon_operational*` | Supplemental coverage for Windows hosts not running Elastic Defend; EventID 1 (process) and EventID 3 (network) |

Sysmon is optional but provides defense-in-depth coverage. If both Elastic Defend and Sysmon are deployed on the same host, events may be duplicated in the index — this is acceptable for sequence rules (duplicate events will satisfy the same sequence step).

### Minimum Data Requirements

Before enabling either rule, verify the following data streams are actively receiving events:

```
GET logs-endpoint.events.network-*/_count
GET logs-endpoint.events.process-*/_count
```

Both queries should return `count > 0`. If either returns 0:

- Verify the Elastic Defend policy has **Network Events** and **Process Events** collection enabled.
- Verify the Elastic Agent on affected hosts is in `Healthy` status in Fleet.
- Verify the Agent policy includes the `endpoint` integration with event collection enabled for both process and network categories.

### Network Visibility Requirements

The inbound network event (step 1) is captured at the endpoint (Elastic Defend network events). This means:

- The monitored host must have Elastic Defend installed and healthy.
- Traffic that is load-balanced or proxied before reaching the host may show the load balancer's IP as `source.ip` rather than the true external IP. If this is the case in your environment, step 1 may not match the `not cidrmatch(...)` exclusion correctly — review your network architecture and add the load balancer IP range to the exception list or adjust the query to use `destination.ip` correlation.

### Permissions

The detection rule engine requires:
- Kibana role with `siem` feature access (read/write)
- Index pattern privileges on `logs-endpoint.events.network*` and `logs-endpoint.events.process*`

Analysts investigating alerts require:
- Kibana role with `siem` feature access (read)
- Fleet `Superuser` or custom role with `hosts:read` and `actions:execute` for Endpoint response actions
