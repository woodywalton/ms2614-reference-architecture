# M-26-14 Appendix B Category (E): Rogue Device — First-Seen Fleet Enrollment

## Overview

This rule detects the first time a `host.name` value appears in Elastic Fleet enrollment events across `logs-elastic_agent.*` and `logs-fleet_server.*`. Because it uses the Kibana **new_terms** rule type, it fires exactly once when a host enrolls that has not been seen in the trailing 7-day history window — making it a reliable, low-noise signal for unauthorized device enrollment.

**Why this matters for M-26-14 §5(e):** OMB Memorandum M-26-14 Appendix B requires federal agencies to log and detect *infrastructure changes*, including the introduction of new endpoints to the managed environment. An unauthorized laptop, embedded device, or compromised asset that enrolls into Fleet bypasses standard change-management controls. This rule surfaces that event within the hour, enabling analysts to correlate against the agency's Hardware Asset Management (HWAM) inventory before the device has an opportunity to exfiltrate data or establish persistence.

---

## M-26-14 Reference

**Appendix B, §5(e) — Infrastructure Changes**

> Agencies shall ensure that logs capture changes to infrastructure including but not limited to: enrollment of new endpoints, modification of system configurations, deployment of new services, and changes to network topology. Infrastructure change logs shall be retained at the applicable maturity level and made available for centralized analysis.

This rule directly addresses the "enrollment of new endpoints" sub-requirement at **Element 3, Level 2** of the maturity model, contributing to the **Comprehensive Event Management (CEM)** and **Threat Hunting, Incident Response, and Forensics (THIRF)** objectives.

---

## Rule Details

| Field | Value |
|---|---|
| **Rule ID** | `m_26_14-appendixb-e-rogue-device-fleet-enrollment` |
| **Type** | `new_terms` |
| **Severity** | High |
| **Risk Score** | 65 |
| **Interval** | 1 hour |
| **From** | `now-61m` |
| **History Window** | `now-7d` (tunable to `now-30d`) |
| **New Terms Field** | `host.name` |
| **KQL Query** | `event.category: "host" and event.type: "start" and agent.id: *` |
| **Indexes** | `logs-elastic_agent.*`, `logs-fleet_server.*` |
| **MITRE Tactic** | TA0001 — Initial Access |
| **MITRE Technique** | T1200 — Hardware Additions |
| **M-26-14 Category** | (E) Infrastructure Changes |
| **M-26-14 Element** | 3 |
| **Minimum Level** | 2 |
| **Objectives** | CEM, THIRF |
| **Enabled by default** | No — agencies enable after tuning |

---

## Related Existing Prebuilt Rules

The following Elastic prebuilt rules address adjacent threat scenarios and should be reviewed alongside this rule. Do not duplicate their logic — instead configure them as part of the broader detection layering strategy.

| Rule ID | Name | Relationship |
|---|---|---|
| `0859355c-0f08-4b43-8ff5-7d2a4789fc08` | First Time Seen Removable Device (USB) | Detects first-seen USB storage devices via Elastic Defend. Complements this rule by catching hardware additions at the OS device-driver layer rather than the Fleet enrollment layer. Together they cover both agent-enrolled devices and passive hardware insertions. |

---

## Example Scenario

At 2:30 AM on a Friday, an unknown Windows laptop running a custom-installed Elastic Agent connects to an unmanaged network port in a government building conference room. A contractor who visited that afternoon had left the device behind intentionally. Within the next Fleet enrollment cycle — just under an hour — the `new_terms` rule fires. The alert shows `host.name: rogue-workstation-99` with `agent.id: agent-rogue-001` and `host.ip: 10.47.22.199`.

The on-call SOC analyst receives the high-severity alert, queries the WS3 HWAM asset inventory, and finds no matching MAC address (`AA:BB:CC:DD:EE:FF`) or serial number in the authorized hardware list. Network switch telemetry identifies the physical port in conference room 4B, building 3. Physical security is dispatched at 3:15 AM and the device is disconnected and taken into custody before it transmits any data beyond the initial enrollment handshake.

The subsequent forensic examination reveals that the device's serial number matches a laptop reported stolen from a partner agency three months prior. The contractor is identified through badge-access records and referred for further investigation.

This scenario illustrates the criticality of sub-hour detection for hardware additions — a multi-day detection gap would have allowed the device to complete exfiltration or establish a persistent backdoor.

---

## Investigation Guide

When this rule fires, follow this analyst playbook in order.

### Step 1 — Identify the device

Run the following queries against the alert's source document fields:

- `host.name` — the newly enrolled hostname
- `host.ip` — IP address at time of enrollment
- `host.mac` — MAC address (if present)
- `agent.id` — unique Fleet agent identifier
- `agent.version` — Elastic Agent build number
- `host.os.name` / `host.os.version` — OS fingerprint

### Step 2 — Cross-reference authorized hardware inventory

Query the agency HWAM data sources:

```
GET /m_26_14-osquery-hardware-inventory-*/_search
{
  "query": {
    "bool": {
      "should": [
        { "term": { "host.mac": "<mac-from-alert>" } },
        { "term": { "host.serial_number": "<serial-from-alert>" } },
        { "term": { "host.name": "<hostname-from-alert>" } }
      ]
    }
  }
}
```

If CDM HWAM integration is active, also query `m_26_14-hwam_assets-*`.

**If no match is found**: treat as unauthorized pending further investigation. Do not dismiss.

### Step 3 — Locate the device on the network

Query network flow or firewall logs to determine the network port and VLAN:

