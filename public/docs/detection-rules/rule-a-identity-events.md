# M-26-14 Appendix B Category (A): Identity Events — Platform-Specific Auth Failure Sequences

## Overview

This detection rule set surfaces credential stuffing and password spray attacks across the four primary identity platforms used by federal agencies: Windows Active Directory, Okta, Azure Active Directory / Entra ID, and Linux SSH. Each rule watches for the same behavioral signature — multiple authentication failures for a single user followed by a successful login — adapted to the field schemas and event structures of each platform.

The "failures then success" pattern is the defining indicator of a successful credential stuffing attack. Unlike pure brute force (which typically never succeeds), credential stuffing uses previously-leaked username/password pairs and succeeds on the first credential that matches. Detection must happen within seconds-to-minutes of the success event to enable containment before the attacker achieves their objective inside the environment.

These rules directly satisfy **M-26-14 §5(a)** which requires agencies to implement continuous monitoring of identity and authentication systems as part of their Cyber Event Management (CEM) and Threat-Informed Response Framework (THIRF) capabilities.

---

## M-26-14 Reference

**Appendix B, Category A — Identity Events, §5(a):**

> Agencies shall implement automated detection of anomalous authentication patterns on all agency-managed and cloud-hosted identity systems. At minimum, agencies must detect and generate alerts for authentication failure sequences that precede successful authentication from the same source, consistent with credential stuffing and brute-force attack patterns. Detection must cover all identity providers in use, including on-premises Active Directory, cloud identity platforms (Okta, Azure Active Directory), and SSH-based access to agency systems. Alerts must be forwarded to the agency Security Operations Center (SOC) within the timeframe required by the agency's Continuous Diagnostic and Mitigation (CDM) program.

**Compliance Mapping:**
- Element 3 — Continuous Monitoring
- Minimum Level 2 — Automated detection with alert generation
- Objectives: CEM (Cyber Event Management), THIRF (Threat-Informed Response Framework)
- MITRE ATT&CK: T1110.003 — Password Spraying

---

## Rule Details

| Field | Windows (EQL) | Okta (EQL) | Azure/Entra (ES\|QL) | Linux SSH (ES\|QL) |
|---|---|---|---|---|
| **Rule ID** | `m2614-appendixb-a-windows-credential-stuffing` | `m2614-appendixb-a-okta-credential-stuffing` | `m2614-appendixb-a-azure-credential-stuffing` | `m2614-appendixb-a-linux-ssh-credential-stuffing` |
| **Type** | EQL sequence | EQL sequence | ES\|QL aggregation | ES\|QL aggregation |
| **Severity** | High | High | High | High |
| **Risk Score** | 73 | 73 | 73 | 65 |
| **Interval** | 5m | 5m | 1h | 5m |
| **Lookback** | now-6m | now-6m | now-66m | now-6m |
| **Failure Threshold** | 5 within 10m maxspan | 5 within 10m maxspan | 5 in window | 10 in window |
| **Index Pattern** | `logs-system.security*`, `logs-windows.forwarded*`, `winlogbeat-*` | `logs-okta.*` | `logs-azure.signinlogs*` | `logs-system.auth*` |
| **MITRE Tactic** | Credential Access (TA0006) | Credential Access (TA0006) | Credential Access (TA0006) | Credential Access (TA0006) |
| **MITRE Technique** | T1110.003 Password Spraying | T1110.003 Password Spraying | T1110.003 Password Spraying | T1110.003 Password Spraying |
| **Key Event IDs** | 4625, 4771 (fail), 4624, 4648 (success) | `event.outcome` field | `event.outcome` field | PAM `event.outcome` field |

---

## Related Existing Prebuilt Rules

These Elastic Security prebuilt rules provide related detection coverage. The M-26-14 custom rules **do not duplicate** these — they add M-26-14-specific thresholds, tagging, compliance metadata, and the "failure-then-success" correlated sequence pattern.

| Rule UUID | Rule Name | Relationship |
|---|---|---|
| `4e85dc8a-3e41-40d8-bc28-91af7ac6cf60` | Windows Logon Brute Force (Prebuilt) | Covers repeated 4625 failures but does not require the subsequent success event. M-26-14 rule adds the correlated success detection and compliance metadata. |
| `42bf698b-4738-445b-8231-c834ddefd8a0` | Okta Brute Force or Password Spraying Attack (Prebuilt) | Detects Okta failure bursts but uses a simple threshold without requiring the subsequent success event. M-26-14 rule adds the sequence correlation. |
| `cca64114-fb8b-11ef-86e2-f661ea17fbce` | Azure Active Directory High Risk Sign-in (Prebuilt) | Leverages Microsoft's built-in risk scoring rather than raw failure counting. Complementary coverage — both rules should be enabled. M-26-14 rule fires even when Microsoft's risk engine has not yet scored the event. |

