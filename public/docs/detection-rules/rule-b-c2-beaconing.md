# M-26-14 Appendix B Category (B): C2 Beaconing — Repeated Outbound to Single External IP on Non-Standard Port

## Overview

This rule detects **command-and-control (C2) beaconing** — a behavioral pattern in which a compromised host makes repeated, periodic outbound connections to a single external IP address on a non-standard port. This pattern is a hallmark of implant-based malware (Cobalt Strike, Metasploit Meterpreter, Sliver, Brute Ratel, etc.) maintaining a heartbeat to an attacker-controlled server.

The rule aggregates all egress network connections within a 30-minute window using ES|QL `STATS`. It fires when a single `(source.ip, destination.ip, destination.port, host.name)` tuple accumulates **20 or more connections** and the observed window spans **at least 25 minutes**. The combination of high connection count and sustained duration distinguishes true beaconing from burst HTTP traffic or software update checks.

**Why this matters for M-26-14 §5(b):** OMB Memorandum M-26-14 Appendix B, Category B requires FCEB agencies to detect and alert on anomalous outbound communication patterns consistent with adversary C2 activity. Failure to detect beaconing enables prolonged dwell time — the longer an attacker maintains C2 access without detection, the greater the blast radius when the incident is eventually discovered.

---

## M-26-14 Reference

**Appendix B, Category B — Command and Control Detection**

> Agencies operating at Element 3, Level 2 maturity (CEM/THIRF) SHALL implement continuous monitoring controls capable of detecting repeated outbound connections from agency-managed assets to external IP addresses on non-standard ports, and SHALL generate alerts when connection frequency or duration is consistent with automated C2 heartbeat behavior. Detected events SHALL be reported to CISA within one hour of confirmation.

**Element:** 3 (Centralized Access — Event Monitoring, Investigation & Response)
**Minimum Level:** 2
**Objectives:** CEM (Continuous Event Monitoring), THIRF (Threat Hunting, Intelligence, and Response Functions)

---

## Rule Details

| Field | Value |
|---|---|
| Rule ID | `m_26_14-appendixb-b-c2-beaconing` |
| Internal UUID | `b3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e` |
| Type | ES\|QL (aggregating) |
| Severity | High |
| Risk Score | 73 |
| Interval | 30 minutes |
| Look-back | `now-31m` |
| Max Signals | 100 per run |
| Enabled by Default | No — requires tuning before activation |
| MITRE Tactic | TA0011 Command and Control |
| MITRE Technique | T1071 Application Layer Protocol |
| MITRE Sub-technique | T1071.001 Web Protocols |

**Indexed Data Sources:**

| Index Pattern | Integration | Description |
|---|---|---|
| `logs-network_traffic.*` | Elastic Network Traffic / Packetbeat | Flow-level connection records |
| `logs-zeek.connection*` | Zeek | Zeek conn.log records via Elastic integration |
| `logs-palo_alto_networks.*` | Palo Alto Networks | PA firewall traffic logs |

**Alert Trigger Conditions:**

- `connection_count >= 20` unique connections from one source to one destination:port
- `beacon_window_minutes >= 25` — connections span at least 25 minutes
- Destination is external (not RFC 1918, loopback, or CGNAT)
- Destination port is not in the standard-services exclusion list

---

## Related Existing Prebuilt Rules

The following Elastic prebuilt rules address overlapping detection goals. Do **not** duplicate these — use them as complementary detections:

| Rule UUID | Name | Relationship |
|---|---|---|
| `5397080f-34e5-449b-8e9c-4c8083d7ccc6` | ML-based Network Beaconing (requires paid ML integration) | Uses unsupervised ML to detect beaconing; higher precision but requires Platinum/Enterprise + ML node. Use alongside this rule for defense in depth. |
| `0ab319ef-92b8-4c7f-989b-5de93c852e93` | ML High-Confidence Beaconing | Higher-threshold variant of the ML rule; lower false positive rate but may miss low-frequency beacons. This rule catches those with simpler threshold logic. |

This rule intentionally uses deterministic ES|QL aggregation rather than ML, ensuring it fires consistently and predictably without ML infrastructure requirements — making it suitable for agencies at lower maturity levels.

---

## Example Scenario

