# M-26-14 Appendix B Category (F): EDR Tamper — Security Tool Process Killed After High/Critical Alert

## Overview

This rule detects a two-stage adversarial sequence: a high or critical Elastic Endpoint alert fires on a host, followed within 10 minutes by the termination of a known endpoint security tool process on the same host. The correlation of these two events in a tight time window is a strong indicator that an attacker, having triggered a detection, is actively attempting to silence the sensor rather than retreating.

EDR tamper is one of the most operationally dangerous attacker behaviors in a federal environment. Once telemetry is lost from a host, every subsequent attacker action — lateral movement, data staging, exfiltration — is invisible until the agent is restored. M-26-14 §5(f) addresses this directly by requiring agencies to maintain continuous endpoint monitoring with integrity verification of the monitoring tooling itself.

This rule extends the concept of the Elastic prebuilt rule `fc552f49` (Elastic Defend Alert Followed by Telemetry Loss) by shifting detection earlier: rather than waiting for the agent heartbeat to go silent (which can take minutes to hours to surface), this rule fires the moment a named security tool process terminates after an alert, providing actionable signal while the attack is still in progress.

---

## M-26-14 Reference

**Appendix B, Category (F) — Endpoint Detection and Response (EDR) Integrity**

> Agencies shall deploy EDR tooling to all managed endpoints and shall continuously monitor for evidence of tampering with, disabling of, or circumvention of that tooling. Detection rules shall alert within minutes when a high- or critical-severity EDR alert is followed by termination or degradation of the monitoring process. Agencies must maintain documented response procedures for EDR tamper events and shall restore monitoring capability within a defined SLA.

*Source: OMB Memorandum M-26-14, Appendix B §5(f), Minimum Viable Cyber Defense Posture — Element 3, Level 2.*

---

## Rule Details

| Field | Value |
|---|---|
| **Rule ID** | `m_26_14-appendixb-f-edr-tamper` |
| **Kibana UUID** | `3e7a1c2f-9b84-4d56-ae12-fc7309a8b3d1` |
| **Type** | EQL Sequence |
| **Severity** | Critical |
| **Risk Score** | 87 |
| **Interval** | 5 minutes |
| **From** | now-6m (6-minute lookback, slightly wider than interval) |
| **Max Signals** | 100 |
| **Sequence maxspan** | 10 minutes |
| **Enabled by default** | No — enable after agency-specific tuning |
| **Indexes** | `logs-endpoint.alerts*`, `.alerts-security.*`, `logs-endpoint.events.process*` |
| **MITRE Tactic** | TA0005 — Defense Evasion |
| **MITRE Technique** | T1562 — Impair Defenses |
| **MITRE Sub-technique** | T1562.001 — Disable or Modify Tools |

### Security Tool Process List

The second sequence step matches termination of any of the following process names:

| Process Name | Product |
|---|---|
| `MsMpEng.exe` | Microsoft Defender Antivirus |
| `SentinelOne.exe` | SentinelOne |
| `falcon-sensor.exe` | CrowdStrike Falcon |
| `elastic-endpoint.exe` | Elastic Defend (endpoint component) |
| `elastic-agent.exe` | Elastic Agent |
| `SenseIR.exe` | Microsoft Defender for Endpoint (MDE) |
| `csfalconservice.exe` | CrowdStrike Falcon Service |
| `cb.exe` | VMware Carbon Black |
| `CylanceSvc.exe` | Cylance / BlackBerry |

---

## Related Existing Rules

| Rule UUID | Rule Name | Relationship |
|---|---|---|
| `fc552f49-8f1c-409b-90f8-6f5b9869b6c4` | Elastic Defend Alert Followed by Telemetry Loss | Detects the downstream effect (heartbeat loss) rather than the cause (process termination). Deploy both: this rule catches the tamper earlier; fc552f49 catches silent failures not preceded by a process kill event. |