**Recommendation:** Enable all three prebuilt rules alongside the M-26-14 custom rules. The prebuilt rules catch pure failure bursts (without the success); the M-26-14 rules catch the confirmed compromise pattern (failure then success).

---

## Example Scenario

**Date/Time:** 2026-05-30, 02:17 AM EST  
**Affected User:** `jsmith` (Senior IT Administrator, classified endpoint: HIGH sensitivity per WS3 asset inventory)  
**Source IP:** `198.51.100.10` — registered to a VPS provider in Romania; no prior appearance in agency authentication logs

At 02:10 AM, `198.51.100.10` begins submitting Windows authentication requests against domain controller `dc-01` for user `jsmith`. The requests arrive at approximately 90-second intervals — a pace consistent with automated credential stuffing tooling rather than manual entry.

By 02:16 AM, seven failed attempts have been recorded (Event IDs 4625 and 4771, indicating both local logon and Kerberos pre-authentication failures). The M-26-14 rule fires at the 5th failure within its 10-minute maxspan window.

At 02:17:33 AM, a successful logon event (Event ID 4624, Logon Type 3 — Network) is recorded for `jsmith` from the same IP. The EQL sequence rule fires immediately, generating a high-severity alert.

The agency SOC receives the alert at 02:17 AM. The on-call analyst opens the auto-created Jira case and immediately sees:

1. The WS3 asset inventory context showing `jsmith`'s workstation is classified as a "high-sensitivity" endpoint.
2. No prior authentication events from Romanian IP space in the past 90 days.
3. The 7-failure, 1-success sequence spanning 7 minutes and 33 seconds.

The analyst escalates to the CISO at 02:18 AM. The account `jsmith` is suspended in Active Directory at 02:19 AM — 102 seconds after the successful logon event was recorded. The source IP is added to the perimeter block list. A forensic investigation is initiated for all activity performed under the authenticated session between 02:17 AM and 02:19 AM.

Post-incident review confirms the attacker used credentials from a 2025 dark web credential dump and successfully authenticated but did not exfiltrate data due to the rapid containment response enabled by this detection rule.

---

## Investigation Guide

### Immediate Actions (First 5 Minutes)

1. **Identify source IP** — Look at `source.ip` in the alert. Run it against:
   - Agency threat intelligence feeds
   - ASN/geolocation lookup (is it a VPS provider, Tor exit node, or known bad actor ASN?)
   - Prior authentication history for this IP in the environment (last 30/90 days)

2. **Identify the user account** — Look at `user.name`. Determine:
   - Is this account privileged (Domain Admin, Service Account, PAM-managed)?
   - What endpoints does this account normally authenticate from? (query WS3 asset inventory)
   - Is the user currently on shift / expected to be active at this time?

3. **Verify the success event** — Confirm the authentication actually succeeded:
   - For Windows: check `winlog.event_id` (4624 = success). Note Logon Type — Type 3 (Network) from an external IP is highest concern.
   - For Okta: check `okta.outcome.result == "SUCCESS"` and whether MFA was satisfied (`okta.authentication_context.authentication_step`).
   - For Azure: check `azure.signinlogs.properties.status.error_code == 0` and `conditional_access_status`.
   - For Linux SSH: verify the sshd accept log entry confirms session establishment.

4. **Contact the user** — Out-of-band verification (phone or in-person) to confirm whether they initiated the login. If unreachable or they deny it, treat as confirmed compromise.

### Containment Actions (Minutes 5-15)

5. **Suspend the account** — Disable in Active Directory, Okta, and/or Azure AD immediately. Do not wait for confirmation.

6. **Revoke active sessions** — For Okta: trigger Universal Logout. For Azure: revoke refresh tokens via `Revoke-AzureADUserAllRefreshToken`. For Linux: kill active SSH sessions (`pkill -u username sshd`).

7. **Block the source IP** — At the perimeter firewall and/or cloud WAF/identity provider IP restriction.

8. **Preserve evidence** — Do not wipe logs. Capture: full authentication log sequence, network flow records for the source IP, and endpoint process activity if the account logged into an endpoint.

### Deep Investigation (Hours 1-4)

9. **Timeline the authenticated session** — What did the attacker do after logging in? Search:
   - Process execution events (`logs-endpoint.events.process*`) on affected hosts
   - File access events (`logs-endpoint.events.file*`) for sensitive file access
   - Email forwarding rule changes (for cloud email platforms)
   - Admin console activity (Azure audit logs, Okta System Log admin events)

10. **Lateral movement check** — Search for new authentication events from the compromised account or host post-breach, especially to other high-sensitivity systems.