During a threat hunt exercise, the SOC notices that **workstation-05** — assigned to a contractor — has made 47 identical outbound connections to `198.51.100.200:4444` over the past 6 hours. The connections arrive every 7.8 minutes, with a standard deviation of only ±0.3 seconds. The regularity (coefficient of variation < 0.05) is the C2 heartbeat of a Cobalt Strike beacon operating in its default sleep mode.

This rule fired at the **20th connection**, approximately 2.5 hours into the dwell. An alert was generated with `alert_reason = "47 conns from workstation-05 to 198.51.100.200:4444 over 366min"`. The analyst who received the alert was able to:

1. Confirm through threat intelligence that `198.51.100.200` was associated with a known APT infrastructure cluster registered 11 days prior.
2. Pull the Elastic Defend process tree and identify a renamed `rundll32.exe` as the beacon process, loaded via a phishing macro executed 6 hours earlier.
3. Isolate the endpoint via Elastic Defend remote response before lateral movement occurred.

**Without this rule**, the connection would have blended into normal web traffic noise. No standard firewall policy blocked port 4444 egress. The ML beaconing rule had not yet learned a baseline for this new contractor workstation. The static threshold approach provided immediate, reliable detection on first occurrence.

---

## Investigation Guide

When this rule fires, follow these steps in order:

### Step 1: Asset Identification
Look up `host.name` in your asset inventory (CMDB or Elastic asset data). Determine:
- Is this a managed or unmanaged device?
- Who is the assigned user? Is it a privileged account or contractor?
- Is it enrolled in Elastic Defend (check `logs-endpoint.events.*`)?

### Step 2: Destination Reputation
Query your threat intelligence platform (TIP) and open-source feeds for `destination.ip`:
- Check VirusTotal, Shodan, AbuseIPDB, Cisco Talos
- Determine ASN, registration date, and hosting provider
- Has this IP appeared in any other alerts in your environment?

### Step 3: Port Analysis
Review `destination.port` against:
- Your application/firewall exception database — is any legitimate software using this port from this host?
- IANA port assignments — is this a known service port being abused?
- Common C2 ports: 4444 (Metasploit default), 4545, 1337, 8888, 9001 (Tor), 6667 (IRC)

### Step 4: Timing Regularity Analysis
Pull raw connection records for the flagged tuple over 24 hours:

```esql
FROM logs-network_traffic.*
| WHERE source.ip == "<source_ip>" AND destination.ip == "<dest_ip>" AND destination.port == <port>
| SORT @timestamp ASC
| KEEP @timestamp, network.bytes, source.port
```

Calculate inter-arrival times. A coefficient of variation (CV) below 0.1 is strongly indicative of automated C2. Human-driven traffic has CV > 0.5.

### Step 5: Endpoint Triage
If Elastic Defend is deployed, query for suspicious process activity on the host during the beacon window:

```esql
FROM logs-endpoint.events.process*
| WHERE host.name == "<host_name>" AND @timestamp >= "<first_seen>" AND @timestamp <= "<last_seen>"
| WHERE process.parent.name IN ("winword.exe","excel.exe","powerpnt.exe","outlook.exe","wscript.exe","cscript.exe","mshta.exe")
| KEEP @timestamp, process.name, process.executable, process.args, process.parent.name, user.name
```

Also check `logs-endpoint.alerts*` for any concurrent EDR alerts on the same host.

### Step 6: Network Traffic Deep-Dive
If a PCAP or NetFlow sensor is available:
- Examine payload sizes for consistency (C2 heartbeats often have near-identical payload sizes)
- Check TLS certificate details if the connection is encrypted — look for self-signed certs or unusual CN values
- Compare connection timing to business hours — does beaconing continue after-hours (likely automated)?

### Step 7: Lateral Movement Assessment
Check whether the host has made unusual internal connections during the beacon window:

```esql
FROM logs-network_traffic.*
| WHERE source.ip == "<source_ip>" AND CIDR_MATCH(destination.ip,"10.0.0.0/8","172.16.0.0/12","192.168.0.0/16")
| WHERE @timestamp >= "<first_seen>"
| STATS conn_count=COUNT(*) BY destination.ip, destination.port
| WHERE conn_count > 5
| SORT conn_count DESC
```

