# M-26-14 Appendix B Category (D): Privilege Escalation Sequence — New Account Created Then Immediately Used

## Overview

This rule detects a two-event sequence that is a strong indicator of adversary persistence and privilege abuse: a new user account is created (IAM event), and within one hour, that same account successfully authenticates to a system. The EQL `sequence` engine correlates these two events by the account name — joining `user.target.name` in the creation event to `user.name` in the authentication event.

Standalone "account created" alerts are common and often buried in alert queues. What distinguishes an attacker's behavior is the immediate use of that account. An APT operator or insider threat creating a backdoor account almost always validates it quickly before moving on to the next stage of the attack. This rule surfaces that timing correlation at high severity, pulling the event pair out of the noise.

**Why it matters for M-26-14 §5(d):** OMB Memorandum M-26-14 requires agencies operating High-Value Assets (HVAs) to implement Continuous Endpoint Monitoring (CEM) and Threat Hunting and Incident Response Framework (THIRF) capabilities. Section 5(d) specifically calls for detection of unauthorized account creation and privileged identity abuse on HVA systems. A dormant-then-active account sequence directly satisfies the behavioral detection requirement at Maturity Level 2 (Element 3).

---

## M-26-14 Reference

**Appendix B, Category D — Privileged Account and Identity Abuse**

> Agencies shall implement controls to detect the creation of unauthorized user accounts on High-Value Assets and correlate account creation events with subsequent authentication activity. Detection capabilities must identify accounts created outside of approved provisioning workflows, particularly those used for interactive or network logon within a compressed time window following creation. Findings must be surfaced through automated alerting to the agency SOC within the interval defined by the agency's CEM implementation plan, not to exceed the continuous monitoring cadence established under §5.

**Element 3, Minimum Level 2 Objectives:**
- **CEM (Continuous Endpoint Monitoring):** Automated detection of IAM lifecycle anomalies on HVA endpoints.
- **THIRF (Threat Hunting and Incident Response Framework):** Correlated, sequence-based detections that enable analysts to reconstruct adversary tradecraft from a single alert.

---

## Rule Details

| Field | Value |
|---|---|
| Rule ID | `m2614-appendixb-d-privilege-escalation-sequence` |
| Internal UUID | `d4e7f3a2-8b1c-4e5d-9f6a-2c3b7e8d1a4f` |
| Type | `eql` (sequence) |
| Severity | High |
| Risk Score | 73 |
| Interval | 5 minutes |
| From | now-6m |
| Max Signals | 100 |
| Enabled (default) | false (enable after tuning) |
| Indexes | `logs-windows.security*`, `logs-auditd.*` |
| Max Sequence Span | 1 hour |

**MITRE ATT&CK Coverage:**

| Tactic | Technique | Subtechnique |
|---|---|---|
| TA0003 Persistence | T1136 Create Account | T1136.001 Local Account |
| TA0004 Privilege Escalation | T1078 Valid Accounts | T1078.002 Domain Accounts |

**EQL Query:**

```eql
sequence with maxspan=1h
  [iam where event.type == "user" and event.action in ("added-user-account", "user-account-created") and user.target.name != null] by user.target.name
  [authentication where event.outcome == "success" and winlog.event_id in (4624, 4648)] by user.name
```

The `by` clause in each event filter is the correlation key. EQL matches the value of `user.target.name` in the first event to `user.name` in the second event — these are different ECS fields pointing to the same identity.

---

## Related Existing Prebuilt Rules

These Elastic prebuilt rules cover overlapping signals. Do **not** duplicate them. Reference them in your exception-tuning workflow and suppress lower-severity standalone alerts when this sequence rule fires.

| Rule UUID | Rule Name | Relationship |
|---|---|---|
| `1aa9181a-492b-4c01-8b16-fa0735786b2b` | User Account Creation | Fires on the first event in this sequence (account creation only). Lower severity, no auth correlation. Use to audit provisioning volume; suppress when this sequence rule fires. |
| `5cd8e1f7-0050-4afc-b2df-904e40b2f5ae` | User Added to Privileged Group | Fires if the created account is immediately added to a privileged group (e.g., Domain Admins). Complementary signal — if both fire within minutes, escalate to P1. |

---

## Example Scenario

It is 3:12 AM on a Tuesday. An APT operator who compromised a Domain Admin account six hours earlier executes a single PowerShell command on the domain controller `dc-01`:

```powershell
net user svc_backup_temp P@ssw0rd99! /add /domain
```

Windows Security logs event ID 4720 — account created. The Elastic Windows integration ships this to Elasticsearch within seconds. The standalone prebuilt rule `1aa9181a` fires, generating a medium-severity alert. It lands in the SOC queue alongside 40 other account management alerts from the overnight provisioning window. An analyst acknowledges it without escalating — the account name looks like a service account, and there are no other indicators yet.

Thirty-seven minutes later, at 3:49 AM, the operator authenticates to `fileserver-02` — a Windows file server containing classified acquisition documents — using the `svc_backup_temp` account over SMB (Logon Type 3, event ID 4624).

The EQL sequence engine matches these two events by account name across the 37-minute window. The sequence rule `m2614-appendixb-d-privilege-escalation-sequence` fires at **high severity, risk score 73**, presenting both events together in a single alert. The analyst immediately sees: account created at 3:12 by a Domain Admin account, first use at 3:49 on a classified file server. The context that was invisible in two separate alerts is now the headline of one.