11. **Credential exposure assessment** — Determine whether the compromised password was used across other agency systems (password reuse) and force a reset for all shared credentials.

12. **IOC extraction** — Document: source IP, user agent strings, timing patterns, and any tools/commands observed. Share with agency threat intelligence team.

---

## Tuning Guidance

### Exception List Entries to Add Before Enabling

Add the following as **exception list** entries in Kibana to suppress known-good failure patterns:

| Field | Value | Reason |
|---|---|---|
| `user.name` | Service account names (e.g., `svc-backup`, `svc-monitor`) | Automated services may fail authentication periodically |
| `source.ip` | Internal monitoring IP ranges | Security scanners and vulnerability management tools generate auth failures |
| `source.ip` | Agency VPN gateway IPs | VPN pre-auth probes can appear as failures before success |
| `user.name` | `ANONYMOUS LOGON` | Windows null session attempts are noise |
| `host.name` | Honeypot/canary hosts | These may have intentionally high failure counts |

### Threshold Adjustments

- **Windows:** The 5-failure-within-10-minute maxspan is appropriate for most agencies. If your environment has legacy NTLM applications that retry aggressively, consider raising to 8.
- **Okta:** 5 failures is a good starting point. Agencies with delegated authentication to Active Directory (Okta as a pass-through) may see higher failure rates during AD password sync delays — monitor for false positives in the first week.
- **Azure/Entra:** The 1-hour aggregation window aligns with Entra ID's default risk evaluation period. Agencies with 15-minute token lifetimes may want to reduce to 30 minutes.
- **Linux SSH:** The 10-failure threshold accounts for SSH client retry behavior. Internet-facing hosts may see automated scanning at very high rates — consider adding `source.ip` CIDR exceptions for known scanners or raising the threshold to 20 for SSH honeypots.

### Enablement Timeline

| Phase | Action | Timeline |
|---|---|---|
| Week 1 | Deploy rules in disabled state, review sample events against exception criteria | Days 1-7 |
| Week 2 | Enable in alert-only mode (no auto-actions), review daily for false positives | Days 8-14 |
| Week 3 | Tune thresholds based on observed FP rate, add exception entries | Days 15-21 |
| Week 4 | Enable with automated SOC notification (email/Jira action) | Day 22+ |
| Month 2 | Review for drift, adjust thresholds for seasonal patterns (e.g., password reset cycles) | Ongoing |

---

## Prerequisites

### Required Integrations

| Platform | Elastic Integration | Fleet Policy | Data Stream |
|---|---|---|---|
| Windows | `windows` (System module) or `winlogbeat` | Deploy to all DCs and member servers | `logs-system.security*` or `logs-windows.forwarded*` |
| Okta | `okta` (Okta System Log) | Central integration server or Fleet | `logs-okta.system*` |
| Azure/Entra ID | `azure` (Sign-In Logs) | Central integration server or Fleet | `logs-azure.signinlogs*` |
| Linux | `system` (Auth module) | Deploy to all Linux servers | `logs-system.auth*` |

### Required Data Streams (Must Be Actively Ingesting)

Verify each data stream has recent events before enabling rules:

```
GET /_cat/indices/logs-system.security*?v&h=index,docs.count,store.size
GET /_cat/indices/logs-okta.system*?v&h=index,docs.count,store.size
GET /_cat/indices/logs-azure.signinlogs*?v&h=index,docs.count,store.size
GET /_cat/indices/logs-system.auth*?v&h=index,docs.count,store.size
```

### Required ECS Field Mapping Verification

Run the following queries to verify field population before enabling:

```
# Windows
GET logs-system.security*/_search
{"query":{"bool":{"must":[{"term":{"event.category":"authentication"}},{"exists":{"field":"winlog.event_id"}},{"exists":{"field":"user.name"}},{"exists":{"field":"source.ip"}}]}},"size":1}

# Okta
GET logs-okta.system*/_search
{"query":{"bool":{"must":[{"term":{"event.category":"authentication"}},{"exists":{"field":"user.name"}},{"exists":{"field":"event.outcome"}}]}},"size":1}
```

### Audit Policy Configuration (Windows)

Verify via Group Policy that the following audit subcategories are enabled on all domain controllers:

```
auditpol /get /subcategory:"Logon"
auditpol /get /subcategory:"Credential Validation"
auditpol /get /subcategory:"Kerberos Authentication Service"
```

All three should report `Success and Failure`.

### Minimum Kibana/Elasticsearch Version

- Elasticsearch 8.10+ (required for ES|QL `COUNT_IF` and `CONCAT` functions)
- Kibana 8.10+ (required for ES|QL rule type)
- Elastic Security 8.10+ (required for EQL sequence `with runs=` syntax)
- Tested against Elastic Security 9.4.2