### Step 8: Containment Decision
If two or more indicators are confirmed (suspicious destination, non-standard port, timing regularity, suspicious process):
- Isolate the endpoint via Elastic Defend: `POST /api/endpoint/endpoints/<endpoint_id>/response/isolate`
- Notify the asset owner and their manager
- Open a P1 incident ticket

### Step 9: Evidence Preservation
Before any remediation:
- Capture a memory dump via Elastic Defend or a forensic tool
- Preserve all network logs for the dwell period (from `first_seen` to isolation)
- Document all timestamps precisely for dwell time calculation

### Step 10: CISA Notification
Per M-26-14 §5(b), FCEB agencies must notify CISA within **1 hour of confirmed C2 activity**. Use the CISA reporting portal or the agency's designated CISA liaison. Include:
- Affected asset(s) and user(s)
- Confirmed or suspected threat actor
- Dwell time estimate
- Actions taken

---

## Tuning Guidance

### Phase 1: Observation (Weeks 1-2)
Enable the rule in **shadow mode** (or leave `enabled: false`) and run the ES|QL query manually against your data. Review the results for:
- Monitoring tools or agents that beacon to cloud endpoints (e.g., Elastic Agent itself, endpoint protection software)
- Video conferencing software using non-standard ports
- Custom internal applications with unusual connection patterns

### Phase 2: Exception List Population
Add exceptions for known-good patterns before enabling. Use Kibana's exception list feature:

| Pattern | Exception Approach |
|---|---|
| Elastic Agent heartbeats to fleet server | Exclude `destination.ip` = fleet server IP range |
| Cloud monitoring agents (Datadog, Splunk UF) | Exclude by `source.ip` matching monitoring subnets |
| VPN keepalives | Exclude `destination.port` used by your VPN concentrator |
| Specific trusted CDN/SaaS IPs | Add to CIDR exclusion in query, or use exception list |

### Phase 3: Threshold Adjustment
The default threshold of 20 connections over 25 minutes catches beacons with intervals up to 75 seconds. If your environment produces false positives at this threshold:
- Raise `connection_count` to 30 or 40 for higher precision
- Raise `beacon_window_minutes` to 30 or 45 to require longer sustained beaconing
- Do **not** lower the threshold below 15 without expanding the exclusion lists significantly

### Phase 4: Enablement
Enable the rule after at least one week of clean observation. Set `enabled: true` via the Kibana Detection Rules API or UI. Assign to the SOC alert queue.

### Recommended Exclusion List Entries (Kibana format)

```json
[
  {"field": "destination.ip", "operator": "is in list", "list": {"id": "trusted-monitoring-endpoints", "type": "ip"}},
  {"field": "host.name", "operator": "is in list", "list": {"id": "network-monitoring-sensors", "type": "keyword"}}
]
```

---

## Prerequisites

### Required Integrations

At least **one** of the following must be actively collecting and indexing data:

| Integration | Index Pattern | Minimum Config |
|---|---|---|
| Elastic Network Traffic (Packetbeat) | `logs-network_traffic.*` | Deploy on network tap/span. Must populate `network.direction`, `source.ip`, `destination.ip`, `destination.port`. |
| Zeek | `logs-zeek.connection*` | Zeek sensor on egress path. Elastic Zeek integration v1.9+. |
| Palo Alto Networks | `logs-palo_alto_networks.*` | PA syslog to Elastic Agent. Traffic logs enabled on all egress security policies. |

### Data Quality Requirements

- `network.direction` must be `egress` (not `outbound` — verify your integration's ECS mapping)
- `host.name` must be populated (not null) for aggregation to produce useful alerts
- `@timestamp` must reflect actual event time, not ingest time — ensure NTP synchronization on sensors
- No gaps longer than 5 minutes in log flow during business hours (gaps cause under-counting in the 30m window)
- RFC 1918 CIDRs in the query must cover your actual internal address space — update if you use non-standard internal ranges

### Elastic Stack Requirements

- Elasticsearch 8.16+ or 9.x (ES|QL `DATE_DIFF`, `CIDR_MATCH`, `STATS BY` required)
- Kibana Security — Detection Engine enabled
- Enterprise subscription (for ES|QL detection rules and exception lists)
- Sufficient index lifecycle management to retain `logs-network_traffic.*` for at least 30 days (for investigation look-back)
