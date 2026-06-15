# M-26-14 Compliance Pack — Demo Guide

**Audience:** Demo presenters and self-directed technical evaluators  
**Time:** 15–20 minutes  
**Live cluster:** [m-26-14-7ae75d.kb.us-east-1.aws.found.io](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io)

---

## The Story

A civilian federal agency has deployed the M-26-14 Elastic compliance pack on their Elastic cluster. They are targeting Level 2 attestation this quarter and Level 3 by fiscal year-end.

Their environment:
- 60 total endpoints discovered — 55 managed, 5 network-discovered unknowns
- 25 macOS laptops, 20 Windows workstations, 10 Linux servers
- Managed via Elastic Agent + osquery; MDM enrollment via Intune for Windows/Mac
- **Current posture**: most things are healthy — a few gaps remain and the system is actively catching them

The demo walks through how the pack answers four compliance questions auditors actually ask:

| Act | Question | Time |
|-----|----------|------|
| 1 | Do we know everything that's on our network? | 4 min |
| 2 | Is every device healthy and authorized? | 5 min |
| 3 | Are we watching for threats across all Appendix B categories? | 4 min |
| 4 | Can we prove data is retained and has not been tampered with? | 4 min |

---

## Act 1 — "Do we know everything on our network?" *(4 min)*

**Open:** [HWAM Asset Inventory Overview](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-hwam-overview?_g=(time:(from:now-90d,to:now)))

### What to say

> "The first thing M-26-14 auditors ask is: can you show me every device that touches your network? Not just the ones you issued — everything. This dashboard answers that."

**Point to the KPI row:**
- **Element 1 Covered: 55** — every managed device has been inventoried via osquery. 100%.
- **Element 2 Covered: 55** — software inventory running on all of them.
- **Total Baseline Snapshots: 57** — we have a point-in-time configuration snapshot for every managed asset.

> "The system found 60 devices total. 55 are managed — issued and tracked. But 5 were found via network discovery alone. No agent, no MDM. The system flagged them automatically."

**Point to the Unmanaged Assets table** (bottom left):
- 5 UNKNOWN-* devices: Cisco, Ubiquiti, and unidentified hardware.
- These have no OS data, no owner, no compliance posture.

> "These could be rogue devices, shadow IT, or misconfigured equipment. M-26-14 requires you to either bring them under management or document why they're excluded. The pack surfaces them automatically."

**Click a row** in the Unmanaged table → Discover opens filtered to that device.

**Click back.** Point to OS Platform Distribution pie:
- macOS dominant (laptops), Windows workstations, Linux servers.

> "The asset breakdown confirms we're collecting across all three platforms — not just Windows."

---

## Act 2 — "Is every device healthy and authorized?" *(5 min)*

**Open:** [HWAM Coverage Gaps](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-hwam-gaps?_g=(time:(from:now-90d,to:now)))

### What to say

> "Knowing devices exist is step one. Step two is compliance posture — are they encrypted? Are they enrolled in MDM? Are they running current OS versions?"

**Point to the gap metrics:**
- **Unencrypted Managed Devices: 4** — four managed endpoints have disk encryption disabled or unknown.
- **Not MDM Enrolled: 4** — four managed endpoints are outside mobile device management.

> "Four unencrypted devices is a direct M-26-14 finding. The pack surfaces this instantly — no manual audit required."

**Click the "Unencrypted" metric tile** → Discover opens showing those 4 specific assets with their names, OS, and last-seen time.

> "The presenter clicks through to see exactly which devices are non-compliant. This is what you hand the ISO — not a spreadsheet, a live filtered view."

**Click back.** 

**Open:** [SWAM Software Inventory](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-swam-software?_g=(time:(from:now-90d,to:now)))

> "M-26-14 also requires software asset management — you must know what's installed and whether it's authorized. This is SWAM."

**Point to Authorized vs Unauthorized metrics:**
- Authorized installs: CrowdStrike Falcon, Elastic Agent, Cisco AnyConnect, Google Chrome, Microsoft Office 365, Microsoft Teams — 18 endpoints each.
- **Unauthorized: 2 titles found** — VLC media player and 7-Zip, 3 endpoints each.

> "Six titles are pre-approved for this agency. Two are not. 7-Zip and VLC appear on 3 endpoints each — that's a gap. The system caught it without a manual software audit."

**Click "VLC media player" in the Unauthorized table** → Discover opens showing which endpoints.

**Click back.**

**Open:** [Config Drift & Compliance Posture](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-asset-drift?_g=(time:(from:now-90d,to:now)))

> "One of the hardest things to prove in a continuous monitoring audit is configuration integrity — that devices haven't silently changed since you last certified them."

**Point to the Drifted Assets metric: 4**

> "When the pack first runs, it captures a cryptographic baseline hash of each device — OS version, disk encryption status, serial number. Any time that hash changes on a running device, it gets flagged. Four assets have drifted from their baseline."