- Search `logs-network_traffic.*` or `logs-palo_alto_networks.*` for the source IP
- Identify the upstream router/switch by BGP or SNMP data
- Cross-reference port with physical floor maps if available
- For wireless devices, check RADIUS / 802.1X logs for the connecting access point

### Step 4 — Assess post-enrollment activity

Check what the device did after enrollment within the alert's time window:

- **Authentication attempts**: `logs-system.auth*`, `logs-windows.security*` — did the device attempt domain logins?
- **Process executions**: `logs-endpoint.events.process*` — are any suspicious executables running?
- **Network connections**: `logs-network_traffic.*` — did the device initiate connections to external IPs?
- **DNS queries**: did the device resolve any unusual domains?
- **File system activity**: `logs-endpoint.events.file*` — any file creation or staging behavior?

### Step 5 — Escalate or close

**If the device is authorized but missing from inventory:**
1. Add the device to the HWAM/SWAM inventory immediately.
2. Create an exception list entry in this rule (match on `host.name` or `agent.id`).
3. Document the gap as a finding in the Agency Logging Plan audit trail.
4. Trigger a change-management review to understand why enrollment was not pre-approved.

**If the device is unauthorized:**
1. Escalate immediately to the Incident Response team.
2. Request network isolation of the switch port or VLAN.
3. Preserve the Fleet enrollment log entry as evidence (`agent.id`, `host.name`, `@timestamp`).
4. Capture a forensic image of the device if physically accessible.
5. Open an incident ticket with the alert details and all corroborating evidence.
6. Notify CISA per M-26-14 §4 incident reporting requirements if warranted.

---

## Tuning Guidance

### Exception list entries to add

After initial deployment, review alerts for the first 7–30 days and add exceptions for legitimate patterns:

| Scenario | Exception Field | Value Pattern |
|---|---|---|
| CI/CD pipeline ephemeral agents | `agent.id` | Enumerate known build-agent IDs |
| DR test systems that re-enroll periodically | `host.name` | Prefix match on DR hostnames, e.g., `dr-*` |
| Contractor-managed devices under approved policy | `host.name` | Specific approved contractor device names |
| Known bulk enrollment events (imaging lab) | `source.ip` | CIDR of the imaging network subnet |

Use the Kibana Exception List UI under **Security > Rules > [this rule] > Exceptions** to add entries. Prefer narrow exceptions (specific `host.name` or `agent.id`) over broad suppression.

### History window adjustment

The default `history_window_start: "now-7d"` is intentionally short to maximize sensitivity during initial deployment. After the environment is baselined:

1. **Week 1–4**: Keep at `now-7d`. Expect alerts for any host not seen in a rolling week (including re-imaged hosts).
2. **Month 2+**: Tune to `now-30d` to reduce noise from hosts that enroll monthly (e.g., monthly DR tests, infrequent remote workers).
3. **Steady state**: `now-30d` is the recommended long-term setting. Only increase to `now-90d` in environments where some authorized hosts are known to enroll very infrequently.

To update the history window, edit the rule in Kibana Security > Rules and change the **History window start** field.

### Interval tuning

The default 1-hour interval provides sub-60-minute detection. For higher-sensitivity environments (e.g., classified networks, data center floors), reduce to `5m` interval with `from: "now-6m"`. This increases rule execution frequency but does not increase alert volume for well-tuned environments.

### Timeline for enablement

| Phase | Action |
|---|---|
| Day 0 (import) | Rule imported, `enabled: false`. Review rule details and confirm prerequisites. |
| Day 1–3 | Run rule in **preview mode** (not enabled). Review what would have fired in the last 7 days against your environment. |
| Day 4–7 | Enable rule. Monitor alert queue. Add exceptions for known-good patterns. |
| Day 8–30 | Tune history window to `now-14d` or `now-30d` based on observed enrollment cadence. |
| Day 31+ | Steady-state operation. Review exception list quarterly. |

---

## Prerequisites

### Required integrations

| Integration | Version | Purpose |
|---|---|---|
| Elastic Agent (Fleet-managed) | 8.14+ | Generates enrollment events in `logs-elastic_agent.*` |
| Fleet Server | 8.14+ | Generates enrollment records in `logs-fleet_server.*` |

### Required data streams

Both of the following data streams must be actively receiving data before this rule is enabled:

- `logs-elastic_agent.*` — verify with: `GET /logs-elastic_agent.*/_count`
- `logs-fleet_server.*` — verify with: `GET /logs-fleet_server.*/_count`

If either returns a count of 0, Fleet is not generating enrollment data. Check:
1. Fleet Server connectivity and certificates
2. Elastic Agent policy enrollment settings
3. `logs-elastic_agent` integration is included in the active agent policy

### Recommended complementary integrations

| Integration | Purpose |
|---|---|
| Elastic Defend | Provides `logs-endpoint.events.*` for post-enrollment process and file activity investigation |
| Network Packet Capture (Packetbeat) or Palo Alto Networks | Provides network flow data for physical location investigation |
| WS3 Osquery Asset Inventory Pack | Hardware inventory cross-reference during triage |
| WS2 CDM HWAM Integration | Authoritative hardware asset register for HWAM cross-reference |

### Kibana Security privileges

The user enabling and managing this rule requires:
- `Security: All` or `Security: Read` + rule management privileges
- `index_read` on `logs-elastic_agent.*` and `logs-fleet_server.*` for rule preview

### License requirement

`new_terms` rule type requires **Kibana Security** (included in Elastic Enterprise subscription, which is required for full M-26-14 compliance pack functionality).