The analyst disables the account, isolates `fileserver-02`, resets the compromised Domain Admin credentials, and opens a THIRF incident within 11 minutes of alert generation.

---

## Investigation Guide

When this rule fires, execute the following steps in order.

### Step 1 — Confirm the sequence

Open the alert and expand both matched events. Verify:
- Event 1: `event.category = iam`, `event.action = added-user-account`, `winlog.event_id = 4720`
- Event 2: `event.category = authentication`, `event.outcome = success`, `winlog.event_id = 4624` or `4648`
- Both reference the same account name

Note the timestamps and the two `host.name` values.

### Step 2 — Identify who created the account

From event 1, examine `user.name` (the creator) and `winlog.event_id = 4720`. Query:

```kql
event.category: iam AND winlog.event_id: 4720 AND user.target.name: "<new_account>"
```

Is the creator account a service account, a human admin, or SYSTEM? Was this a scheduled task or interactive session?

### Step 3 — Characterize the authentication

From event 2, examine:
- `host.name` — what system was accessed? Is it an HVA?
- `winlog.logon.type` — Type 3 (Network/SMB), Type 10 (RDP), Type 2 (Console)
- `source.ip` — where did the logon originate?

### Step 4 — Trace post-authentication activity

Pivot from the destination host and account name to find what happened next:

```kql
host.name: "<destination_host>" AND user.name: "<new_account>" AND @timestamp > [auth_event_timestamp]
```

Look for: file access events (`event.category: file`), process creation (`event.category: process`), network connections (`event.category: network`), and further authentication to additional hosts.

### Step 5 — Check account current state

Via AD tooling or Kibana Osquery runner:

```sql
SELECT * FROM users WHERE username = '<new_account>';
```

Is the account still active? Has it been added to any groups since creation? Check for event ID 4728 (added to global security group) or 4732 (added to local admin group).

### Step 6 — Assess blast radius

If post-authentication activity touched sensitive files or systems, escalate immediately. Preserve:
- Windows Security event logs from both `host.name` values (before log rotation)
- Memory image of the destination host if active exploitation is suspected
- NetFlow/Zeek records for the source IP

### Step 7 — Containment and escalation

- Disable the account in Active Directory immediately
- Isolate the destination host from the network if data exfiltration is possible
- Reset credentials for the creator account
- Open a THIRF incident ticket with the two event IDs, host names, account name, and source IP
- Notify the agency ISSO and HVA system owner within the THIRF-mandated timeframe

---

## Tuning Guidance

### Before enabling

Run the rule in **Preview** mode for 5 business days. Collect all preview matches and categorize each as true positive or false positive.

### Common false positive sources and mitigations

**1. Automated provisioning systems (SailPoint, ServiceNow, Saviynt)**

These systems create accounts and immediately verify them via a test login. Add an exception by creator account name:

```
Exception field: user.name (IAM event)
Operator: is one of
Values: svc-sailpoint-provisioner, svc-servicenow-itsm, ...
```

**2. Help desk technicians**

Tier-2 staff who create accounts and immediately confirm login via a test credential. Add by department group membership or user.name prefix.

**3. Automated test harnesses**

CI/CD pipelines that spin up test AD accounts. Scope exceptions to test index patterns or add `host.name` exceptions for build servers.

### Threshold adjustments

The default `maxspan=1h` is intentionally wide to catch slow operators. For a lower false-positive environment, consider narrowing to `maxspan=30m` after the initial tuning window.

### Recommended exception list structure

```yaml
# Exception for provisioning automation
- field: user.name   # creator of the account in IAM event
  operator: is_one_of
  values:
    - svc-sailpoint-provisioner
    - svc-servicenow-itsm-bot

# Exception for known build/test hosts
- field: host.name
  operator: is_one_of
  values:
    - build-server-01
    - test-dc-lab
```

### Timeline for enablement

| Day | Action |
|---|---|
| D+0 | Deploy in preview mode |
| D+1 to D+5 | Collect preview matches, categorize FPs |
| D+6 | Add exception list entries for confirmed FPs |
| D+7 | Enable rule with exceptions |
| D+30 | Review alert volume, adjust maxspan if needed |

---

## Prerequisites

### Required integrations

| Integration | Data Stream | Minimum Version |
|---|---|---|
| Elastic Windows | `logs-windows.security*` | 2.0.0 |
| Elastic Auditd (Linux, optional) | `logs-auditd.*` | 3.0.0 |

### Required Windows Audit Policy settings

Enable via GPO: `Computer Configuration > Windows Settings > Security Settings > Advanced Audit Policy Configuration`

| Subcategory | Setting |
|---|---|
| Audit Account Management > User Account Management | Success, Failure |
| Audit Logon/Logoff > Audit Logon | Success, Failure |

### Validation query

Run this in Dev Tools to confirm both event categories are present before enabling:

```
GET logs-windows.security*/_count
{
  "query": {
    "bool": {
      "should": [
        {"term": {"event.category": "iam"}},
        {"term": {"event.category": "authentication"}}
      ]
    }
  }
}
```

Both counts should be non-zero. If `iam` count is zero, verify the Windows integration's event ID collection includes 4720.

### HVA scope

For maximum M-26-14 compliance value, ensure the Windows integration is deployed on:
- All Domain Controllers
- All file servers designated as HVAs
- All privileged access workstations (PAWs)
- All jump hosts and bastion servers