**Click the Drifted count tile** → Discover shows LAPTOP-001, WKSTN-003, WKSTN-013, WKSTN-015 with their baseline timestamps.

> "These devices changed after they were baselined. Could be an OS update, could be a policy violation, could be something worse. Either way, the system caught it."

**Point to the Total Baseline Snapshots metric and the Recent Baseline Snapshots table** at the bottom:
> "Every managed device has a stored baseline. This table shows the most recent snapshot times — that's your audit trail."

---

## Act 3 — "Are we watching for threats across all Appendix B categories?" *(4 min)*

**Open:** [Alert Coverage (Appendix B)](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-alert-coverage?_g=(time:(from:now-30d,to:now)))

### What to say

> "M-26-14 Appendix B defines 11 required event categories — everything from authentication logs to network traffic to DNS. You need detection coverage across all of them."

**Point to the coverage metrics:**
- Active Detection Rules by Category.
- Alerts firing by category over the last 30 days.

> "The pack ships with detection rules pre-mapped to each Appendix B category. This view shows which categories have active rules firing — and which have gaps."

**Click a bar** in the Active Rules chart → Discover opens filtered to that category's rules.

**Click back.**

**Open:** [Appendix B Coverage Matrix](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-appendix-b-coverage?_g=(time:(from:now-30d,to:now)))

> "The coverage matrix is what you bring to the auditor. It maps every Appendix B category to whether you have collection, active rules, and recent alert activity."

**Point to categories with vs without coverage.**

> "Categories shown in green have all three: collection, detection, and evidence of recent activity. Anything yellow or red is a gap that needs to be addressed before attestation."

---

## Act 4 — "Can we prove data is retained and hasn't been tampered with?" *(4 min)*

**Open:** [Retention Compliance](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-retention-compliance?_g=(time:(from:now-30d,to:now)))

### What to say

> "THIRF requires that compliance logs are retained for at least six months. Level 3 requires three months of *searchable* data — not just archived, actually queryable. This dashboard proves it."

**Point to the searchable/retrievable bars:**
- Each data stream shown with days searchable vs days retrievable.
- ILM policy tiers visible.

> "The green bars are searchable on hot nodes — immediate query, no restore latency. The full bar including frozen tier is the total retention window. The ILM policies ship pre-configured; this is what they look like in practice."

**Open:** [Log Management (Element 5)](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-log-management?_g=(time:(from:now-30d,to:now)))

> "M-26-14 also requires log integrity — you have to prove logs haven't been modified after collection. The pack does this by computing a hash of each log document at ingest and storing it in a tamper-evident index."

**Point to Hash Coverage by Host chart:**
> "Every host that's reporting logs gets a coverage bar here. You can see which hosts are hashing and which aren't — gaps here are a compliance finding."

**Click a bar** → Discover opens filtered to that host's integrity records.

> "The ingest pipeline runs `m2614-log-integrity-hash` on every document. If someone modifies a log after the fact, the hash won't match. This is the audit trail."

---

## Closing — "What does the full posture look like?" *(1 min)*

**Open:** [Maturity Overview](https://m-26-14-7ae75d.kb.us-east-1.aws.found.io/app/dashboards#/view/m2614-maturity-overview?_g=(time:(from:now-30d,to:now)))

> "The Maturity Overview is the executive summary. It rolls up everything we just walked through into a single posture view — current maturity level, coverage percentages, and what's left to close before the next attestation."

**Point to the maturity level indicators and coverage KPIs.**

> "This is what the ISSO sees on Day 1 of deployment. Everything we walked through today — 15 minutes, live, against real data — is what the compliance officer sees every morning."

---

## Demo Tips

**Time-saving shortcuts:**
- Keep the cluster tab open in 90d range for asset dashboards; switch to 30d for compliance/alert dashboards
- Have Discover ready in a second tab — the drilldowns open new tabs by default
- The drilldowns on metrics (clickable tiles) are the strongest "wow" moments — use SWAM unauthorized and Config Drift drifted count

**If asked about the two-gate retirement workflow:**
> "The pack also handles data retirement with a two-gate approval system — frozen indices can't be deleted until a human approves Gate 1, ILM confirms a snapshot exists, and a second human approves Gate 2. That's in the Coverage Matrix under the THIRF column on the reference architecture site."

**If asked about the 5 unmanaged devices:**
> "Good question. Those UNKNOWN-* devices are network-discovered — the pack sees them via network scanning but there's no agent on them. In a real deployment you'd investigate each one: are they authorized IoT devices, rogue equipment, or decommissioned hardware still on the network? M-26-14 requires you to document the disposition."

**If asked about real agency data:**
> "This demo uses synthetic data — realistic fleet composition and posture spread, but no real agency information. The pack deploys identically against real Elastic Agent data; the dashboards, rules, and pipelines are environment-agnostic."