**Deployment recommendation:** Deploy both rules together. This rule (`m_26_14-appendixb-f-edr-tamper`) provides faster, more specific detection when a process termination event is captured. Rule `fc552f49` provides a backstop for cases where the agent is killed in a way that does not generate a process end event (e.g., kernel-level manipulation, OS crash, VM suspension).

---

## Example Scenario

At 11:51 AM on a Tuesday, the Elastic Defend integration on `workstation-12` detects an in-memory credential access attempt and raises a **critical** malware prevention alert. The alert appears in the Kibana Security queue. The attacker, aware that the alert was triggered, pivots immediately: at 11:56 AM and 22 seconds, a custom PowerShell one-liner — `Stop-Process -Name elastic-agent -Force` — terminates the `elastic-agent.exe` process on the same host. Twenty seconds later, the EDR Tamper rule fires.

The on-call analyst receives a page. The rule alert contains both the triggering endpoint alert and the process termination event, correlated on `host.id = host-abc`. The analyst opens the host detail page, confirms the agent is offline, and initiates a Fleet remote reinstall action. The agent is restored in 4 minutes. During the reinstall, the analyst pulls Zeek network telemetry that was flowing independently, captures the attacker's DNS queries and a lateral movement attempt to a neighboring host, and escalates to a P1 incident.

Without this rule, the only signal would have been the original critical alert — the endpoint loss would not have appeared until the weekly Fleet health report. The attacker would have had an undetected window measured in hours, not seconds.

---

## Investigation Guide

### Step 1 — Identify Scope (0–5 minutes)

1. Open the alert in Kibana Security > Alerts. Note `host.id`, `host.name`, and `@timestamp` of both events in the sequence.
2. Navigate to Security > Hosts > select the affected host. Review the host risk score timeline — was it elevated before this alert?
3. Confirm the triggering endpoint alert: what threat was detected? Note `kibana.alert.rule.name`, `kibana.alert.severity`, and the process tree at time of original detection.
4. Confirm which security tool was terminated. The `process.name` field in the second sequence event names the victim process.

### Step 2 — Assess Agent Status (0–5 minutes)

5. Query `logs-elastic_agent.*` filtered to `agent.id` of the affected host for heartbeats in the last 5 minutes.
   - If no heartbeats: agent is down. Proceed to containment.
   - If heartbeats present: the process may have been a service restart, not a kill. Review `process.exit_code` and `process.parent.name` before escalating.
6. Check Fleet > Agents for the host. Status will show "Offline" or "Unhealthy" if telemetry is lost.

### Step 3 — Determine Attack Vector (5–15 minutes)

7. Retrieve `process.parent.name`, `process.parent.pid`, and `process.parent.executable` from the process termination event. This identifies the attacker's execution vehicle.
8. Search `logs-endpoint.events.process*` for the parent process: what spawned it? Build the process ancestry chain upward.
9. Search `logs-endpoint.events.network*` for the host in the 30 minutes before the alert for C2 connections (unusual outbound, non-standard ports, recently-registered domains).
10. Search `.alerts-security.*` for other high/critical alerts on hosts in the same network segment within the past 24 hours.

### Step 4 — Containment (10–20 minutes)

11. If the attacker is confirmed active and the host is reachable: initiate Fleet remote action > Host Isolation.
12. If the agent is offline and host isolation is not possible: coordinate with network team to VLAN-isolate the host at the switch level.
13. Before isolation, trigger a Fleet memory acquisition action (if Elastic Defend memory collection is configured) to capture volatile evidence.
14. Preserve `logs-endpoint.events.file*` and `logs-endpoint.events.registry*` from the host for the 60-minute window around the incident.

### Step 5 — Restore Monitoring

15. Use Fleet > Agents > select host > Actions > Reinstall to redeploy the agent remotely.
16. Verify agent heartbeat resumes within 3 minutes of reinstall.
17. Confirm the reinstalled agent starts generating process and network telemetry.

### Step 6 — Document and Notify

18. Open a P1 incident ticket citing M-26-14 §5(f) EDR Tamper.
19. Notify the ISSO and SOC lead.
20. Record time-to-detect, time-to-restore-monitoring, and attacker TTP details for the M-26-14 quarterly compliance report.

---

## Tuning Guidance

### Recommended Exception List Entries

Add these exceptions before enabling to reduce false positives from legitimate operations:

| Scenario | Exception Filter |
|---|---|
| Elastic Agent self-upgrade | `process.name: "elastic-agent.exe" AND process.parent.name: "elastic-agent-service-manager.exe"` |
| Windows Defender engine update | `process.name: "MsMpEng.exe" AND process.parent.name: "MsMpEng.exe"` |
| Fleet-initiated agent reinstall | `process.name: "elastic-agent.exe" AND user.name: "<your_fleet_service_account>"` |
| CrowdStrike sensor update | `process.name: ("falcon-sensor.exe" OR "csfalconservice.exe") AND process.parent.name: "FalconUpdateService.exe"` |
| Scheduled AV scan engine restart | `process.name: "MsMpEng.exe" AND process.exit_code: 0` |

### Threshold Adjustments

- **maxspan**: Default is 10 minutes. If your environment generates high-severity alerts frequently (e.g., due to aggressive detection tuning) and you observe false positives from coincidental process restarts, increase to 15 or 30 minutes. Do not exceed 30 minutes — longer windows dilute the correlation signal.
- **Severity filter**: The first sequence step matches `kibana.alert.severity in ("critical", "high")`. If your agency only wants to fire on critical alerts (highest confidence), change to `kibana.alert.severity == "critical"` and `event.severity in (1)`. This reduces volume at the cost of missing high-severity precursors.
- **Process list expansion**: Add any agency-specific EDR or AV process names. Common additions: `cb.exe` (Carbon Black response component), `SEPAgent.exe` (Symantec), `mcshield.exe` (McAfee/Trellix).

### Enablement Timeline

| Day | Action |
|---|---|
| Day 1–5 | Deploy in `monitor` mode. Review all would-be alerts — do not fire. Build exception list from legitimate process restarts observed. |
| Day 6–10 | Enable rule with exceptions applied. Review all fired alerts with the SOC. |
| Day 11+ | Ongoing: review weekly. Tighten `maxspan` if false positive rate is acceptable. |

---

## Prerequisites

### Required Integrations

| Integration | Minimum Version | Purpose |
|---|---|---|
| Elastic Defend | 8.10+ | Process telemetry (`logs-endpoint.events.process*`) and alert generation (`logs-endpoint.alerts*`) |
| Elastic Security | 8.10+ | Alert routing to `.alerts-security.*` |

### Data Streams That Must Be Flowing

| Data Stream | Required For |
|---|---|
| `logs-endpoint.alerts*` | Triggering endpoint alert (sequence step 1) |
| `.alerts-security.*` | Alternate/newer alert index (sequence step 1 fallback) |
| `logs-endpoint.events.process*` | Process termination event (sequence step 2) |

### Verification

Run the following in Kibana Dev Tools to confirm both required data streams are active:

```json
GET logs-endpoint.events.process*/_count
{
  "query": {"range": {"@timestamp": {"gte": "now-1h"}}}
}

GET .alerts-security.*/_count
{
  "query": {"range": {"@timestamp": {"gte": "now-1h"}}}
}
```

Both should return a `count` greater than 0 on any active deployment. If `logs-endpoint.events.process*` returns 0, verify that the Elastic Defend integration policy has **Process Events** collection enabled (Integration Policy > Windows/Linux events > Process).

### Agent Type Field

The first sequence clause filters on `agent.type == "endpoint"`. Verify your deployment sets this field:

```
GET logs-endpoint.alerts*/_search?size=1
{
  "_source": ["agent.type"],
  "query": {"match_all": {}}
}
```

If `agent.type` is `"elastic_agent"` rather than `"endpoint"` in your environment, update the first sequence clause accordingly.
